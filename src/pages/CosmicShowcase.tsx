/**
 * CosmicShowcase — استعراض تقني كوني لـ HALAQ MAP
 * Route: /cosmic
 *
 * 18+ طبقة بصرية متزامنة:
 * سديم · نجوم · شفق قطبي · شهب · أشعة نبضار · شبكة عصبية
 * ثقب دودي · انفجار نجمي · حلقات أينشتاين · أمطار بيانات
 * مذنبات · إزاحة لونية · شبكة منظور · باراكس الماوس
 * دورة ~120 ثانية
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Pre-computed star positions ──────────────────────────────────────────────
const TINY = Array.from({ length: 120 }, (_, i) => ({
  x: ((i * 67 + 13) % 100),
  y: ((i * 43 + 7) % 100),
  r: 0.5 + (i % 3) * 0.3,
  d: 2 + (i % 4),
  delay: (i % 7) * 0.7,
}));
const SMALL = Array.from({ length: 60 }, (_, i) => ({
  x: ((i * 89 + 31) % 100),
  y: ((i * 53 + 19) % 100),
  r: 1 + (i % 3) * 0.5,
  d: 3 + (i % 5),
  delay: (i % 6) * 0.9,
}));
const BRIGHT = Array.from({ length: 20 }, (_, i) => ({
  x: ((i * 113 + 47) % 100),
  y: ((i * 71 + 23) % 100),
  r: 2 + (i % 3),
  d: 4 + (i % 4),
  delay: (i % 5) * 1.2,
  color: ['#fff', '#7df3ff', '#ffcf77', '#c084fc', '#86efac'][i % 5],
}));

// ─── Neural network nodes ─────────────────────────────────────────────────────
const NODES = Array.from({ length: 18 }, (_, i) => ({
  x: 10 + ((i * 47 + 13) % 80),
  y: 10 + ((i * 61 + 7) % 80),
  id: i,
}));
const LINKS = NODES.flatMap((n, i) =>
  NODES.slice(i + 1, i + 4).map((m) => ({ from: n.id, to: m.id }))
).slice(0, 28);

// ─── Constellation points ──────────────────────────────────────────────────────
const CONSTS = [
  [20,15],[35,8],[50,20],[65,12],[80,18],
  [25,35],[45,30],[60,38],[75,28],
  [15,55],[38,50],[55,58],[72,52],[85,45],
];
const CONST_LINES = [
  [0,1],[1,2],[2,3],[3,4],[0,5],[1,5],[2,6],[3,6],[4,7],
  [5,9],[6,10],[7,11],[8,12],[9,10],[10,11],[11,12],[12,13],
];

// ─── Data rain characters ──────────────────────────────────────────────────────
const DATA_CHARS = '01アBالرياض10ABCXYZحلاق01マップ';
const RAIN_COLS = Array.from({ length: 22 }, (_, i) => ({
  x: (i / 22) * 100,
  speed: 8 + (i % 5) * 3,
  delay: (i * 0.7) % 8,
  chars: Array.from({ length: 18 }, (_, j) => DATA_CHARS[(i * 3 + j * 7) % DATA_CHARS.length]),
}));

export default function CosmicShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [shooters, setShooters] = useState<{ id: number; angle: number; startX: number; startY: number; dur: number; color: string }[]>([]);
  const [comets, setComets] = useState<{ id: number; x: number; y: number; angle: number; len: number; color: string }[]>([]);
  const [supernova, setSupernova] = useState(false);
  const [wormhole, setWormhole] = useState(false);
  const [chromatic, setChromatic] = useState(false);
  const [pixelBurst, setPixelBurst] = useState(false);
  const shootId = useRef(0);
  const cometId = useRef(0);

  // Mouse parallax
  const handleMouse = useCallback((e: MouseEvent) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;
    setMouse({ x, y });
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouse, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouse);
  }, [handleMouse]);

  // Shooting stars
  useEffect(() => {
    const COLORS = ['#fff', '#7df3ff', '#c084fc', '#fbbf24', '#86efac'];
    const add = () => {
      const id = ++shootId.current;
      const angle = -20 - Math.random() * 40;
      const startX = Math.random() * 80;
      const startY = Math.random() * 40;
      const dur = 0.8 + Math.random() * 1.2;
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      setShooters((p) => [...p.slice(-6), { id, angle, startX, startY, dur, color }]);
      setTimeout(() => setShooters((p) => p.filter((s) => s.id !== id)), dur * 1000 + 200);
    };
    const interval = setInterval(add, 2500 + Math.random() * 3500);
    add();
    return () => clearInterval(interval);
  }, []);

  // Comets
  useEffect(() => {
    const COLS = ['#7df3ff88', '#c084fc88', '#fbbf2488'];
    const add = () => {
      const id = ++cometId.current;
      const x = Math.random() * 100;
      const y = Math.random() * 60;
      const angle = 10 + Math.random() * 30;
      const len = 80 + Math.random() * 120;
      const color = COLS[Math.floor(Math.random() * COLS.length)];
      setComets((p) => [...p.slice(-4), { id, x, y, angle, len, color }]);
      setTimeout(() => setComets((p) => p.filter((c) => c.id !== id)), 4000);
    };
    const interval = setInterval(add, 8000 + Math.random() * 6000);
    return () => clearInterval(interval);
  }, []);

  // Periodic effects
  useEffect(() => {
    // Supernova every 30s
    const sn = setInterval(() => {
      setSupernova(true);
      setTimeout(() => setSupernova(false), 1800);
    }, 30000);
    setTimeout(() => { setSupernova(true); setTimeout(() => setSupernova(false), 1800); }, 5000);

    // Wormhole every 45s
    const wh = setInterval(() => {
      setWormhole(true);
      setTimeout(() => setWormhole(false), 5000);
    }, 45000);
    setTimeout(() => { setWormhole(true); setTimeout(() => setWormhole(false), 5000); }, 18000);

    // Chromatic aberration every 20s
    const ch = setInterval(() => {
      setChromatic(true);
      setTimeout(() => setChromatic(false), 800);
    }, 20000);

    // Pixel burst every 35s
    const pb = setInterval(() => {
      setPixelBurst(true);
      setTimeout(() => setPixelBurst(false), 2500);
    }, 35000);

    return () => { clearInterval(sn); clearInterval(wh); clearInterval(ch); clearInterval(pb); };
  }, []);

  const px = mouse.x, py = mouse.y;

  return (
    <div ref={containerRef}
      className="relative h-screen w-screen overflow-hidden"
      style={{ background: '#000005', fontFamily: 'system-ui' }}>

      {/* ══ CSS KEYFRAMES ══════════════════════════════════════════════════ */}
      <style>{`
        @keyframes twinkle {
          0%,100%{opacity:.2;transform:scale(1)}
          50%{opacity:1;transform:scale(1.4)}
        }
        @keyframes nebula-float {
          0%,100%{transform:translate(0,0) scale(1);opacity:.55}
          33%{transform:translate(3%,2%) scale(1.08);opacity:.7}
          66%{transform:translate(-2%,3%) scale(.95);opacity:.45}
        }
        @keyframes aurora-wave {
          0%{transform:translateX(-10%) scaleY(1);filter:hue-rotate(0deg)}
          50%{transform:translateX(8%) scaleY(1.3);filter:hue-rotate(60deg)}
          100%{transform:translateX(-10%) scaleY(1);filter:hue-rotate(0deg)}
        }
        @keyframes pulsar-spin {
          from{transform:rotate(0deg)}
          to{transform:rotate(360deg)}
        }
        @keyframes orbit-3d-1 {
          from{transform:rotateX(75deg) rotateZ(0deg)}
          to{transform:rotateX(75deg) rotateZ(360deg)}
        }
        @keyframes orbit-3d-2 {
          from{transform:rotateX(60deg) rotateZ(120deg)}
          to{transform:rotateX(60deg) rotateZ(480deg)}
        }
        @keyframes orbit-3d-3 {
          from{transform:rotateX(80deg) rotateZ(240deg)}
          to{transform:rotateX(80deg) rotateZ(600deg)}
        }
        @keyframes text-breathe {
          0%,100%{
            text-shadow:0 0 7px #fff,0 0 20px #0ff,0 0 40px #0ff,0 0 80px #0ff,0 0 120px #05f;
            filter:brightness(1)
          }
          50%{
            text-shadow:0 0 10px #fff,0 0 30px #0ff,0 0 70px #0ff,0 0 130px #0ff,0 0 200px #05f,0 0 250px #8b00ff;
            filter:brightness(1.3)
          }
        }
        @keyframes shoot {
          0%{opacity:0;transform:translateX(0) translateY(0)}
          5%{opacity:1}
          80%{opacity:.8}
          100%{opacity:0;transform:translateX(120vw) translateY(60vh)}
        }
        @keyframes comet-move {
          0%{opacity:0;transform:translateX(0)}
          10%{opacity:1}
          90%{opacity:.6}
          100%{opacity:0;transform:translateX(100vw)}
        }
        @keyframes supernova-expand {
          0%{opacity:0;transform:scale(0)}
          15%{opacity:1;transform:scale(1)}
          40%{opacity:.9;transform:scale(1.5)}
          100%{opacity:0;transform:scale(4)}
        }
        @keyframes wormhole-spin {
          0%{transform:scale(0) rotate(0deg);opacity:0}
          20%{transform:scale(1) rotate(180deg);opacity:1}
          80%{transform:scale(1.1) rotate(900deg);opacity:.8}
          100%{transform:scale(0) rotate(1800deg);opacity:0}
        }
        @keyframes einstein-ring {
          0%{transform:scale(0);opacity:.8}
          100%{transform:scale(3.5);opacity:0}
        }
        @keyframes data-fall {
          0%{transform:translateY(-120%);opacity:0}
          5%{opacity:.7}
          95%{opacity:.4}
          100%{transform:translateY(120vh);opacity:0}
        }
        @keyframes neural-pulse {
          0%,100%{stroke-opacity:.15;stroke-dashoffset:100}
          50%{stroke-opacity:.6;stroke-dashoffset:0}
        }
        @keyframes grid-breathe {
          0%,100%{opacity:.08}
          50%{opacity:.18}
        }
        @keyframes chroma-split {
          0%{text-shadow:-6px 0 10px #f00,6px 0 10px #00f,0 0 40px #0ff}
          50%{text-shadow:-10px 0 20px #f00,10px 0 20px #00f,0 0 60px #0ff}
          100%{text-shadow:-6px 0 10px #f00,6px 0 10px #00f,0 0 40px #0ff}
        }
        @keyframes pixel-burst {
          0%{letter-spacing:0px;opacity:1;filter:blur(0)}
          30%{letter-spacing:12px;opacity:.6;filter:blur(4px)}
          60%{letter-spacing:24px;opacity:.2;filter:blur(8px)}
          80%{letter-spacing:0px;opacity:.8;filter:blur(2px)}
          100%{letter-spacing:0px;opacity:1;filter:blur(0)}
        }
        @keyframes solar-flare {
          0%,100%{opacity:0;transform:scale(.5)}
          15%{opacity:.9;transform:scale(1)}
          80%{opacity:.4;transform:scale(2)}
        }
        @keyframes hue-cycle {
          from{filter:hue-rotate(0deg)}
          to{filter:hue-rotate(360deg)}
        }
        @keyframes const-draw {
          0%{stroke-dashoffset:300}
          100%{stroke-dashoffset:0}
        }
      `}</style>

      {/* ══ LAYER 1 — Nebula Clouds ═════════════════════════════════════════ */}
      <div className="pointer-events-none absolute inset-0"
        style={{ transform: `translate(${px * -12}px, ${py * -8}px)` }}>
        {[
          { x: 15, y: 20, w: 55, h: 45, color: '#0ff', hue: 190, dur: 18 },
          { x: 55, y: 10, w: 50, h: 40, color: '#8b00ff', hue: 280, dur: 22 },
          { x: 70, y: 50, w: 45, h: 55, color: '#00f', hue: 220, dur: 26 },
          { x: 5, y: 60, w: 40, h: 40, color: '#0f8', hue: 150, dur: 20 },
          { x: 40, y: 70, w: 50, h: 35, color: '#f0a', hue: 320, dur: 24 },
          { x: 80, y: 15, w: 35, h: 45, color: '#fa0', hue: 45, dur: 16 },
        ].map((n, i) => (
          <div key={i}
            style={{
              position: 'absolute',
              left: `${n.x}%`, top: `${n.y}%`,
              width: `${n.w}%`, height: `${n.h}%`,
              background: `radial-gradient(ellipse at center, ${n.color}22 0%, ${n.color}0a 40%, transparent 75%)`,
              filter: `blur(60px)`,
              animation: `nebula-float ${n.dur}s ease-in-out infinite`,
              animationDelay: `${i * -4}s`,
            }} />
        ))}
      </div>

      {/* ══ LAYER 2 — Star Field ════════════════════════════════════════════ */}
      <div className="pointer-events-none absolute inset-0"
        style={{ transform: `translate(${px * -6}px, ${py * -4}px)` }}>
        {TINY.map((s) => (
          <div key={s.x + '' + s.y} style={{
            position: 'absolute', left: `${s.x}%`, top: `${s.y}%`,
            width: `${s.r}px`, height: `${s.r}px`,
            borderRadius: '50%', background: '#fff',
            opacity: 0.3, animation: `twinkle ${s.d}s ease-in-out infinite`,
            animationDelay: `${s.delay}s`,
          }} />
        ))}
      </div>
      <div className="pointer-events-none absolute inset-0"
        style={{ transform: `translate(${px * -10}px, ${py * -7}px)` }}>
        {SMALL.map((s) => (
          <div key={'sm' + s.x + s.y} style={{
            position: 'absolute', left: `${s.x}%`, top: `${s.y}%`,
            width: `${s.r}px`, height: `${s.r}px`,
            borderRadius: '50%', background: '#fff',
            boxShadow: `0 0 ${s.r * 2}px #fff`,
            animation: `twinkle ${s.d}s ease-in-out infinite`,
            animationDelay: `${s.delay}s`,
          }} />
        ))}
      </div>
      <div className="pointer-events-none absolute inset-0"
        style={{ transform: `translate(${px * -18}px, ${py * -12}px)` }}>
        {BRIGHT.map((s) => (
          <div key={'br' + s.x + s.y} style={{
            position: 'absolute', left: `${s.x}%`, top: `${s.y}%`,
            width: `${s.r}px`, height: `${s.r}px`,
            borderRadius: '50%', background: s.color,
            boxShadow: `0 0 ${s.r * 4}px ${s.color}, 0 0 ${s.r * 8}px ${s.color}55`,
            animation: `twinkle ${s.d}s ease-in-out infinite`,
            animationDelay: `${s.delay}s`,
          }} />
        ))}
      </div>

      {/* ══ LAYER 3 — Aurora Borealis ═══════════════════════════════════════ */}
      <div className="pointer-events-none absolute inset-x-0 top-0"
        style={{ height: '45%', zIndex: 2 }}>
        {[
          { color: '#0ffb', y: 0, dur: 12, blur: 80 },
          { color: '#8b00ffaa', y: 5, dur: 16, blur: 100 },
          { color: '#00fa99', y: 10, dur: 14, blur: 90 },
          { color: '#0055ffbb', y: 2, dur: 18, blur: 110 },
        ].map((a, i) => (
          <div key={i} style={{
            position: 'absolute', inset: 0,
            top: `${a.y}%`, height: '60%',
            background: `linear-gradient(to bottom, ${a.color} 0%, transparent 100%)`,
            filter: `blur(${a.blur}px)`,
            animation: `aurora-wave ${a.dur}s ease-in-out infinite`,
            animationDelay: `${i * -3}s`,
            opacity: 0.6,
          }} />
        ))}
      </div>

      {/* ══ LAYER 4 — Perspective Grid ══════════════════════════════════════ */}
      <svg className="pointer-events-none absolute bottom-0 inset-x-0"
        style={{ height: '45%', width: '100%', animation: 'grid-breathe 8s ease-in-out infinite' }}
        viewBox="0 0 100 50" preserveAspectRatio="none">
        <defs>
          <linearGradient id="gridFade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0ff" stopOpacity="0" />
            <stop offset="60%" stopColor="#0ff" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#0ff" stopOpacity="0.06" />
          </linearGradient>
        </defs>
        {/* Horizontal lines */}
        {[10,20,30,40,50,60,70,80,90].map((y) => (
          <line key={`h${y}`} x1="0" y1={y * 0.5} x2="100" y2={y * 0.5} stroke="url(#gridFade)" strokeWidth="0.3" />
        ))}
        {/* Perspective vertical lines */}
        {[-60,-40,-20,0,20,40,60,80,100,120,140,160].map((x) => (
          <line key={`v${x}`} x1={50 + x * 0.5} y1="0" x2={50 + x * 2} y2="50" stroke="url(#gridFade)" strokeWidth="0.3" />
        ))}
      </svg>

      {/* ══ LAYER 5 — Constellation Lines ══════════════════════════════════ */}
      <svg className="pointer-events-none absolute inset-0"
        style={{ width: '100%', height: '100%', transform: `translate(${px * -20}px, ${py * -14}px)` }}
        viewBox="0 0 100 100" preserveAspectRatio="none">
        {CONST_LINES.map(([a, b], i) => (
          <line key={i}
            x1={CONSTS[a][0]} y1={CONSTS[a][1]}
            x2={CONSTS[b][0]} y2={CONSTS[b][1]}
            stroke="#0ff" strokeWidth="0.15" strokeOpacity="0.35"
            strokeDasharray="300" style={{ animation: `const-draw ${8 + i}s linear forwards`, animationDelay: `${i * 0.3}s` }}
          />
        ))}
        {CONSTS.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="0.6" fill="#0ff" opacity="0.7"
            style={{ animation: `twinkle ${3 + i % 3}s ease-in-out infinite`, animationDelay: `${i * 0.4}s` }} />
        ))}
      </svg>

      {/* ══ LAYER 6 — Neural Network ════════════════════════════════════════ */}
      <svg className="pointer-events-none absolute inset-0" style={{ width: '100%', height: '100%', opacity: 0.5 }}
        viewBox="0 0 100 100" preserveAspectRatio="none">
        {LINKS.map(({ from, to }, i) => (
          <line key={i}
            x1={NODES[from].x} y1={NODES[from].y}
            x2={NODES[to].x} y2={NODES[to].y}
            stroke="#8b00ff" strokeWidth="0.2"
            strokeDasharray="100" strokeDashoffset="100"
            style={{ animation: `neural-pulse ${5 + i % 4}s ease-in-out infinite`, animationDelay: `${i * 0.2}s` }} />
        ))}
        {NODES.map((n) => (
          <circle key={n.id} cx={n.x} cy={n.y} r="0.8" fill="#c084fc" opacity="0.6"
            style={{ animation: `twinkle ${2 + n.id % 3}s ease-in-out infinite`, animationDelay: `${n.id * 0.3}s` }} />
        ))}
      </svg>

      {/* ══ LAYER 7 — Pulsar Beams ══════════════════════════════════════════ */}
      <div className="pointer-events-none absolute" style={{ left: '50%', top: '50%', zIndex: 3 }}>
        {[0, 60, 120, 180, 240, 300].map((deg, i) => (
          <div key={i} style={{
            position: 'absolute', left: 0, top: 0,
            width: '55vw', height: '1px',
            background: `linear-gradient(to right, transparent, ${['#0ff', '#8b00ff', '#0f8', '#fa0', '#f0a', '#05f'][i]}55, transparent)`,
            transform: `rotate(${deg}deg)`,
            transformOrigin: '0 50%',
            animation: `pulsar-spin ${18 + i * 2}s linear infinite`,
            animationDelay: `${i * -3}s`,
            filter: 'blur(1px)',
          }} />
        ))}
      </div>

      {/* ══ LAYER 8 — Orbit Rings ═══════════════════════════════════════════ */}
      <div className="pointer-events-none absolute" style={{ left: '50%', top: '50%', zIndex: 4 }}>
        {[
          { w: 340, h: 340, anim: 'orbit-3d-1', dur: 14, color: '#0ff' },
          { w: 460, h: 460, anim: 'orbit-3d-2', dur: 20, color: '#8b00ff' },
          { w: 580, h: 580, anim: 'orbit-3d-3', dur: 28, color: '#0f8' },
        ].map((r, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: `${r.w}px`, height: `${r.h}px`,
            left: `-${r.w / 2}px`, top: `-${r.h / 2}px`,
            borderRadius: '50%',
            border: `1px solid ${r.color}40`,
            boxShadow: `0 0 12px ${r.color}25, inset 0 0 12px ${r.color}15`,
            animation: `${r.anim} ${r.dur}s linear infinite`,
          }}>
            {/* Moving dot on ring */}
            <div style={{
              position: 'absolute', top: -4, left: '50%',
              width: 8, height: 8, borderRadius: '50%',
              background: r.color, boxShadow: `0 0 16px ${r.color}, 0 0 30px ${r.color}88`,
            }} />
          </div>
        ))}
      </div>

      {/* ══ LAYER 9 — Data Rain ══════════════════════════════════════════════ */}
      <div className="pointer-events-none absolute inset-0" style={{ zIndex: 2 }}>
        {RAIN_COLS.map((col, ci) => (
          <div key={ci} style={{
            position: 'absolute', left: `${col.x}%`, top: 0,
            display: 'flex', flexDirection: 'column', gap: '4px',
            animation: `data-fall ${col.speed}s linear infinite`,
            animationDelay: `${col.delay}s`,
            fontFamily: 'monospace', fontSize: '11px',
            color: '#0ff', opacity: 0.12,
            writingMode: 'vertical-rl',
          }}>
            {col.chars.map((c, i) => (
              <span key={i} style={{ opacity: 1 - i / col.chars.length }}>{c}</span>
            ))}
          </div>
        ))}
      </div>

      {/* ══ LAYER 10 — Solar Flares ════════════════════════════════════════ */}
      <div className="pointer-events-none absolute" style={{ left: '50%', top: '50%', zIndex: 3 }}>
        {[45, 135, 225, 315].map((deg, i) => (
          <div key={i} style={{
            position: 'absolute', width: '30vw', height: '3px',
            background: `linear-gradient(to right, #ffa500cc, transparent)`,
            transform: `rotate(${deg}deg)`,
            transformOrigin: '0 50%',
            animation: `solar-flare ${12 + i * 3}s ease-in-out infinite`,
            animationDelay: `${i * -4}s`,
            filter: 'blur(2px)',
          }} />
        ))}
      </div>

      {/* ══ LAYER 11 — Shooting Stars ═══════════════════════════════════════ */}
      {shooters.map((s) => (
        <div key={s.id} style={{
          position: 'absolute', left: `${s.startX}%`, top: `${s.startY}%`,
          width: '160px', height: '2px',
          background: `linear-gradient(to right, transparent, ${s.color}, ${s.color}ff)`,
          boxShadow: `0 0 8px ${s.color}, 0 0 16px ${s.color}66`,
          transform: `rotate(${s.angle}deg)`,
          transformOrigin: 'left center',
          animation: `shoot ${s.dur}s ease-out forwards`,
          zIndex: 10,
          filter: 'blur(0.5px)',
        }} />
      ))}

      {/* ══ LAYER 12 — Comet Trails ═════════════════════════════════════════ */}
      {comets.map((c) => (
        <div key={c.id} style={{
          position: 'absolute', left: `${c.x}%`, top: `${c.y}%`,
          width: `${c.len}px`, height: '3px',
          background: `linear-gradient(to right, transparent 0%, ${c.color} 40%, white 100%)`,
          transform: `rotate(${c.angle}deg)`,
          animation: 'comet-move 4s ease-in-out forwards',
          zIndex: 9,
          filter: 'blur(1px)',
        }}>
          {/* Particle tail */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              right: `${i * 12}px`, top: `${(i % 3) - 1}px`,
              width: `${4 - i * 0.4}px`, height: `${4 - i * 0.4}px`,
              borderRadius: '50%', background: c.color,
              opacity: 1 - i / 8,
            }} />
          ))}
        </div>
      ))}

      {/* ══ LAYER 13 — Einstein Rings ═══════════════════════════════════════ */}
      <div className="pointer-events-none absolute" style={{ left: '50%', top: '50%', zIndex: 5 }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{
            position: 'absolute', borderRadius: '50%',
            width: `${100 * i}px`, height: `${100 * i}px`,
            left: `${-50 * i}px`, top: `${-50 * i}px`,
            border: '1px solid #0ff',
            boxShadow: `0 0 12px #0ff44`,
            animation: `einstein-ring ${6 + i}s ease-out infinite`,
            animationDelay: `${i * 1.5}s`,
          }} />
        ))}
      </div>

      {/* ══ LAYER 14 — Wormhole (periodic) ═════════════════════════════════ */}
      <AnimatePresence>
        {wormhole && (
          <motion.div
            style={{
              position: 'absolute', left: '50%', top: '50%',
              width: '300px', height: '300px',
              marginLeft: '-150px', marginTop: '-150px',
              borderRadius: '50%',
              background: 'conic-gradient(from 0deg, #8b00ff, #0ff, #00f, #8b00ff)',
              zIndex: 20,
              filter: 'blur(8px)',
              animation: 'wormhole-spin 5s ease-in-out forwards',
              transformOrigin: 'center',
            }}
          />
        )}
      </AnimatePresence>

      {/* ══ LAYER 15 — Supernova (periodic) ════════════════════════════════ */}
      <AnimatePresence>
        {supernova && (
          <motion.div style={{
            position: 'fixed', inset: 0, zIndex: 30,
            background: 'radial-gradient(circle at center, #ffffffee 0%, #0ffaaa 30%, #8b00ff55 60%, transparent 80%)',
            animation: 'supernova-expand 1.8s ease-out forwards',
            pointerEvents: 'none',
          }} />
        )}
      </AnimatePresence>

      {/* ══ CENTRAL TEXT — HALAQ MAP ════════════════════════════════════════ */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center" style={{ zIndex: 15 }}>
        <div style={{ textAlign: 'center', transform: `translate(${px * 8}px, ${py * 6}px)` }}>
          {/* Glow halo behind text */}
          <div style={{
            position: 'absolute', inset: '-60px',
            background: 'radial-gradient(ellipse at center, #0ff18 0%, #8b00ff12 40%, transparent 70%)',
            filter: 'blur(40px)',
            borderRadius: '50%',
          }} />

          {/* Main text */}
          <h1 style={{
            fontSize: 'clamp(3rem, 9vw, 10rem)',
            fontFamily: '"Arial Black", "Impact", system-ui',
            fontWeight: '900',
            letterSpacing: '0.15em',
            color: '#fff',
            margin: 0,
            position: 'relative',
            animation: chromatic
              ? 'chroma-split 0.8s ease-in-out'
              : pixelBurst
              ? 'pixel-burst 2.5s ease-in-out'
              : 'text-breathe 4s ease-in-out infinite',
            textShadow: '0 0 7px #fff, 0 0 20px #0ff, 0 0 40px #0ff, 0 0 80px #0ff, 0 0 120px #05f, 0 0 180px #8b00ff',
            animationDuration: chromatic ? '0.8s' : pixelBurst ? '2.5s' : '4s',
          }}>
            HALAQ MAP
          </h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 2 }}
            style={{
              color: '#0ff', fontSize: '1rem', letterSpacing: '0.5em',
              marginTop: '1rem', fontFamily: 'monospace',
              textShadow: '0 0 10px #0ff', opacity: 0.65,
            }}>
            GEOGRAPHIC · INTELLIGENT · DIGITAL
          </motion.p>
        </div>
      </div>

      {/* ══ BOTTOM-LEFT TEXT ════════════════════════════════════════════════ */}
      <div className="absolute bottom-4 left-4" style={{ zIndex: 20 }}>
        <p style={{
          color: 'rgba(0,255,255,0.35)', fontSize: '0.65rem',
          fontFamily: 'monospace', letterSpacing: '0.15em',
          lineHeight: '1.6',
        }}>
          HALAQ MAP · حلاق ماب<br />
          On-Demand Visibility · KSA 2026<br />
          <span style={{ opacity: 0.5 }}>B2B Technology Platform · ISIC4 474151</span>
        </p>
      </div>

      {/* ══ TOP-RIGHT — Coordinates ═════════════════════════════════════════ */}
      <div className="absolute top-4 right-4" style={{ zIndex: 20, textAlign: 'right' }}>
        <p style={{ color: 'rgba(0,255,255,0.25)', fontSize: '0.6rem', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
          24.6877° N · 46.7219° E<br />
          <span style={{ opacity: 0.5 }}>RIYADH · SAUDI ARABIA</span>
        </p>
      </div>

      {/* ══ CENTER-BOTTOM — Waveform ═════════════════════════════════════════ */}
      <div className="absolute bottom-12 inset-x-0 flex justify-center" style={{ zIndex: 6 }}>
        <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
          {Array.from({ length: 40 }).map((_, i) => (
            <motion.div key={i}
              style={{ width: '2px', borderRadius: '1px', background: '#0ff' }}
              animate={{ height: [4, 8 + Math.sin(i * 0.4) * 16, 4] }}
              transition={{ duration: 1.2 + i * 0.05, repeat: Infinity, ease: 'easeInOut', delay: i * 0.04 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
