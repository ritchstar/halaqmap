/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * إصدار نسخ حلانا1 غير المعلنة. لا يُستورد من App.
 */
import { useCallback, useEffect, useState } from 'react';
import { toast } from '@/components/ui/sonner';
import { STORE_HALANA_LIVE_COPY } from '@/config/storeHalanaLive';
import { adminIssueHalanaCopy, adminListHalanaCopies, type StoreHalanaCopyRow } from '@/lib/adminStoreHalanaRemote';

export function StoreHalanaIssueBoard({ accessToken }: { accessToken: string }) {
  const copy = STORE_HALANA_LIVE_COPY;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rows, setRows] = useState<StoreHalanaCopyRow[]>([]);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    if (!accessToken) return;
    const res = await adminListHalanaCopies(accessToken);
    if (!res.ok) {
      toast.error(res.error === 'not_authenticated' ? 'انتهت الجلسة.' : res.error);
      return;
    }
    setRows(res.rows);
  }, [accessToken]);

  useEffect(() => {
    if (accessToken) void refresh();
  }, [accessToken, refresh]);

  async function issue() {
    setBusy(true);
    const res = await adminIssueHalanaCopy({ accessToken, name, email });
    setBusy(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success(copy.issuedAr);
    setName('');
    setEmail('');
    void refresh();
  }

  return (
    <section className="space-y-4 rounded-2xl border border-[#c45c7a]/30 bg-[#c45c7a]/[0.06] p-5">
      <div>
        <h2 className="text-lg font-extrabold">{copy.issueTitleAr}</h2>
        <p className="mt-1 text-sm leading-7 text-slate-400">{copy.issueLeadAr}</p>
      </div>
      <label className="block text-sm">
        {copy.issueNameAr}
        <input
          className="mt-1 h-12 w-full rounded-md border border-white/15 bg-[#061018] px-3"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </label>
      <label className="block text-sm">
        {copy.issueEmailAr}
        <input
          className="mt-1 h-12 w-full rounded-md border border-white/15 bg-[#061018] px-3"
          dir="ltr"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>
      <button
        type="button"
        disabled={busy}
        onClick={() => void issue()}
        className="rounded-xl bg-[#c45c7a] px-4 py-2 text-sm font-bold text-[#14080c] disabled:opacity-60"
      >
        {copy.issueCtaAr}
      </button>
      {rows.length === 0 ? (
        <p className="text-sm text-slate-500">لا نسخ صادرة بعد.</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {rows.map((row) => (
            <li key={row.id} className="rounded-xl border border-white/10 bg-black/30 px-4 py-3">
              <p className="font-bold text-white">
                {row.specialist_name} · {row.beneficiary_email}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {row.shopHref ? (
                  <a className="text-xs font-bold text-[#e8a0b4] underline" href={row.shopHref} target="_blank" rel="noreferrer">
                    صفحة العميلة
                  </a>
                ) : null}
                {row.deskHref ? (
                  <a className="text-xs font-bold text-[#e8a0b4] underline" href={row.deskHref} target="_blank" rel="noreferrer">
                    لوحة التشغيل
                  </a>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
