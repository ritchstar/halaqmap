/**
 * SaudiBackground — خلفية صفحة وكيل «سعودي» التفاعلية
 *
 * الطبقات (من الخلف للأمام):
 * 0. تدرج السماء — يتغيّر بالوقت الفعلي (توقيت الرياض)
 * 1. نجوم ونيازك — ليلاً فقط
 * 2. خريطة المملكة — مضلّع SVG شفاف
 * 3. نقاط المدن — متوهجة ونابضة
 * 4. دوائر الرادار — من مركز الخريطة
 * 5. جسيمات ذهبية/خضراء — تطفو باستمرار
 * 6. تفاعل المحادثة — موجة عند الإرسال، وميض عند الرد
 * CSS: ظلال نخيل يسار/يمين أسفل الشاشة
 */

import { useEffect, useRef, useCallback } from 'react';

type ChatEvent = 'sent' | 'received' | null;

interface Props {
  chatEvent?: ChatEvent;
}

// ─── وقت الرياض ───────────────────────────────────────────────────────────────
function getRiyadhHour(): number {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60_000;
  return new Date(utc + 3 * 3_600_000).getHours();
}

// ─── تدرج السماء حسب الوقت ────────────────────────────────────────────────────
function getSkyColors(h: number): [string, string, string] {
  if (h >= 4 && h < 6)  return ['#1a0510', '#3d1508', '#1a2808'];   // فجر
  if (h >= 6 && h < 9)  return ['#0a1f0f', '#1a3d12', '#0a2808'];   // صباح
  if (h >= 9 && h < 12) return ['#061510', '#0d2e14', '#051008'];   // ضحى
  if (h >= 12 && h < 15) return ['#050e08', '#0a1f0f', '#040c06'];  // ظهر
  if (h >= 15 && h < 17) return ['#0a1208', '#1a2808', '#0a1005'];  // عصر
  if (h >= 17 && h < 19) return ['#1a0a04', '#3d1a04', '#1a1008']; // مغرب
  if (h >= 19 && h < 21) return ['#0a0410', '#1a0820', '#0a0a08']; // عشاء
  return ['#020a0f', '#040e0a', '#020c06'];                          // ليل
}

// ─── نقاط مدن المملكة (x,y نسبة %) ──────────────────────────────────────────
// تقريب جغرافي: خط الطول 36°→56°E / العرض 16°→32°N على canvas
const CITIES = [
  { name: 'الرياض',  x: 0.57, y: 0.38, r: 4, color: '#fbbf24', primary: true },
  { name: 'جدة',    x: 0.26, y: 0.52, r: 3, color: '#34d399', primary: true },
  { name: 'مكة',    x: 0.27, y: 0.55, r: 3.5, color: '#a78bfa', primary: true },
  { name: 'المدينة', x: 0.29, y: 0.42, r: 2.5, color: '#6ee7b7', primary: false },
  { name: 'الدمام', x: 0.72, y: 0.32, r: 2.5, color: '#38bdf8', primary: false },
  { name: 'أبها',   x: 0.35, y: 0.64, r: 2,   color: '#86efac', primary: false },
  { name: 'تبوك',   x: 0.14, y: 0.28, r: 2,   color: '#fcd34d', primary: false },
  { name: 'نيوم',   x: 0.10, y: 0.30, r: 2.5, color: '#22d3ee', primary: false },
];

// مركز الرادار (وسط المملكة تقريباً)
const RADAR_CENTER = { x: 0.45, y: 0.44 };

// مضلّع المملكة المبسّط (نسب x,y)
const KSA_POLY = [
  [0.10,0.28],[0.14,0.22],[0.22,0.20],[0.30,0.20],[0.38,0.18],
  [0.48,0.18],[0.58,0.20],[0.68,0.22],[0.75,0.26],[0.82,0.30],
  [0.86,0.36],[0.84,0.42],[0.80,0.48],[0.74,0.52],[0.68,0.56],
  [0.62,0.60],[0.56,0.65],[0.50,0.70],[0.44,0.74],[0.38,0.72],
  [0.34,0.68],[0.30,0.63],[0.26,0.58],[0.20,0.53],[0.16,0.46],
  [0.12,0.40],[0.10,0.34],[0.10,0.28],
];

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  size: number;
  alpha: number;
  color: string;
  life: number;
  maxLife: number;
}

