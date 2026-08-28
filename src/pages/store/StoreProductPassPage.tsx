/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * صفحة الجوال: صناعة بطاقة كيو آر المنتج ثم إبرازها كثقة تعامل.
 * الخيارات: افتح أو انسخ الرابط فقط.
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { toast } from '@/components/ui/sonner';
import {
  STORE_PRODUCT_PASS_COPY as COPY,
  STORE_PRODUCT_PASS_META,
  STORE_PRODUCT_PASS_ROLES,
} from '@/config/storeProductPass';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { readHashQueryParams } from '@/lib/hashQueryParams';
import {
  isStoreProductPassKind,
  parsePassName,
  parsePassRole,
  parsePassToken,
  passCardAbsoluteUrl,
  passCardPath,
  passRoleLabelAr,
  passShopUrl,
  type StoreProductPassCard,
} from '@/lib/storeProductPass';

const fieldClass =
  'mt-1 w-full rounded-xl border border-white/15 bg-[#061018] px-3 py-3 text-sm text-[#f4efe4] outline-none';

function readCard(
  kindRaw: string | undefined,
  tokenRaw: string | undefined,
  search: URLSearchParams,
): StoreProductPassCard | null {
  if (!isStoreProductPassKind(kindRaw || '')) return null;
  const token = parsePassToken(tokenRaw);
  if (!token) return null;
  const name = parsePassName(search.get('n'));
  const role = parsePassRole(search.get('r'));
  if (!name || !role) return null;
  const shopName = parsePassName(search.get('s')) || '';
  const qrStamp = String(search.get('qr') || '').trim().slice(0, 40);
  return { kind: kindRaw, token, name, role, shopName, qrStamp };
}

