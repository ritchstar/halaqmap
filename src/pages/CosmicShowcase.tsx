/**
 * CosmicShowcase — استعراض تقني كوني نقي
 * Route: /cosmic
 *
 * بلا محور مركزي — الأداء يملأ الشاشة بالكامل
 * 18+ طبقة بصرية | بدون صوت
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Static star data ─────────────────────────────────────────────────────────
const TINY  = Array.from({length:140},(_, i)=>({ x:(i*67+13)%100, y:(i*43+7)%100, r:.5+(i%3)*.3, d:2+(i%4), delay:(i%7)*.7 }));
const SMALL = Array.from({length:70}, (_, i)=>({ x:(i*89+31)%100, y:(i*53+19)%100, r:1+(i%3)*.5, d:3+(i%5), delay:(i%6)*.9 }));
const BRIGHT= Array.from({length:25}, (_, i)=>({ x:(i*113+47)%100, y:(i*71+23)%100, r:2+(i%3), d:4+(i%4), delay:(i%5)*1.2, color:['#fff','#7df3ff','#ffcf77','#c084fc','#86efac'][i%5] }));

// Neural network
const NODES = Array.from({length:22},(_, i)=>({ x:5+((i*47+13)%90), y:5+((i*61+7)%90), id:i }));
const LINKS = NODES.flatMap((n,i)=>NODES.slice(i+1,i+4).map((m)=>({from:n.id,to:m.id}))).slice(0,35);

// Constellation
const CONSTS:number[][] = [ [10,12],[28,6],[50,18],[72,9],[88,15],[18,32],[42,28],[60,35],[80,25],[8,55],[35,48],[58,55],[78,50],[90,42] ];
const CLINES = [[0,1],[1,2],[2,3],[3,4],[0,5],[1,5],[2,6],[3,7],[4,7],[5,8],[6,9],[7,10],[8,11],[9,10],[10,11],[11,12],[12,13]];

// Data rain
const DATA = '01アBالرياض10ABCXYZحلاق01マップKSA';
const RAIN  = Array.from({length:26},(_, i)=>({ x:(i/26)*100, speed:7+(i%5)*3, delay:(i*.7)%9, chars:Array.from({length:20},(_, j)=>DATA[(i*3+j*7)%DATA.length]) }));

// Distributed pulse centers
const PULSE_CENTERS = [
  { x:20, y:22, color:'#0ff', size:180, dur:14 },
  { x:75, y:70, color:'#8b00ff', size:220, dur:20 },
  { x:65, y:25, color:'#0f8', size:150, dur:17 },
];
const ORBIT_CENTERS = [
  { x:15, y:65, rings:[{ w:120, c:'#0ff', dur:10 }, { w:170, c:'#8b00ff', dur:15 }] },
  { x:82, y:30, rings:[{ w:100, c:'#fa0', dur:12 }, { w:150, c:'#0ff', dur:18 }] },
];

// ─── Types ────────────────────────────────────────────────────────────────────
type Shooter = { id: number; angle: number; x: number; y: number; dur: number; color: string };
type Comet   = { id: number; x: number; y: number; angle: number; len: number; color: string };

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function CosmicShowcase() {
  const [mouse, setMouse]         = useState({ x: 0, y: 0 });
  const [shooters, setShooters]   = useState<Shooter[]>([]);
  const [comets, setComets]       = useState<Comet[]>([]);
  const [supernova, setSupernova] = useState(false);
  const [wormholePos, setWormhole]= useState<{ x: number; y: number } | null>(null);
  const [pings, setPings]         = useState<{ id: number; x: number; y: number }[]>([]);
  const shootId = useRef(0);
  const cometId = useRef(0);

  const handleMouse = useCallback((e: MouseEvent) => {
    setMouse({ x: (e.clientX / window.innerWidth - .5) * 2, y: (e.clientY / window.innerHeight - .5) * 2 });
  }, []);
  useEffect(() => {
    window.addEventListener('mousemove', handleMouse, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouse);
  }, [handleMouse]);

  // Shooting stars
  useEffect(() => {
    const COLS = ['#fff','#7df3ff','#c084fc','#fbbf24','#86efac'];
    const add = () => {
      const id = ++shootId.current;
      const color = COLS[Math.floor(Math.random() * COLS.length)];
      setShooters(p => [...p.slice(-8), { id, angle: -15 - Math.random()*50, x: Math.random()*80, y: Math.random()*45, dur: .8+Math.random()*1.4, color }]);
      setTimeout(() => setShooters(p => p.filter(s => s.id !== id)), 2200);
    };
    const t = setInterval(add, 2200 + Math.random() * 3800);
    add();
    return () => clearInterval(t);
  }, []);

  // Comets
  useEffect(() => {
    const COLS = ['#7df3ff88','#c084fc88','#fbbf2488'];
    const add = () => {
      const id = ++cometId.current;
      const color = COLS[Math.floor(Math.random() * COLS.length)];
      setComets(p => [...p.slice(-4), { id, x: Math.random()*80, y: Math.random()*55, angle: 10+Math.random()*30, len: 90+Math.random()*130, color }]);
      setTimeout(() => setComets(p => p.filter(c => c.id !== id)), 4000);
    };
    const t = setInterval(add, 9000 + Math.random() * 7000);
    return () => clearInterval(t);
  }, []);

  // Supernova
  useEffect(() => {
    const fire = () => { setSupernova(true); setTimeout(() => setSupernova(false), 1800); };
    const t1 = setTimeout(fire, 6000);
    const t2 = setInterval(fire, 32000);
    return () => { clearTimeout(t1); clearInterval(t2); };
  }, []);

  // Wormhole — random position
  useEffect(() => {
    const show = () => {
      const x = 20 + Math.random() * 60;
      const y = 15 + Math.random() * 55;
      setWormhole({ x, y });
      setTimeout(() => setWormhole(null), 5000);
    };
    const t1 = setTimeout(show, 20000);
    const t2 = setInterval(show, 48000);
    return () => { clearTimeout(t1); clearInterval(t2); };
  }, []);

  // Stellar pings
  useEffect(() => {
    let pid = 0;
    const t = setInterval(() => {
      const id = ++pid;
      setPings(p => [...p.slice(-12), { id, x: Math.random()*95, y: Math.random()*95 }]);
      setTimeout(() => setPings(p => p.filter(s => s.id !== id)), 1200);
    }, 800);
    return () => clearInterval(t);
  }, []);

  const px = mouse.x, py = mouse.y;

  return (
    <div className="relative h-screen w-screen overflow-hidden select-none" style={{ background: '#000008', fontFamily: 'system-ui' }}>

      {/* ── CSS KEYFRAMES ───────────────────────────────────────────────── */}
      <style>{`
        @keyframes twinkle{0%,100%{opacity:.2;transform:scale(1)}50%{opacity:1;transform:scale(1.5)}}
        @keyframes nebula-float{0%,100%{transform:translate(0,0)scale(1);opacity:.5}33%{transform:translate(4%,2%)scale(1.1);opacity:.65}66%{transform:translate(-2%,4%)scale(.92);opacity:.4}}
        @keyframes aurora-wave{0%{transform:translateX(-8%)scaleY(1);filter:hue-rotate(0deg)}50%{transform:translateX(7%)scaleY(1.35);filter:hue-rotate(70deg)}100%{transform:translateX(-8%)scaleY(1);filter:hue-rotate(0deg)}}
        @keyframes pulsar-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes orbit-a{from{transform:rotateX(72deg)rotateZ(0deg)}to{transform:rotateX(72deg)rotateZ(360deg)}}
        @keyframes orbit-b{from{transform:rotateX(58deg)rotateZ(120deg)}to{transform:rotateX(58deg)rotateZ(480deg)}}
        @keyframes shoot{0%{opacity:0}5%{opacity:1}85%{opacity:.7}100%{opacity:0;transform:translate(110vw,55vh)}}
        @keyframes comet-move{0%{opacity:0;transform:translateX(0)}8%{opacity:1}90%{opacity:.6}100%{opacity:0;transform:translateX(90vw)}}
        @keyframes supernova-expand{0%{opacity:0;transform:scale(0)}12%{opacity:1;transform:scale(1)}40%{opacity:.8;transform:scale(1.6)}100%{opacity:0;transform:scale(5)}}
        @keyframes wormhole-vortex{0%{transform:scale(0)rotate(0deg);opacity:0}15%{transform:scale(1)rotate(180deg);opacity:1}85%{transform:scale(1.2)rotate(900deg);opacity:.8}100%{transform:scale(0)rotate(1800deg);opacity:0}}
        @keyframes einstein-ring{0%{transform:scale(0);opacity:.7}100%{transform:scale(3.5);opacity:0}}
        @keyframes data-fall{0%{transform:translateY(-110%);opacity:0}5%{opacity:.6}95%{opacity:.3}100%{transform:translateY(115vh);opacity:0}}
        @keyframes neural-pulse{0%,100%{stroke-opacity:.1;stroke-dashoffset:200}50%{stroke-opacity:.55;stroke-dashoffset:0}}
        @keyframes grid-breathe{0%,100%{opacity:.07}50%{opacity:.18}}
        @keyframes ping-star{0%{transform:scale(0);opacity:1}100%{transform:scale(2.5);opacity:0}}
      `}</style>

      {/* ── L1: Nebulae ─────────────────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0" style={{ transform:`translate(${px*-15}px,${py*-10}px)` }}>
        {[
          { x:8,  y:10, w:55, h:50, c:'#0ff',    dur:20 },
          { x:55, y:5,  w:50, h:45, c:'#8b00ff', dur:25 },
          { x:72, y:52, w:45, h:55, c:'#00f',    dur:28 },
          { x:3,  y:58, w:42, h:42, c:'#0f8',    dur:22 },
          { x:38, y:72, w:52, h:38, c:'#f0a',    dur:26 },
          { x:80, y:18, w:38, h:48, c:'#fa0',    dur:18 },
        ].map((n,i) => (
          <div key={i} style={{ position:'absolute', left:`${n.x}%`, top:`${n.y}%`, width:`${n.w}%`, height:`${n.h}%`,
            background:`radial-gradient(ellipse,${n.c}28 0%,${n.c}0c 40%,transparent 75%)`,
            filter:'blur(65px)', animation:`nebula-float ${n.dur}s ease-in-out infinite`, animationDelay:`${i*-4.5}s` }} />
        ))}
      </div>

      {/* ── L2: Stars ───────────────────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0" style={{ transform:`translate(${px*-5}px,${py*-3}px)` }}>
        {TINY.map(s => <div key={`t${s.x}${s.y}`} style={{ position:'absolute', left:`${s.x}%`, top:`${s.y}%`, width:`${s.r}px`, height:`${s.r}px`, borderRadius:'50%', background:'#fff', opacity:.25, animation:`twinkle ${s.d}s ease-in-out infinite`, animationDelay:`${s.delay}s` }} />)}
      </div>
      <div className="pointer-events-none absolute inset-0" style={{ transform:`translate(${px*-9}px,${py*-6}px)` }}>
        {SMALL.map(s => <div key={`sm${s.x}${s.y}`} style={{ position:'absolute', left:`${s.x}%`, top:`${s.y}%`, width:`${s.r}px`, height:`${s.r}px`, borderRadius:'50%', background:'#fff', boxShadow:`0 0 ${s.r*2}px #fff`, animation:`twinkle ${s.d}s ease-in-out infinite`, animationDelay:`${s.delay}s` }} />)}
      </div>
      <div className="pointer-events-none absolute inset-0" style={{ transform:`translate(${px*-16}px,${py*-11}px)` }}>
        {BRIGHT.map(s => <div key={`br${s.x}${s.y}`} style={{ position:'absolute', left:`${s.x}%`, top:`${s.y}%`, width:`${s.r}px`, height:`${s.r}px`, borderRadius:'50%', background:s.color, boxShadow:`0 0 ${s.r*5}px ${s.color},0 0 ${s.r*10}px ${s.color}55`, animation:`twinkle ${s.d}s ease-in-out infinite`, animationDelay:`${s.delay}s` }} />)}
      </div>

      {/* ── L3: Aurora ──────────────────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-x-0 top-0" style={{ height:'50%', zIndex:2 }}>
        {[{c:'#0ffb',y:0,d:13,b:85},{c:'#8b00ffaa',y:4,d:17,b:105},{c:'#00fa99',y:8,d:15,b:95},{c:'#0055ffbb',y:1,d:19,b:115}].map((a,i)=>(
          <div key={i} style={{ position:'absolute', inset:0, top:`${a.y}%`, height:'65%',
            background:`linear-gradient(to bottom,${a.c} 0%,transparent 100%)`,
            filter:`blur(${a.b}px)`, animation:`aurora-wave ${a.d}s ease-in-out infinite`, animationDelay:`${i*-3.5}s`, opacity:.55 }} />
        ))}
      </div>

      {/* ── L4: Perspective grid ────────────────────────────────────────── */}
      <svg className="pointer-events-none absolute bottom-0 inset-x-0" style={{ height:'42%', width:'100%', animation:'grid-breathe 9s ease-in-out infinite' }}
        viewBox="0 0 100 45" preserveAspectRatio="none">
        <defs>
          <linearGradient id="gf" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0ff" stopOpacity="0"/>
            <stop offset="70%" stopColor="#0ff" stopOpacity="0.16"/>
            <stop offset="100%" stopColor="#8b00ff" stopOpacity="0.08"/>
          </linearGradient>
        </defs>
        {[8,16,24,32,40,48,56,64,72,80,90].map(y=><line key={y} x1="0" y1={y*.45} x2="100" y2={y*.45} stroke="url(#gf)" strokeWidth="0.25"/>)}
        {[-70,-50,-30,-10,10,30,50,70,90,110,130,150].map(x=><line key={x} x1={50+x*.4} y1="0" x2={50+x*1.8} y2="45" stroke="url(#gf)" strokeWidth="0.25"/>)}
      </svg>

      {/* ── L5: Constellation ────────────────────────────────────────────── */}
      <svg className="pointer-events-none absolute inset-0" style={{ width:'100%', height:'100%', transform:`translate(${px*-22}px,${py*-15}px)` }}
        viewBox="0 0 100 100" preserveAspectRatio="none">
        {CLINES.map(([a,b],i)=><line key={i} x1={CONSTS[a][0]} y1={CONSTS[a][1]} x2={CONSTS[b][0]} y2={CONSTS[b][1]} stroke="#0ff" strokeWidth=".15" strokeOpacity=".35" strokeDasharray="200" style={{strokeDashoffset:`${200-i*8}`}}/>)}
        {CONSTS.map(([x,y],i)=><circle key={i} cx={x} cy={y} r=".7" fill="#7df3ff" opacity=".75" style={{animation:`twinkle ${3+i%3}s ease-in-out infinite`,animationDelay:`${i*.35}s`}}/>)}
      </svg>

      {/* ── L6: Neural Network ───────────────────────────────────────────── */}
      <svg className="pointer-events-none absolute inset-0" style={{ width:'100%', height:'100%', opacity:.45 }} viewBox="0 0 100 100" preserveAspectRatio="none">
        {LINKS.map(({from,to},i)=><line key={i} x1={NODES[from].x} y1={NODES[from].y} x2={NODES[to].x} y2={NODES[to].y} stroke="#8b00ff" strokeWidth=".18" strokeDasharray="200" strokeDashoffset="200" style={{animation:`neural-pulse ${5+i%4}s ease-in-out infinite`,animationDelay:`${i*.15}s`}}/>)}
        {NODES.map(n=><circle key={n.id} cx={n.x} cy={n.y} r=".9" fill="#c084fc" opacity=".65" style={{animation:`twinkle ${2+n.id%3}s ease-in-out infinite`,animationDelay:`${n.id*.25}s`}}/>)}
      </svg>

      {/* ── L7: Distributed Pulsars ──────────────────────────────────────── */}
      {PULSE_CENTERS.map((pc, pi) => (
        <div key={pi} className="pointer-events-none absolute" style={{ left:`${pc.x}%`, top:`${pc.y}%`, zIndex:3 }}>
          {[0,60,120,180,240,300].map((deg,i)=>(
            <div key={i} style={{ position:'absolute', left:0, top:0, width:`${pc.size}px`, height:'1px',
              background:`linear-gradient(to right,transparent,${['#0ff','#8b00ff','#0f8','#fa0','#f0a','#05f'][i]}55,transparent)`,
              transform:`rotate(${deg}deg)`, transformOrigin:'0 50%',
              animation:`pulsar-spin ${20+pi*6+i*2}s linear infinite`, animationDelay:`${i*-3+pi}s`, filter:'blur(1.5px)' }} />
          ))}
        </div>
      ))}

      {/* ── L8: Distributed Orbit Rings ──────────────────────────────────── */}
      {ORBIT_CENTERS.map((oc, oi) => (
        <div key={oi} className="pointer-events-none absolute" style={{ left:`${oc.x}%`, top:`${oc.y}%`, zIndex:4 }}>
          {oc.rings.map((r, ri) => (
            <div key={ri} style={{ position:'absolute', width:`${r.w}px`, height:`${r.w}px`, left:`${-r.w/2}px`, top:`${-r.w/2}px`,
              borderRadius:'50%', border:`1px solid ${r.c}45`, boxShadow:`0 0 10px ${r.c}22`,
              animation:`${ri===0?'orbit-a':'orbit-b'} ${r.dur}s linear infinite` }}>
              <div style={{ position:'absolute', top:-4, left:'50%', width:7, height:7, borderRadius:'50%', background:r.c, boxShadow:`0 0 14px ${r.c}` }} />
            </div>
          ))}
        </div>
      ))}

      {/* ── L9: Data Rain ────────────────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0" style={{ zIndex:2 }}>
        {RAIN.map((col,ci)=>(
          <div key={ci} style={{ position:'absolute', left:`${col.x}%`, top:0, animation:`data-fall ${col.speed}s linear infinite`, animationDelay:`${col.delay}s`,
            fontFamily:'monospace', fontSize:'10px', color:'#0ff', opacity:.1, display:'flex', flexDirection:'column', gap:'3px', writingMode:'vertical-rl' }}>
            {col.chars.map((c,i)=><span key={i} style={{opacity:1-i/col.chars.length}}>{c}</span>)}
          </div>
        ))}
      </div>

      {/* ── L10: Einstein Rings ───────────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0" style={{ zIndex:5 }}>
        {[[30,40],[65,70],[80,20],[15,75]].map(([cx,cy], pi) =>
          [1,2,3].map(i=>(
            <div key={`e${pi}${i}`} style={{ position:'absolute', left:`${cx}%`, top:`${cy}%`,
              width:`${80*i}px`, height:`${80*i}px`, marginLeft:`${-40*i}px`, marginTop:`${-40*i}px`,
              borderRadius:'50%', border:'1px solid #0ff', boxShadow:'0 0 8px #0ff33',
              animation:`einstein-ring ${5+i+pi}s ease-out infinite`, animationDelay:`${pi*2+i*1.8}s` }} />
          ))
        )}
      </div>

      {/* ── L11: Stellar Pings ───────────────────────────────────────────── */}
      {pings.map(p=>(
        <div key={p.id} style={{ position:'absolute', left:`${p.x}%`, top:`${p.y}%`, width:'12px', height:'12px',
          marginLeft:'-6px', marginTop:'-6px', borderRadius:'50%',
          border:'1px solid #7df3ff', animation:'ping-star 1.2s ease-out forwards', zIndex:8 }} />
      ))}

      {/* ── L12: Shooting Stars ──────────────────────────────────────────── */}
      {shooters.map(s=>(
        <div key={s.id} style={{ position:'absolute', left:`${s.x}%`, top:`${s.y}%`,
          width:'150px', height:'2px',
          background:`linear-gradient(to right,transparent,${s.color})`,
          boxShadow:`0 0 8px ${s.color}`, transform:`rotate(${s.angle}deg)`, transformOrigin:'left center',
          animation:`shoot ${s.dur}s ease-out forwards`, zIndex:10, filter:'blur(.5px)' }}>
          <div style={{ position:'absolute', right:0, top:'-1px', width:'4px', height:'4px', borderRadius:'50%', background:s.color, boxShadow:`0 0 10px ${s.color}` }} />
        </div>
      ))}

      {/* ── L13: Comets ──────────────────────────────────────────────────── */}
      {comets.map(c=>(
        <div key={c.id} style={{ position:'absolute', left:`${c.x}%`, top:`${c.y}%`,
          width:`${c.len}px`, height:'3px',
          background:`linear-gradient(to right,transparent 0%,${c.color} 50%,white 100%)`,
          transform:`rotate(${c.angle}deg)`, animation:'comet-move 4s ease-in-out forwards', zIndex:9, filter:'blur(1px)' }}>
          {Array.from({length:10}).map((_,i)=>(
            <div key={i} style={{ position:'absolute', right:`${i*11}px`, top:`${(i%3)-1}px`,
              width:`${3.5-i*.3}px`, height:`${3.5-i*.3}px`, borderRadius:'50%',
              background:c.color, opacity:1-i/10 }} />
          ))}
        </div>
      ))}

      {/* ── L14: Wormhole ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {wormholePos && (
          <motion.div style={{ position:'absolute', left:`${wormholePos.x}%`, top:`${wormholePos.y}%`,
            width:'240px', height:'240px', marginLeft:'-120px', marginTop:'-120px',
            borderRadius:'50%', background:'conic-gradient(from 0deg,#8b00ff,#0ff,#00f,#0f8,#8b00ff)',
            zIndex:20, filter:'blur(10px)', animation:'wormhole-vortex 5s ease-in-out forwards' }} />
        )}
      </AnimatePresence>

      {/* ── L15: Supernova ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {supernova && (
          <motion.div style={{ position:'fixed', inset:0, zIndex:30, pointerEvents:'none',
            background:'radial-gradient(circle at center,#ffffffee 0%,#0ffaaa 25%,#8b00ff66 55%,transparent 75%)',
            animation:'supernova-expand 1.8s ease-out forwards' }} />
        )}
      </AnimatePresence>

      {/* ── L16: Waveform bar ─────────────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center" style={{ zIndex:6 }}>
        <div style={{ display:'flex', gap:'2px', alignItems:'center' }}>
          {Array.from({length:50}).map((_,i)=>(
            <motion.div key={i} style={{ width:'2px', borderRadius:'1px',
              background:`hsl(${180+i*3},100%,65%)`, originY:'50%' }}
              animate={{ scaleY:[.3, .6+Math.sin(i*.5)*.4, .3] }}
              transition={{ duration:1+i*.04, repeat:Infinity, ease:'easeInOut', delay:i*.035 }} />
          ))}
        </div>
      </div>

      {/* ── BOTTOM-LEFT TEXT ─────────────────────────────────────────────── */}
      <div style={{ position:'absolute', bottom:16, left:16, zIndex:20 }}>
        <p style={{ color:'rgba(0,255,255,.32)', fontSize:'.6rem', fontFamily:'monospace', letterSpacing:'.14em', lineHeight:1.7 }}>
          HALAQ MAP · حلاق ماب<br/>
          On-Demand Visibility · KSA 2026<br/>
          <span style={{ opacity:.45 }}>B2B Technology Platform · ISIC4 474151</span>
        </p>
      </div>

      {/* ── TOP-RIGHT: Coordinates ───────────────────────────────────────── */}
      <div style={{ position:'absolute', top:16, right:16, zIndex:20, textAlign:'right' }}>
        <p style={{ color:'rgba(0,255,255,.22)', fontSize:'.58rem', fontFamily:'monospace', letterSpacing:'.1em' }}>
          24.6877° N · 46.7219° E<br/>
          <span style={{ opacity:.5 }}>RIYADH · SAUDI ARABIA</span>
        </p>
      </div>
    </div>
  );
}
