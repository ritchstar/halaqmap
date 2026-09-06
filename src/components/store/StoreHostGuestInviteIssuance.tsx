/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * لوحة HTML لإصدار روابط مدعوين بلا سقف إجمالي، وإرسالها من واتساب جهاز المشتري.
 */
import { useEffect, useMemo, useState } from 'react';
import {
  GUEST_DELEGATE_PACK_SIZES,
  GUEST_INVITE_BATCH_SIZE,
  buildGuestDelegatePackText,
  guestDelegateWhatsappHref,
  guestInviteStats,
  markLocalGuestInviteSent,
  markLocalGuestInvitesSent,
  mintLocalGuestInviteBatch,
  normalizeGuestDelegatePackSize,
  readLocalGuestInvites,
  reissueLocalGuestInvite,
  resetLocalGuestInviteDevice,
  revokeLocalGuestInvite,
  summarizeLocalGuestInvites,
  type GuestDelegatePackSize,
  type GuestInviteRow,
  type GuestLockKind,
} from '@/lib/storeGuestDeviceLock';
import { weddingLiveCopy } from '@/config/storeWeddingLive';
import {
  listEventGuestInvites,
  markEventGuestInviteSent,
  markEventGuestInvitesSent,
  mintEventGuestInvite,
  reissueEventGuestInvite,
  resetEventGuestInviteDevice,
  revokeEventGuestInvite,
} from '@/lib/storeEventLiveRemote';
import {
  listWeddingGuestInvites,
  markWeddingGuestInviteSent,
  markWeddingGuestInvitesSent,
  mintWeddingGuestInvite,
  reissueWeddingGuestInvite,
  resetWeddingGuestInviteDevice,
  revokeWeddingGuestInvite,
} from '@/lib/storeWeddingLiveRemote';

type InviteStats = {
  remaining: number;
  sent: number;
  opened: number;
  revoked: number;
  total: number;
  cap: number;
};

const EMPTY_STATS: InviteStats = { remaining: 0, sent: 0, opened: 0, revoked: 0, total: 0, cap: 0 };
const DEMO_PREVIEW_STATS: InviteStats = { total: 100, opened: 72, sent: 72, remaining: 28, revoked: 0, cap: 0 };

function whatsappHref(url: string): string {
  return `https://wa.me/?text=${encodeURIComponent(`دعوتكم الخاصة:\n${url}`)}`;
}

function asRows(raw: unknown): GuestInviteRow[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      const row = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};
      return {
        id: String(row.id || ''),
        n: Number(row.n) || 0,
        sent: row.sent === true,
        opened: row.opened === true,
        revoked: row.revoked === true,
        guestUrl: String(row.guestUrl || ''),
      };
    })
    .filter((item) => item.id && item.guestUrl);
}

function asStats(raw: unknown): InviteStats {
  const row = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  return {
    remaining: Number(row.remaining) || 0,
    sent: Number(row.sent) || 0,
    opened: Number(row.opened) || 0,
    revoked: Number(row.revoked) || 0,
    total: Number(row.total) || 0,
    cap: Number(row.cap) || 0,
  };
}

function readyRows(rows: GuestInviteRow[]): GuestInviteRow[] {
  return rows.filter((item) => !item.sent && !item.opened && !item.revoked);
}

function inviteStatusLabel(item: GuestInviteRow): string {
  if (item.revoked) return 'أُلغي';
  if (item.opened) return 'فُتح';
  if (item.sent) return 'أُرسل ولم يُفتح';
  return 'لم يُفتح';
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const el = document.createElement('textarea');
      el.value = text;
      el.setAttribute('readonly', '');
      el.style.position = 'fixed';
      el.style.left = '-9999px';
      document.body.appendChild(el);
      el.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(el);
      return ok;
    } catch {
      return false;
    }
  }
}

