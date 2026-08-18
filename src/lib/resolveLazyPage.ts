/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { lazy, type ComponentType } from 'react';

/**
 * Vite قد يحوّل `mod.default` داخل ملف الـ import() إلى named export.
 * قراءة `.default` هنا — خارج ملف `import()` — تُبقي مساحة الأسماء كاملة
 * وتقبل الدالة نفسها إن أُعيدت من `.then(m => m.X)`.
 */
export function pickPageComponent(mod: unknown, name: string): ComponentType {
  if (typeof mod === 'function') return mod as ComponentType;
  if (mod && typeof mod === 'object') {
    const rec = mod as Record<string, unknown>;
    if (typeof rec.default === 'function') return rec.default as ComponentType;
    if (typeof rec[name] === 'function') return rec[name] as ComponentType;
  }
  throw new Error(`${name} failed to load`);
}

export function lazyPage(loader: () => Promise<unknown>, name: string) {
  return lazy(async () => {
    const mod = await loader();
    return { default: pickPageComponent(mod, name) };
  });
}
