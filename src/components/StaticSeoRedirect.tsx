/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * صفحات فزعة الثابتة (`/need`, `/occasions`, `/nusuk`, `/near`) وسمي (`/summi`) تُخدم خارج HashRouter.
 * إن فُتح المسار كـ `/#/need` أو `/#/summi` نخرج من الهاش إلى الرابط النظيف فوراً.
 */
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

type Props = {
  /** مسار ثابت مطلق مثل `/need` أو قالب `/need/:slug` */
  path: string;
};

function resolvePath(template: string, params: Record<string, string | undefined>): string {
  return template.replace(/:([A-Za-z0-9_]+)/g, (_, key: string) => {
    const value = params[key];
    return value ? encodeURIComponent(value) : '';
  }).replace(/\/+/g, '/');
}

export function StaticSeoRedirect({ path }: Props) {
  const params = useParams();

  useEffect(() => {
    const resolved = resolvePath(path, params);
    const target = `${window.location.origin}${resolved}${window.location.search || ''}`;
    window.location.replace(target);
  }, [path, params]);

  return (
    <div
      dir="rtl"
      className="flex min-h-[50vh] items-center justify-center bg-[#020912] px-4 text-center text-slate-300"
    >
      <p className="text-sm font-semibold">جاري فتح صفحة الهبوط…</p>
    </div>
  );
}
