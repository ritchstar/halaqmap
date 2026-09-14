/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * غلاف حول محرك Stockfish الحقيقي (WASM/asm.js، بناء خفيف أحادي الخيط —
 * بلا حاجة لـ SharedArrayBuffer أو ترويسات COOP/COEP خاصة) عبر Web Worker.
 *
 * الملفات تُنسخ تلقائياً من حزمة npm `stockfish` إلى public/stockfish عبر
 * سكربت postinstall (راجع scripts/copy-stockfish-assets.mjs) — لأن اسم
 * ملف الدخول الفعلي يختلف بين إصدارات الحزمة، هذا الغلاف يجرّب عدة أسماء
 * مرشّحة شائعة بدل افتراض اسم واحد بعينه.
 *
 * أي فشل في أي خطوة (لا يوجد ملف، Worker لا يستجيب، مهلة انتهت) يُعيد
 * null بهدوء — المستدعي (chessEngine.ts) يتراجع تلقائياً للمحرك المحلي
 * في chessAi.ts. اللعبة لا تنكسر أبداً بسبب Stockfish.
 */

const CANDIDATE_ENTRY_FILES = [
  'stockfish.js',
  'stockfish.wasm.js',
  'stockfish-nnue-16-single.js',
  'stockfish-nnue-16.js',
  'stockfish.asm.js',
] as const;

const STOCKFISH_PUBLIC_DIR = '/stockfish/';
const HANDSHAKE_TIMEOUT_MS = 4000;

export interface StockfishMoveResult {
  from: string;
  to: string;
  promotion?: string;
}

let workerPromise: Promise<Worker | null> | null = null;

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof Worker !== 'undefined';
}

async function resolveWorkerUrl(): Promise<string | null> {
  for (const name of CANDIDATE_ENTRY_FILES) {
    const url = `${STOCKFISH_PUBLIC_DIR}${name}`;
    try {
      const res = await fetch(url, { method: 'HEAD' });
      if (res.ok) return url;
    } catch {
      // تجاهل والمتابعة للمرشح التالي.
    }
  }
  return null;
}

function waitForToken(worker: Worker, token: string, timeoutMs: number): Promise<boolean> {
  return new Promise((resolve) => {
    let settled = false;
    const timeout = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      worker.removeEventListener('message', onMessage);
      resolve(false);
    }, timeoutMs);

    function onMessage(e: MessageEvent) {
      const line = typeof e.data === 'string' ? e.data : '';
      if (line.includes(token)) {
        if (settled) return;
        settled = true;
        window.clearTimeout(timeout);
        worker.removeEventListener('message', onMessage);
        resolve(true);
      }
    }

    worker.addEventListener('message', onMessage);
  });
}

async function createReadyWorker(): Promise<Worker | null> {
  if (!isBrowser()) return null;

  const url = await resolveWorkerUrl();
  if (!url) return null;

  try {
    const worker = new Worker(url);
    const errored = new Promise<boolean>((resolve) => {
      worker.addEventListener('error', () => resolve(true), { once: true });
    });

    worker.postMessage('uci');
    const uciReady = await Promise.race([waitForToken(worker, 'uciok', HANDSHAKE_TIMEOUT_MS), errored]);
    if (!uciReady) {
      worker.terminate();
      return null;
    }

    worker.postMessage('isready');
    const isReady = await Promise.race([waitForToken(worker, 'readyok', HANDSHAKE_TIMEOUT_MS), errored]);
    if (!isReady) {
      worker.terminate();
      return null;
    }

    return worker;
  } catch {
    return null;
  }
}

function getWorker(): Promise<Worker | null> {
  if (!workerPromise) {
    workerPromise = createReadyWorker();
  }
  return workerPromise;
}

/** يتحقق من توفر محرك Stockfish الحقيقي بلا حجب طويل — نتيجة يمكن استخدامها لعرض شارة الحالة. */
export async function isStockfishAvailable(): Promise<boolean> {
  const worker = await getWorker();
  return worker !== null;
}

/** يطلب أفضل نقلة من Stockfish للوضعية (FEN) الحالية. يعيد null عند أي تعذّر. */
export async function getStockfishMove(
  fen: string,
  opts: { movetimeMs: number; skillLevel: number },
): Promise<StockfishMoveResult | null> {
  const worker = await getWorker();
  if (!worker) return null;

  return new Promise((resolve) => {
    let settled = false;
    const timeout = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      worker.removeEventListener('message', onMessage);
      resolve(null);
    }, opts.movetimeMs + 3000);

    function onMessage(e: MessageEvent) {
      const line = typeof e.data === 'string' ? e.data : '';
      const match = /^bestmove\s+(\S+)/.exec(line);
      if (!match) return;
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      worker.removeEventListener('message', onMessage);

      const uciMove = match[1];
      if (!uciMove || uciMove === '(none)') {
        resolve(null);
        return;
      }
      resolve({
        from: uciMove.slice(0, 2),
        to: uciMove.slice(2, 4),
        promotion: uciMove.length > 4 ? uciMove.slice(4, 5) : undefined,
      });
    }

    worker.addEventListener('message', onMessage);
    worker.postMessage('ucinewgame');
    worker.postMessage(`setoption name Skill Level value ${Math.max(0, Math.min(20, opts.skillLevel))}`);
    worker.postMessage(`position fen ${fen}`);
    worker.postMessage(`go movetime ${Math.max(100, opts.movetimeMs)}`);
  });
}

/** ينهي عامل Stockfish إن كان قيد التشغيل — استدعِه عند مغادرة صفحة ساحة الشطرنج. */
export function terminateStockfish(): void {
  if (!workerPromise) return;
  void workerPromise.then((worker) => worker?.terminate());
  workerPromise = null;
}
