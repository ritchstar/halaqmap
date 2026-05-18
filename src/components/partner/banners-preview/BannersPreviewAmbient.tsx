import { motion, useReducedMotion } from 'framer-motion';

const PARTICLES = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  left: `${(i * 17 + 11) % 100}%`,
  top: `${(i * 23 + 7) % 100}%`,
  size: 2 + (i % 3),
  delay: `${(i % 7) * 0.65}s`,
  duration: `${4.5 + (i % 5) * 0.8}s`,
}));

export function BannersPreviewAmbient() {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden" style={{ backgroundColor: "#0b0f19" }}>
      <motion.div className="banners-preview-mesh absolute inset-0 opacity-80" />
      <motion.div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_50%_0%,rgba(34,211,238,0.14),transparent_60%),radial-gradient(ellipse_50%_40%_at_100%_80%,rgba(30,58,138,0.22),transparent_55%)]" />
      {!reduceMotion && PARTICLES.map((p) => (
        <span key={p.id} className="banners-preview-particle absolute rounded-full bg-cyan-300/25" style={{ left: p.left, top: p.top, width: p.size, height: p.size, animationDelay: p.delay, animationDuration: p.duration }} />
      ))}
    </motion.div>
  );
}