interface RadarRing {
  r: number;
  maxR: number;
  alpha: number;
  color: string;
  speed: number;
}

interface Star {
  x: number; y: number;
  size: number;
  twinkle: number;
  twinkleSpeed: number;
}

interface Meteor {
  x: number; y: number;
  vx: number; vy: number;
  len: number;
  alpha: number;
  active: boolean;
}

// ─── Component ─────────────────────────────────────────────────────────────────
export function SaudiBackground({ chatEvent = null }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    particles: [] as Particle[],
    radarRings: [] as RadarRing[],
    stars: [] as Star[],
    meteor: { active: false } as Meteor,
    burstX: 0, burstY: 0,
    burstAlpha: 0,
    burstColor: '#fbbf24',
    frame: 0,
    raf: 0,
    cityPulse: 0,
    lastMeteor: 0,
  });
  const chatEventRef = useRef<ChatEvent>(null);

  // ── إنشاء جسيم ──────────────────────────────────────────────────────────────
  const spawnParticle = useCallback((
    cx?: number, cy?: number,
    burst = false,
    w = 800, h = 600,
  ): Particle => {
    const colors = ['#fbbf24','#22c55e','#34d399','#fde68a','#86efac','#c9a227'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    if (burst && cx !== undefined && cy !== undefined) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 3;
      return {
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 1.5 + Math.random() * 2.5,
        alpha: 0.9,
        color,
        life: 0,
        maxLife: 40 + Math.random() * 30,
      };
    }
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      size: 0.8 + Math.random() * 1.8,
      alpha: 0.2 + Math.random() * 0.5,
      color,
      life: 0,
      maxLife: 200 + Math.random() * 300,
    };
  }, []);

  // ── مُنشئ النجوم ──────────────────────────────────────────────────────────────
  const makeStars = useCallback((w: number, h: number): Star[] =>
    Array.from({ length: 120 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      size: 0.4 + Math.random() * 1.6,
      twinkle: Math.random() * Math.PI * 2,
      twinkleSpeed: 0.01 + Math.random() * 0.03,
    })), []);

  // ── إضافة موجة رادار ─────────────────────────────────────────────────────────
  const addRadarRing = useCallback((
    cx: number, cy: number,
    color = '#22c55e',
    maxR = 200,
    speed = 1.2,
  ) => {
    stateRef.current.radarRings.push({ r: 0, maxR, alpha: 0.8, color, speed });
  }, []);

  // ── حدث المحادثة ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv || chatEvent === chatEventRef.current) return;
    chatEventRef.current = chatEvent;
    const w = cv.width, h = cv.height;
    const cx = RADAR_CENTER.x * w, cy = RADAR_CENTER.y * h;
    const s = stateRef.current;

    if (chatEvent === 'sent') {
      addRadarRing(cx, cy, '#fbbf24', Math.max(w, h) * 0.5, 1.8);
      for (let i = 0; i < 30; i++) {
        s.particles.push(spawnParticle(cx, cy, true, w, h));
      }
    }
    if (chatEvent === 'received') {
      addRadarRing(cx, cy, '#22d3ee', Math.max(w, h) * 0.45, 1.5);
      s.burstX = cx; s.burstY = cy;
      s.burstAlpha = 1;
      s.burstColor = '#fbbf24';
      for (let i = 0; i < 20; i++) {
        s.particles.push(spawnParticle(cx, cy, true, w, h));
      }
    }
  }, [chatEvent, addRadarRing, spawnParticle]);

  // ── حلقة الرسم ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const s = stateRef.current;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      s.stars = makeStars(canvas.width, canvas.height);
    };
    resize();
    window.addEventListener('resize', resize);

    // جسيمات أساسية
    for (let i = 0; i < 180; i++) {
      s.particles.push(spawnParticle(undefined, undefined, false, canvas.width, canvas.height));
    }

    // رادار مستمر بطيء
    const addBaseRadar = () => {
      const cx = RADAR_CENTER.x * canvas.width;
      const cy = RADAR_CENTER.y * canvas.height;
      addRadarRing(cx, cy, '#1a6e3b', Math.max(canvas.width, canvas.height) * 0.4, 0.5);
    };
    addBaseRadar();
    const radarInterval = setInterval(addBaseRadar, 5000);

    // نيزك دوري
    const meteorInterval = setInterval(() => {
      if (!s.meteor.active) {
        s.meteor = {
          x: -50, y: Math.random() * canvas.height * 0.4,
          vx: 8 + Math.random() * 5, vy: 2 + Math.random() * 3,
          len: 60 + Math.random() * 80,
          alpha: 1, active: true,
        };
      }
    }, 12000);

    const draw = () => {
      const w = canvas.width, h = canvas.height;
      const h24 = getRiyadhHour();
      const isNight = h24 < 5 || h24 >= 20;
      const [c1, c2, c3] = getSkyColors(h24);
      s.frame++;
      s.cityPulse = (s.cityPulse + 0.025) % (Math.PI * 2);

      // ── طبقة ٠: السماء ──────────────────────────────────────────────────────
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, c1);
      grad.addColorStop(0.5, c2);
      grad.addColorStop(1, c3);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // ── طبقة ١: نجوم (ليلاً) ────────────────────────────────────────────────
      if (isNight) {
        for (const star of s.stars) {
          star.twinkle += star.twinkleSpeed;
          const brightness = 0.35 + Math.sin(star.twinkle) * 0.35;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,240,${brightness})`;
          ctx.fill();
        }
        // النيزك
        if (s.meteor.active) {
          const m = s.meteor;
          const gm = ctx.createLinearGradient(m.x - m.len, m.y - m.len * 0.35, m.x, m.y);
          gm.addColorStop(0, `rgba(255,255,220,0)`);
          gm.addColorStop(1, `rgba(255,255,220,${m.alpha})`);
          ctx.beginPath();
          ctx.moveTo(m.x - m.len, m.y - m.len * 0.35);
          ctx.lineTo(m.x, m.y);
          ctx.strokeStyle = gm;
          ctx.lineWidth = 1.5;
          ctx.stroke();
          m.x += m.vx; m.y += m.vy;
          m.alpha -= 0.016;
          if (m.x > w + 100 || m.alpha <= 0) m.active = false;
        }
      }

      // ── طبقة ٢: خريطة المملكة ───────────────────────────────────────────────
      const mapGlow = 0.08 + Math.sin(s.cityPulse * 0.4) * 0.04;
      ctx.beginPath();
      for (let i = 0; i < KSA_POLY.length; i++) {
        const [px, py] = KSA_POLY[i];
        if (i === 0) ctx.moveTo(px * w, py * h);
        else ctx.lineTo(px * w, py * h);
      }
      ctx.closePath();
      ctx.fillStyle = `rgba(26,110,59,${mapGlow})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(34,197,94,${mapGlow * 2.5})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // ── طبقة ٣: دوائر الرادار ───────────────────────────────────────────────
      s.radarRings = s.radarRings.filter(ring => ring.alpha > 0.01);
      for (const ring of s.radarRings) {
        ctx.beginPath();
        ctx.arc(RADAR_CENTER.x * w, RADAR_CENTER.y * h, ring.r, 0, Math.PI * 2);
        ctx.strokeStyle = ring.color + Math.round(ring.alpha * 255).toString(16).padStart(2, '0');
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ring.r += ring.speed;
        ring.alpha -= 0.008;
      }

      // ── طبقة ٤: نقاط المدن ──────────────────────────────────────────────────
      for (const city of CITIES) {
        const cx = city.x * w, cy = city.y * h;
        const pulse = Math.sin(s.cityPulse + city.x * 10) * 0.5 + 0.5;
        const baseR = city.r;
        const outerR = baseR * (1.6 + pulse * 0.8);
        // هالة خارجية
        const gHalo = ctx.createRadialGradient(cx, cy, 0, cx, cy, outerR * 3);
        gHalo.addColorStop(0, city.color + '33');
        gHalo.addColorStop(1, city.color + '00');
        ctx.beginPath();
        ctx.arc(cx, cy, outerR * 3, 0, Math.PI * 2);
        ctx.fillStyle = gHalo;
        ctx.fill();
        // نقطة متوهجة
        const gDot = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseR);
        gDot.addColorStop(0, '#fff');
        gDot.addColorStop(0.3, city.color);
        gDot.addColorStop(1, city.color + '00');
        ctx.beginPath();
        ctx.arc(cx, cy, baseR, 0, Math.PI * 2);
        ctx.fillStyle = gDot;
        ctx.fill();
        // اسم المدينة
        if (city.primary) {
          ctx.font = '9px monospace';
          ctx.fillStyle = city.color + 'bb';
          ctx.textAlign = 'center';
          ctx.fillText(city.name, cx, cy - baseR - 4);
        }
      }

      // ── طبقة ٥: جسيمات عائمة ───────────────────────────────────────────────
      const alive: Particle[] = [];
      for (const p of s.particles) {
        p.x += p.vx; p.y += p.vy;
        p.life++;
        // ترتد عن الحواف
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        const fade = 1 - p.life / p.maxLife;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.round(p.alpha * fade * 255).toString(16).padStart(2, '0');
        ctx.fill();
        if (p.life < p.maxLife) alive.push(p);
      }
      // أبقِ 180 جسيم عائم
      while (alive.length < 180) alive.push(spawnParticle(undefined, undefined, false, w, h));
      s.particles = alive;

      // ── طبقة ٦: انفجار الرد ─────────────────────────────────────────────────
      if (s.burstAlpha > 0) {
        const gr = s.burstAlpha * 80;
        const gBurst = ctx.createRadialGradient(s.burstX, s.burstY, 0, s.burstX, s.burstY, gr);
        gBurst.addColorStop(0, s.burstColor + Math.round(s.burstAlpha * 100).toString(16).padStart(2, '0'));
        gBurst.addColorStop(1, s.burstColor + '00');
        ctx.beginPath();
        ctx.arc(s.burstX, s.burstY, gr, 0, Math.PI * 2);
        ctx.fillStyle = gBurst;
        ctx.fill();
        s.burstAlpha -= 0.025;
      }

      s.raf = requestAnimationFrame(draw);
    };

    s.raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(s.raf);
      clearInterval(radarInterval);
      clearInterval(meteorInterval);
      window.removeEventListener('resize', resize);
    };
  }, [addRadarRing, makeStars, spawnParticle]);

  return (
    <>
      {/* Canvas الرئيسي */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-0 h-full w-full"
        style={{ opacity: 0.92 }}
      />

      {/* ظل نخيل يسار */}
      <div
        className="pointer-events-none fixed bottom-0 left-0 z-[1] h-[420px] w-[160px] select-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 420'><g fill='%230a2e12' opacity='0.55'><ellipse cx='80' cy='120' rx='55' ry='18' transform='rotate(-30 80 120)'/><ellipse cx='80' cy='120' rx='52' ry='16' transform='rotate(-50 80 120)'/><ellipse cx='80' cy='120' rx='48' ry='14' transform='rotate(-10 80 120)'/><ellipse cx='80' cy='120' rx='40' ry='12' transform='rotate(-70 80 120)'/><ellipse cx='80' cy='120' rx='44' ry='13' transform='rotate(10 80 120)'/><rect x='77' y='115' width='6' height='305' rx='3'/></g></svg>")`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'bottom left',
        }}
      />

      {/* ظل نخيل يمين */}
      <div
        className="pointer-events-none fixed bottom-0 right-0 z-[1] h-[380px] w-[140px] select-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 140 380'><g fill='%23c9a22720' opacity='0.45'><ellipse cx='70' cy='100' rx='50' ry='15' transform='rotate(35 70 100)'/><ellipse cx='70' cy='100' rx='46' ry='13' transform='rotate(55 70 100)'/><ellipse cx='70' cy='100' rx='42' ry='12' transform='rotate(15 70 100)'/><ellipse cx='70' cy='100' rx='36' ry='10' transform='rotate(75 70 100)'/><rect x='67' y='95' width='6' height='285' rx='3'/></g></svg>")`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'bottom right',
          transform: 'scaleX(-1)',
        }}
      />
    </>
  );
}