export default function StoreProductPassPage() {
  const navigate = useNavigate();
  const { kind: kindRaw = '', token: tokenRaw = '' } = useParams<{ kind: string; token: string }>();
  const [searchParams] = useSearchParams();
  useDocumentTitle(COPY.documentTitle);

  const kind = isStoreProductPassKind(kindRaw) ? kindRaw : null;
  const token = parsePassToken(tokenRaw);
  const query = useMemo(() => {
    if (searchParams.get('n') || searchParams.get('r') || searchParams.get('s') || searchParams.get('qr')) {
      return searchParams;
    }
    return readHashQueryParams();
  }, [searchParams]);
  const card = useMemo(() => readCard(kindRaw, tokenRaw, query), [kindRaw, tokenRaw, query]);
  const seedShop = parsePassName(query.get('s')) || '';
  const seedStamp = String(query.get('qr') || '').trim().slice(0, 40);

  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'robots');
    meta.setAttribute('content', 'noindex, nofollow');
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  useEffect(() => {
    if (!card || typeof navigator === 'undefined' || !('wakeLock' in navigator)) return undefined;
    let sentinel: WakeLockSentinel | null = null;
    const lock = async () => {
      try {
        sentinel = await navigator.wakeLock.request('screen');
      } catch {
        sentinel = null;
      }
    };
    void lock();
    const onVisible = () => {
      if (document.visibilityState === 'visible') void lock();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      void sentinel?.release();
    };
  }, [card]);

  function buildCard(): StoreProductPassCard | null {
    if (!kind || !token) return null;
    const parsedName = parsePassName(name);
    const parsedRole = parsePassRole(role);
    if (!parsedName) {
      toast.error(COPY.needNameAr);
      return null;
    }
    if (!parsedRole) {
      toast.error(COPY.needRoleAr);
      return null;
    }
    return {
      kind,
      token,
      name: parsedName,
      role: parsedRole,
      shopName: seedShop,
      qrStamp: seedStamp,
    };
  }

  function onOpen() {
    const next = buildCard();
    if (!next) return;
    navigate(passCardPath(next));
  }

  async function onCopy() {
    const next = buildCard();
    if (!next) return;
    try {
      await navigator.clipboard.writeText(passCardAbsoluteUrl(next));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error(COPY.copyFailAr);
    }
  }

  if (!kind || !token) {
    return (
      <div dir="rtl" className="flex min-h-[100svh] items-center justify-center bg-[#061018] px-4 text-center text-sm text-white/70">
        {COPY.missingAr}
      </div>
    );
  }

  const meta = STORE_PRODUCT_PASS_META[kind];

  if (card) {
    const shopUrl = passShopUrl(card.kind, card.token, card.qrStamp);
    return (
      <div
        dir="rtl"
        className="flex min-h-[100svh] flex-col items-center justify-center px-4 py-6"
        style={{
          background: '#061018',
          paddingTop: 'max(1.25rem, env(safe-area-inset-top))',
          paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))',
        }}
      >
        <article
          className="w-full max-w-sm rounded-3xl border bg-[#0b1a24] px-5 py-6 text-center"
          style={{ borderColor: `${meta.accent}55` }}
        >
          <p className="text-xs font-bold tracking-wide" style={{ color: meta.accent }}>
            {COPY.presentBadgeAr}
          </p>
          <h1 className="mt-2 text-2xl font-extrabold text-[#f4efe4]">{card.shopName || meta.skuAr}</h1>
          <p className="mt-1 text-sm font-bold text-white/70">{meta.skuAr}</p>
          <p className="mt-4 text-xl font-extrabold text-[#f4efe4]">{card.name}</p>
          <p className="mt-1 text-sm font-bold" style={{ color: meta.accent }}>
            {passRoleLabelAr(card.role)}
          </p>
          <div className="mx-auto mt-5 w-fit rounded-2xl bg-white p-3">
            <QRCode value={shopUrl} size={196} />
          </div>
          <p className="mt-4 text-sm leading-7 text-white/75">{COPY.scanHintAr}</p>
          <p className="mt-2 text-xs leading-6 text-white/50">{COPY.saveHintAr}</p>
        </article>
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className="min-h-[100svh] bg-[#061018] px-4 py-8 text-[#f4efe4]"
      style={{
        paddingTop: 'max(1.5rem, env(safe-area-inset-top))',
        paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))',
      }}
    >
      <div className="mx-auto w-full max-w-sm">
        <p className="text-sm font-bold" style={{ color: meta.accent }}>
          {COPY.kickerAr}
        </p>
        <h1 className="mt-2 text-3xl font-extrabold">{COPY.titleAr}</h1>
        <p className="mt-3 text-sm leading-7 text-white/75">{COPY.leadAr}</p>
        <p className="mt-2 text-sm font-bold" style={{ color: meta.accent }}>
          {seedShop || meta.skuAr}
        </p>
        <label className="mt-6 block text-sm font-bold">
          {COPY.nameLabelAr}
          <input className={fieldClass} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
        </label>
        <p className="mt-4 text-sm font-bold">{COPY.roleLabelAr}</p>
        <p className="mt-1 text-xs leading-6 text-white/50">{COPY.roleHintAr}</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {STORE_PRODUCT_PASS_ROLES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setRole(item.id)}
              className="rounded-full border px-3 py-2 text-sm font-bold"
              style={
                role === item.id
                  ? { background: meta.accent, color: meta.ink, borderColor: meta.accent }
                  : { borderColor: 'rgba(255,255,255,0.18)', color: 'rgba(244,239,228,0.85)' }
              }
            >
              {item.labelAr}
            </button>
          ))}
        </div>
        <div className="mt-6 grid gap-2">
          <button
            type="button"
            onClick={onOpen}
            className="rounded-full py-3 text-sm font-extrabold"
            style={{ background: meta.accent, color: meta.ink }}
          >
            {COPY.openAr}
          </button>
          <button
            type="button"
            onClick={() => void onCopy()}
            className="rounded-full border py-3 text-sm font-extrabold"
            style={{ borderColor: `${meta.accent}66`, color: meta.accent }}
          >
            {copied ? COPY.copiedAr : COPY.copyAr}
          </button>
        </div>
        <p className="mt-4 text-xs leading-6 text-white/50">{COPY.shareHintAr}</p>
        <p className="mt-2 text-xs leading-6 text-white/50">{COPY.saveHintAr}</p>
      </div>
    </div>
  );
}
