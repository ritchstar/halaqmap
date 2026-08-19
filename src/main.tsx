/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { createRoot } from 'react-dom/client'
import type { ComponentType } from 'react'
import './index.css'
import { ensureDomainVerificationMeta } from '@/config/domainVerification'
import { PLATFORM_REWORK_NOTICE_AR, RootErrorBoundary } from '@/components/RootErrorBoundary'
import { initPlatformBuildSync } from '@/lib/platformBuildSync'
import { assertRuntimeEnvSafety } from '@/config/runtimeEnvGuard'
import { applyPlatformDocumentLocale } from '@/lib/platformLocale'

applyPlatformDocumentLocale()

// build-sync يُجدول بعد mount — يكتشف حزمة JS قديمة بعد النشر ويُحدّث PWA بأمان
import { PARTNER_ASSISTANT_UI_VERSION } from './lib/partnerAssistantUiVersion'
import { PARTNER_ASSISTANT_CHAT_API_PATH } from './lib/partnerAssistantRemote'

const CHUNK_RELOAD_ONCE_PREFIX = 'hm-chunk-reload-once:'
const DOM_GUARD_PATCH_FLAG = '__halaqmapDomGuardPatched'
const DOM_GUARD_LOG_KEY = 'hm-dom-guard-events-v1'
const APP_BOOTSTRAP_FLAG = '__halaqmapAppBootstrapped'
const APP_MOUNTED_FLAG = '__halaqmapAppMountedV1'
const BUILD_SYNC_SCHEDULED_FLAG = '__halaqmapBuildSyncScheduledV1'
function currentHashPath(): string {
  const raw = window.location.hash.replace(/^#/, '').split('?')[0]?.trim() || '/';
  const normalized = raw.replace(/\\/g, '/');
  return normalized.startsWith('/') ? normalized : `/${normalized}`;
}

/**
 * تنظيف هاش المسار قبل React Router:
 * - Windows/paste: #\ambassadors\enter → #/ambassadors/enter
 * - لصق شائع: #/ambassadors/dashboard= → #/ambassadors/dashboard
 * function declaration (hoisted) — لا ReferenceError حتى لو تغيّر ترتيب الاستدعاء.
 */
function normalizeLocationHash(): void {
  if (typeof window === 'undefined') return;
  try {
    const { hash, pathname, search } = window.location;
    if (!hash || hash === '#') return;

    let next = hash.includes('\\') ? hash.replace(/\\/g, '/') : hash;
    const m = next.match(/^#([^?]*)(\?.*)?$/);
    if (m) {
      let pathPart = m[1] || '';
      const queryPart = m[2] || '';
      if (/=+$/.test(pathPart)) {
        pathPart = pathPart.replace(/=+$/, '');
      }
      next = `#${pathPart}${queryPart}`;
    }

    if (next !== hash) {
      window.history.replaceState(null, '', `${pathname}${search}${next}`);
    }
  } catch {
    /* لا تُسقط إقلاع المنصة بسبب تنظيف الهاش */
  }
}

/** اسم قديم (hoisted) — توافق مع أي حزمة/كاش ما زال يستدعي الاسم السابق */
function normalizeLocationHashSlashes(): void {
  normalizeLocationHash();
}

const LAB_STANDALONE_ROUTES: Record<string, () => Promise<{ default: ComponentType }>> = {
  '/lab/silent-star-camp': () => import('./pages/SilentStarCampLanding.tsx'),
  '/lab/desert-light-lock': () => import('./pages/DesertLightLockLanding.tsx'),
};

async function bootstrapLabStandalone(rootEl: HTMLElement): Promise<boolean> {
  const path = currentHashPath();
  const loader = LAB_STANDALONE_ROUTES[path];
  if (!loader) return false;

  const pageMod = await loader();
  const Page =
    (typeof pageMod.default === 'function' ? pageMod.default : undefined) ??
    (typeof (pageMod as unknown) === 'function'
      ? (pageMod as unknown as ComponentType)
      : undefined);
  if (!Page) {
    throw new Error('تعذّر تحميل صفحة المختبر');
  }
  createRoot(rootEl).render(
    <RootErrorBoundary>
      <Page />
    </RootErrorBoundary>,
  );
  markAppMounted();
  return true;
}
const ENABLE_DOM_GUARD = import.meta.env.VITE_ENABLE_DOM_GUARD === 'true'

function installDomMismatchGuard(): void {
  if (!ENABLE_DOM_GUARD || typeof window === 'undefined' || typeof Node === 'undefined') return

  const marker = window as Window & { [DOM_GUARD_PATCH_FLAG]?: boolean }
  if (marker[DOM_GUARD_PATCH_FLAG] === true) return
  marker[DOM_GUARD_PATCH_FLAG] = true

  const originalRemoveChild = Node.prototype.removeChild
  const isDomMismatchError = (error: unknown): boolean => {
    if (error instanceof DOMException && error.name === 'NotFoundError') return true
    if (error instanceof Error) {
      return /removeChild/i.test(error.message) || /not a child of this node/i.test(error.message)
    }
    return false
  }
  const recordGuardEvent = (
    phase: 'reroute' | 'catch',
    parent: Node,
    child: Node | null | undefined,
  ): void => {
    try {
      const payload = {
        phase,
        parentNode: parent.nodeName,
        childNode: child?.nodeName ?? 'unknown',
        path: `${window.location.pathname}${window.location.search}${window.location.hash}`,
        ts: Date.now(),
      }
      const current = JSON.parse(sessionStorage.getItem(DOM_GUARD_LOG_KEY) ?? '[]') as Array<Record<string, unknown>>
      current.push(payload)
      const trimmed = current.slice(-25)
      sessionStorage.setItem(DOM_GUARD_LOG_KEY, JSON.stringify(trimmed))
      window.dispatchEvent(new CustomEvent('halaqmap:dom-guard', { detail: payload }))
    } catch {
      // ignore diagnostics failures
    }
  }

  Node.prototype.removeChild = function patchedRemoveChild<T extends Node>(child: T): T {
    if (child && child.parentNode !== this) {
      if (import.meta.env.DEV) {
        console.warn('[halaqmap] DOM guard rerouted removeChild mismatch')
      }
      const actualParent = child.parentNode
      if (actualParent) {
        try {
          return originalRemoveChild.call(actualParent, child) as T
        } catch (error) {
          if (!isDomMismatchError(error)) throw error
          recordGuardEvent('reroute', this, child)
          return child
        }
      }
      recordGuardEvent('reroute', this, child)
      return child
    }
    try {
      return originalRemoveChild.call(this, child) as T
    } catch (error) {
      if (!isDomMismatchError(error)) throw error
      if (import.meta.env.DEV) {
        console.warn('[halaqmap] DOM guard caught runtime removeChild race', error)
      }
      recordGuardEvent('catch', this, child)
      return child
    }
  }
}

function currentRouteReloadKey(): string {
  return `${CHUNK_RELOAD_ONCE_PREFIX}${window.location.pathname}${window.location.search}${window.location.hash}`
}

function toErrorMessage(reason: unknown): string {
  if (typeof reason === 'string') return reason
  if (reason instanceof Error) return reason.message
  if (typeof reason === 'object' && reason !== null) {
    const msg = (reason as { message?: unknown }).message
    if (typeof msg === 'string') return msg
  }
  return ''
}

function isDynamicImportChunkError(reason: unknown): boolean {
  const msg = toErrorMessage(reason)
  return (
    /Failed to fetch dynamically imported module/i.test(msg) ||
    /Importing a module script failed/i.test(msg) ||
    /Unable to preload CSS/i.test(msg) ||
    /ChunkLoadError/i.test(msg) ||
    /Loading chunk [\w-]+ failed/i.test(msg) ||
    /reading ['"]default['"]/i.test(msg) ||
    /failed to load$/i.test(msg)
  )
}

function reloadOnceForChunkError(): void {
  try {
    const key = currentRouteReloadKey()
    if (sessionStorage.getItem(key)) return
    sessionStorage.setItem(key, '1')
  } catch {
    // ignore storage errors and still attempt reload
  }
  window.location.reload()
}

function renderBootstrapFailure(rootEl: HTMLElement, reason: unknown): void {
  const showTechDetails = import.meta.env.DEV
  const message = showTechDetails
    ? toErrorMessage(reason) || 'حدث خطأ غير متوقع أثناء تشغيل المنصة.'
    : PLATFORM_REWORK_NOTICE_AR
  const stack =
    showTechDetails && reason instanceof Error && typeof reason.stack === 'string'
      ? reason.stack.split('\n').slice(0, 7).join('\n')
      : null
  const debugInfo = (() => {
    if (!showTechDetails) return null
    if (reason instanceof Error) {
      return `name: ${reason.name}\nmessage: ${reason.message}`
    }
    if (typeof reason === 'object' && reason !== null) {
      try {
        const withKnown = reason as { name?: unknown; message?: unknown; stack?: unknown }
        return [
          `type: object`,
          withKnown.name ? `name: ${String(withKnown.name)}` : null,
          withKnown.message ? `message: ${String(withKnown.message)}` : null,
          withKnown.stack ? `stack: ${String(withKnown.stack).split('\n').slice(0, 4).join('\n')}` : null,
        ]
          .filter(Boolean)
          .join('\n')
      } catch {
        return 'type: object'
      }
    }
    return `type: ${typeof reason}\nvalue: ${String(reason)}`
  })()
  createRoot(rootEl).render(
    <div
      dir="rtl"
      className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-[#061223] px-6 text-center text-slate-100"
    >
      <p className="text-lg font-bold text-rose-300">{PLATFORM_REWORK_NOTICE_AR}</p>
      {showTechDetails ? <p className="max-w-md text-sm text-slate-400">{message}</p> : null}
      {debugInfo ? (
        <pre
          dir="ltr"
          className="max-w-3xl overflow-auto rounded-xl border border-white/10 bg-black/20 p-3 text-left text-[11px] leading-5 text-slate-400"
        >
          {debugInfo}
        </pre>
      ) : null}
      {stack ? (
        <pre
          dir="ltr"
          className="max-w-3xl overflow-auto rounded-xl border border-white/10 bg-black/30 p-4 text-left text-[11px] leading-5 text-slate-300"
        >
          {stack}
        </pre>
      ) : null}
      <button
        type="button"
        className="rounded-xl border border-cyan-400/40 bg-cyan-500/10 px-5 py-2 text-sm font-semibold text-cyan-200"
        onClick={() => {
          try {
            if ('serviceWorker' in navigator) {
              void navigator.serviceWorker.getRegistrations().then((regs) =>
                Promise.all(regs.map((r) => r.unregister())),
              )
            }
            if ('caches' in window) {
              void caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
            }
          } catch {
            /* ignore */
          }
          window.location.reload()
        }}
      >
        إعادة التحميل
      </button>
    </div>,
  )
  markAppMounted()
}

if (typeof window !== 'undefined') {
  window.addEventListener('vite:preloadError', () => {
    // لا preventDefault: Vite عند الإلغاء يُرجع undefined من __vitePreload
    // فيصبح (undefined).default → شاشة «كاش قديم» بعد أول إعادة تحميل.
    reloadOnceForChunkError()
  })

  window.addEventListener('unhandledrejection', (event) => {
    if (!isDynamicImportChunkError(event.reason)) return
    event.preventDefault()
    reloadOnceForChunkError()
  })

  window.addEventListener('error', (event) => {
    const scriptErrorLike =
      isDynamicImportChunkError(event.error ?? event.message) ||
      (typeof event.filename === 'string' && /\/assets\/.+\.(js|css)(\?|$)/i.test(event.filename))
    if (!scriptErrorLike) return
    event.preventDefault()
    reloadOnceForChunkError()
  }, true)
}

if (import.meta.env.DEV) {
  console.info(`[halaqmap] Partner assistant UI v${PARTNER_ASSISTANT_UI_VERSION}`)
  void fetch(PARTNER_ASSISTANT_CHAT_API_PATH, { method: 'GET' })
    .then(async (r) => {
      const j = (await r.json().catch(() => ({}))) as Record<string, unknown>
      console.info('[halaqmap] partner-assistant-chat GET', { status: r.status, body: j })
    })
    .catch((err) => {
      console.warn('[halaqmap] partner-assistant-chat GET failed (تأكد من proxy /api في التطوير)', err)
    })
}

function isPartnerAdsLandingPath(): boolean {
  const hashPath = currentHashPath();
  const path = (window.location.pathname || '').replace(/\/+$/, '') || '/';
  return (
    hashPath === '/partners' ||
    hashPath === '/partners/register' ||
    hashPath.startsWith('/partners/register/') ||
    path === '/partners' ||
    path === '/partners/register' ||
    path.startsWith('/partners/register/')
  );
}

function markAppMounted(): void {
  const bootMarker = window as Window & { [APP_MOUNTED_FLAG]?: boolean }
  if (bootMarker[APP_MOUNTED_FLAG] === true) return
  bootMarker[APP_MOUNTED_FLAG] = true
  window.dispatchEvent(new CustomEvent('halaqmap:mounted'))
}

function schedulePlatformBuildSync(): void {
  if (typeof window === 'undefined') return
  const flags = window as Window & { [BUILD_SYNC_SCHEDULED_FLAG]?: boolean }
  if (flags[BUILD_SYNC_SCHEDULED_FLAG] === true) return
  flags[BUILD_SYNC_SCHEDULED_FLAG] = true

  const run = () => {
    try {
      initPlatformBuildSync()
    } catch {
      // build-sync is best-effort and must never delay initial rendering
    }
  }

  const scheduleIdle = () => {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(run, { timeout: 6000 })
      return
    }
    globalThis.setTimeout(run, 3500)
  }

  if (document.readyState === 'complete') {
    scheduleIdle()
    return
  }

  window.addEventListener('load', scheduleIdle, { once: true })
}

function signalBootStarted(): void {
  if (typeof window === 'undefined') return
  const w = window as Window & { __halaqmapBootStartedV1?: boolean }
  if (w.__halaqmapBootStartedV1 === true) return
  w.__halaqmapBootStartedV1 = true
  window.dispatchEvent(new CustomEvent('halaqmap:boot-started'))
}

async function bootstrapApp(rootEl: HTMLElement): Promise<void> {
  const bootMarker = window as Window & {
    [APP_BOOTSTRAP_FLAG]?: boolean
    [APP_MOUNTED_FLAG]?: boolean
  }
  if (!bootMarker[APP_BOOTSTRAP_FLAG]) {
    bootMarker[APP_BOOTSTRAP_FLAG] = true
    signalBootStarted()
    try {
      // كلا الاسمين متوفران (hoisted) — لا تعتمد على اسم واحد فقط بعد إعادة التسمية
      normalizeLocationHash()
      normalizeLocationHashSlashes()
      ensureDomainVerificationMeta()
      assertRuntimeEnvSafety()
      void import('@/lib/analytics/productAnalytics').then((m) => m.initProductAnalytics())
      installDomMismatchGuard()

      if (await bootstrapLabStandalone(rootEl)) {
        return
      }

      // بعض بنى Vite تحوّل default إلى named داخل chunk مشترك — لا تعتمد على .default فقط.
      const appMod = (await import('./App.tsx')) as {
        default?: ComponentType
        App?: ComponentType
      } & Record<string, unknown>
      const AppComponent =
        (typeof appMod.default === 'function' ? appMod.default : undefined) ??
        (typeof appMod.App === 'function' ? appMod.App : undefined) ??
        (typeof appMod === 'function' ? (appMod as unknown as ComponentType) : undefined)
      if (!AppComponent) {
        throw new Error('تعذّر تحميل مكوّن التطبيق (App module has no component export)')
      }
      createRoot(rootEl).render(
        <RootErrorBoundary>
          <AppComponent />
        </RootErrorBoundary>,
      )
      // أوقف watchdog فور استدعاء React — لا تنتظر DOM (Suspense/الجوال البطيء)
      markAppMounted()
      schedulePlatformBuildSync();
      if (isPartnerAdsLandingPath()) {
        // هبوط الإعلانات يجب أن يبقى من الشبكة مباشرة — عامل الخدمة يُظهر
        // شريط «إعادة التحميل للتحديث» ويخلط أجيال الحزم حتى في نافذة خاصة.
        if ('serviceWorker' in navigator) {
          void navigator.serviceWorker.getRegistrations().then((regs) =>
            Promise.all(regs.map((r) => r.unregister().catch(() => undefined))),
          );
        }
      } else {
        void import('@/lib/registerAppServiceWorker').then((m) => m.registerAppServiceWorker());
      }
    } catch (error) {
      if (isDynamicImportChunkError(error)) {
        reloadOnceForChunkError()
        return
      }
      console.error('[halaqmap] App bootstrap failed', error)
      renderBootstrapFailure(rootEl, error)
    }
  } else if (import.meta.env.DEV) {
    console.warn('[halaqmap] Duplicate bootstrap prevented')
  }
}

const rootEl = document.getElementById('root')
if (rootEl) {
  void bootstrapApp(rootEl)
}