export function StoreHostGuestInviteIssuance({
  kind,
  hostToken,
  isLab,
  titleAr,
  leadAr,
  ctaAr,
  demoPreview = false,
}: {
  kind: GuestLockKind;
  hostToken: string;
  isLab: boolean;
  titleAr: string;
  leadAr: string;
  ctaAr: string;
  demoPreview?: boolean;
}) {
  const pathPrefix = kind === 'wedding' ? '/w' : '/e';
  const statsCopy = kind === 'wedding' ? weddingLiveCopy('men') : null;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const [stats, setStats] = useState<InviteStats>(EMPTY_STATS);
  const [invites, setInvites] = useState<GuestInviteRow[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [packSize, setPackSize] = useState<GuestDelegatePackSize>(25);
  const [packDraft, setPackDraft] = useState('');

  const ready = useMemo(() => readyRows(invites), [invites]);
  const managed = useMemo(() => invites.filter((item) => item.sent || item.opened || item.revoked), [invites]);
  const selected = ready.find((item) => item.id === selectedId) || ready[0] || null;
  const displayStats = demoPreview && isLab ? DEMO_PREVIEW_STATS : stats;
  const pendingCount = demoPreview && isLab ? 28 : Math.max(0, displayStats.total - displayStats.opened);

  function applyLocal() {
    const rows = summarizeLocalGuestInvites(kind, hostToken, pathPrefix);
    setInvites(rows);
    setStats(guestInviteStats(readLocalGuestInvites(kind, hostToken)));
    setSelectedId((current) => rows.find((item) => !item.sent && !item.opened && item.id === current)?.id || rows.find((item) => !item.sent && !item.opened)?.id || '');
  }

  function applyRemote(result: { ok: boolean; error?: string; [k: string]: unknown }) {
    if (!result.ok) {
      setError(typeof result.error === 'string' ? result.error : 'تعذر تحديث لوحة الروابط.');
      return false;
    }
    const rows = asRows(result.invites);
    setInvites(rows);
    setStats(asStats(result.stats));
    setSelectedId((current) => rows.find((item) => !item.sent && !item.opened && item.id === current)?.id || rows.find((item) => !item.sent && !item.opened)?.id || '');
    return true;
  }

  useEffect(() => {
    if (!hostToken) return;
    if (isLab) {
      applyLocal();
      return;
    }
    const list = kind === 'wedding' ? listWeddingGuestInvites : listEventGuestInvites;
    void list(hostToken).then(applyRemote);
  }, [hostToken, isLab, kind]);

  async function prepare() {
    if (busy || !hostToken) return;
    setBusy(true);
    setError('');
    setNote('');
    if (isLab) {
      mintLocalGuestInviteBatch(kind, hostToken, GUEST_INVITE_BATCH_SIZE);
      applyLocal();
      setBusy(false);
      return;
    }
    const mint = kind === 'wedding' ? mintWeddingGuestInvite : mintEventGuestInvite;
    const result = await mint(hostToken, GUEST_INVITE_BATCH_SIZE);
    applyRemote(result);
    setBusy(false);
  }

  async function sendOne(row: GuestInviteRow | null) {
    if (!row || busy) return;
    setBusy(true);
    setError('');
    setNote('');
    if (isLab) {
      markLocalGuestInviteSent(kind, hostToken, row.id);
      applyLocal();
    } else {
      const mark = kind === 'wedding' ? markWeddingGuestInviteSent : markEventGuestInviteSent;
      applyRemote(await mark(hostToken, row.id));
    }
    setBusy(false);
    window.open(whatsappHref(row.guestUrl), '_blank', 'noopener,noreferrer');
  }

  async function sendDelegatePack(size: GuestDelegatePackSize) {
    if (busy || !hostToken) return;
    setBusy(true);
    setError('');
    setNote('');
    let rows = ready;
    const need = size - rows.length;
    if (need > 0) {
      if (isLab) {
        mintLocalGuestInviteBatch(kind, hostToken, need);
        rows = readyRows(summarizeLocalGuestInvites(kind, hostToken, pathPrefix));
      } else {
        const mint = kind === 'wedding' ? mintWeddingGuestInvite : mintEventGuestInvite;
        const minted = await mint(hostToken, need);
        if (!applyRemote(minted)) {
          setBusy(false);
          return;
        }
        rows = readyRows(asRows(minted.invites));
      }
    }
    const pack = rows.slice(0, size);
    if (pack.length < size) {
      setError('تعذر تجهيز دفعة المفوض. أعدوا المحاولة.');
      setBusy(false);
      return;
    }
    const text = buildGuestDelegatePackText(pack);
    const copied = await copyText(text);
    setPackDraft(text);
    const ids = pack.map((item) => item.id);
    if (isLab) {
      markLocalGuestInvitesSent(kind, hostToken, ids);
      applyLocal();
    } else {
      const mark = kind === 'wedding' ? markWeddingGuestInvitesSent : markEventGuestInvitesSent;
      applyRemote(await mark(hostToken, ids));
    }
    setNote(
      copied
        ? 'نُسخ نص الدفعة كاملاً. رسالة واتساب القصيرة بلا روابط. الصقوا النص الظاهر أدناه في محادثة المفوض ثم أرسلوا. لا تفتحوا أي رابط.'
        : 'انسخوا النص الظاهر أدناه والصقوه في محادثة المفوض. رسالة واتساب القصيرة بلا روابط. لا تفتحوا أي رابط.',
    );
    setBusy(false);
    window.open(guestDelegateWhatsappHref(text), '_blank', 'noopener,noreferrer');
  }

  async function runInviteAction(
    inviteId: string,
    action: 'revoke' | 'reissue' | 'reset',
  ) {
    if (busy || !hostToken || !inviteId) return;
    setBusy(true);
    setError('');
    setNote('');
    if (isLab) {
      if (action === 'revoke') revokeLocalGuestInvite(kind, hostToken, inviteId);
      if (action === 'reissue') reissueLocalGuestInvite(kind, hostToken, inviteId);
      if (action === 'reset') resetLocalGuestInviteDevice(kind, hostToken, inviteId);
      applyLocal();
      if (action === 'reissue') {
        setNote('أُصدر رابط بديل. أرسلوه من واتساب جهازكم.');
      }
      setBusy(false);
      return;
    }
    const revoke = kind === 'wedding' ? revokeWeddingGuestInvite : revokeEventGuestInvite;
    const reissue = kind === 'wedding' ? reissueWeddingGuestInvite : reissueEventGuestInvite;
    const reset = kind === 'wedding' ? resetWeddingGuestInviteDevice : resetEventGuestInviteDevice;
    const result =
      action === 'revoke'
        ? await revoke(hostToken, inviteId)
        : action === 'reissue'
          ? await reissue(hostToken, inviteId)
          : await reset(hostToken, inviteId);
    if (applyRemote(result) && action === 'reissue' && typeof result.guestUrl === 'string') {
      setNote('أُصدر رابط بديل. أرسلوه من واتساب جهازكم.');
    }
    setBusy(false);
  }

  return (
    <section className="mb-5 rounded-2xl border border-[#d4a574]/35 bg-[#1a1208]/80 p-4">
      <h3 className="font-extrabold">{titleAr}</h3>
      <p className="mt-2 text-sm leading-7 text-white/70">{leadAr}</p>
      {demoPreview && isLab && statsCopy ? (
        <p className="mt-2 text-xs font-bold text-[#f4d7a8]">{statsCopy.inviteStatsDemoNoteAr}</p>
      ) : null}
      <div className="mt-4 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
        <div className="rounded-xl border border-[#d4a574]/30 bg-black/30 px-2 py-3">
          <p className="text-2xl font-black text-[#d4a574]">{displayStats.total}</p>
          <p className="mt-1 text-[11px] leading-5 text-white/60">
            {statsCopy?.inviteStatsCreatedAr || 'روابط أُنشئت'}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/30 px-2 py-3">
          <p className="text-2xl font-black">{displayStats.opened}</p>
          <p className="mt-1 text-[11px] leading-5 text-white/60">
            {statsCopy?.inviteStatsOpenedAr || 'روابط فُتحت'}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/30 px-2 py-3">
          <p className="text-2xl font-black">{pendingCount}</p>
          <p className="mt-1 text-[11px] leading-5 text-white/60">
            {statsCopy?.inviteStatsPendingAr || 'روابط لم تُفتح'}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/30 px-2 py-3">
          <p className="text-2xl font-black">{displayStats.revoked}</p>
          <p className="mt-1 text-[11px] leading-5 text-white/60">
            {statsCopy?.inviteStatsRevokedAr || 'روابط أُلغيت'}
          </p>
        </div>
      </div>
      <p className="mt-2 text-sm leading-6 text-white/55">
        توليد الروابط بلا سقف إجمالي ضمن مدة التفعيل. الإرسال من واتساب جهازكم، بلا حفظ أرقام الضيوف.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => void prepare()}
          className="rounded-full bg-[#d4a574] px-4 py-2 text-sm font-bold text-[#061018] disabled:opacity-50"
        >
          {busy ? 'جاري التجهيز…' : ctaAr}
        </button>
        <button
          type="button"
          disabled={busy || !selected}
          onClick={() => void sendOne(selected)}
          className="rounded-full border border-[#d4a574]/50 px-4 py-2 text-sm font-bold disabled:opacity-50"
        >
          أرسل التالي من واتساب
        </button>
      </div>
      <div className="mt-4 rounded-2xl border border-[#d4a574]/25 bg-black/25 p-4">
        <p className="text-sm font-extrabold">دفعة لمفوض من العائلة</p>
        <p className="mt-2 text-sm leading-7 text-white/70">
          ولّدوا جملة روابط وابعثوها دفعة واحدة لأخت العروس أو الخالة أو من تفوضونه. المنصة لا تحفظ أرقاماً. الإرسال من واتساب جهازكم.
        </p>
        <p className="mt-2 text-sm leading-7 text-[#f4d7a8]">
          تنبيه للمفوض: لا تفتحوا أي رابط. أرسلوه لمدعو واحد وهو نظيف لم يُفتح. إن فُتح على جهازكم يُربط به ويتعذر إرساله.
        </p>
        <p className="mt-3 text-sm text-white/60">عدد الروابط في الدفعة</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {GUEST_DELEGATE_PACK_SIZES.map((size) => (
            <button
              key={size}
              type="button"
              disabled={busy}
              onClick={() => setPackSize(normalizeGuestDelegatePackSize(size))}
              className={
                packSize === size
                  ? 'rounded-full bg-[#d4a574] px-3 py-1.5 text-sm font-bold text-[#061018]'
                  : 'rounded-full border border-white/20 px-3 py-1.5 text-sm font-bold disabled:opacity-50'
              }
            >
              دفعة {size}
            </button>
          ))}
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => void sendDelegatePack(packSize)}
          className="mt-4 w-full rounded-full border border-[#d4a574]/60 px-4 py-2 text-sm font-bold disabled:opacity-50"
        >
          {busy ? 'جاري تجهيز الدفعة…' : `جهّز وأرسل دفعة ${packSize} في واتساب`}
        </button>
        {packDraft ? (
          <div className="mt-4">
            <p className="text-sm leading-7 text-[#f4d7a8]">
              نص الدفعة كامل هنا. الصقوه في واتساب قبل الإرسال. لا ترسلوا الرسالة القصيرة وحدها.
            </p>
            <textarea
              readOnly
              dir="rtl"
              rows={8}
              value={packDraft}
              className="mt-2 w-full rounded-xl border border-[#d4a574]/35 bg-[#061018] p-3 text-xs leading-6 text-white/85"
            />
            <button
              type="button"
              onClick={() => {
                void copyText(packDraft).then((ok) => {
                  setNote(
                    ok
                      ? 'نُسخ نص الدفعة مرة أخرى. الصقوه في محادثة المفوض ثم أرسلوا.'
                      : 'تعذر النسخ. حدّدوا النص أعلاه وانسخوه يدوياً.',
                  );
                });
              }}
              className="mt-2 rounded-full border border-[#d4a574]/50 px-4 py-2 text-sm font-bold"
            >
              انسخ الدفعة مرة أخرى
            </button>
          </div>
        ) : null}
      </div>
      {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
      {note ? <p className="mt-3 text-sm leading-7 text-[#f4d7a8]">{note}</p> : null}
      {ready.length ? (
        <label className="mt-4 block text-sm">
          منسدلة الروابط الجاهزة
          <select
            className="mt-1 h-11 w-full rounded-md border border-white/15 bg-[#061018] px-3"
            value={selected?.id || ''}
            onChange={(event) => setSelectedId(event.target.value)}
          >
            {ready.map((item) => (
              <option key={item.id} value={item.id}>
                رابط مدعو {item.n}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      {managed.length ? (
        <div className="mt-4 rounded-2xl border border-white/12 bg-black/25 p-3">
          <p className="text-sm font-extrabold">إدارة الروابط المرسلة</p>
          <ul className="mt-3 max-h-52 space-y-2 overflow-auto text-sm leading-6">
            {managed.slice(-40).reverse().map((item) => (
              <li key={item.id} className="rounded-xl border border-white/10 px-3 py-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span>
                    رابط {item.n}: {inviteStatusLabel(item)}
                  </span>
                  {!item.revoked ? (
                    <div className="flex flex-wrap gap-1">
                      {!item.opened ? (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void runInviteAction(item.id, 'revoke')}
                          className="rounded-full border border-white/20 px-2 py-1 text-xs font-bold disabled:opacity-50"
                        >
                          إلغاء
                        </button>
                      ) : null}
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void runInviteAction(item.id, 'reissue')}
                        className="rounded-full border border-[#d4a574]/40 px-2 py-1 text-xs font-bold disabled:opacity-50"
                      >
                        رابط بديل
                      </button>
                      {item.opened ? (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void runInviteAction(item.id, 'reset')}
                          className="rounded-full border border-white/20 px-2 py-1 text-xs font-bold disabled:opacity-50"
                        >
                          إعادة تهيئة
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
