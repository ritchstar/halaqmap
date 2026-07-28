/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  adminFounderCompActivateRemote,
  adminFounderCompLookupRemote,
  type FounderCompBarberHit,
} from '@/lib/adminFounderCompRemote';

const TIER_OPTIONS = [
  { value: 'bronze', label: 'برونزي — 90 يوماً' },
  { value: 'gold', label: 'ذهبي — 90 يوماً' },
  { value: 'diamond', label: 'ماسي — 90 يوماً' },
] as const;

type Props = {
  accessToken: string;
};

function formatUntil(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('ar-SA', { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

export function FounderCompActivatePanel({ accessToken }: Props) {
  const [query, setQuery] = useState('');
  const [barber, setBarber] = useState<FounderCompBarberHit | null>(null);
  const [candidates, setCandidates] = useState<FounderCompBarberHit[]>([]);
  const [tier, setTier] = useState<'bronze' | 'gold' | 'diamond'>('bronze');
  const [reason, setReason] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [activateLoading, setActivateLoading] = useState(false);
  const [lastResult, setLastResult] = useState<{
    validUntil: string;
    previousValidUntil: string | null;
    listingDaysGranted: number;
    listingDaysRemaining: number;
    previousListingDaysRemaining: number;
    tier: string;
  } | null>(null);

  const pickBarber = (hit: FounderCompBarberHit) => {
    setBarber(hit);
    setCandidates([]);
    const t = String(hit.tier ?? '').toLowerCase();
    if (t === 'gold' || t === 'diamond' || t === 'bronze') setTier(t);
  };

  return (
    <Card className="border-amber-500/40 bg-amber-500/5">
      <CardHeader>
        <CardTitle>تفعيل مؤسسي — 90 يوماً بدون دفع</CardTitle>
        <CardDescription>
          صلاحية المؤسس فقط. ابحث عن أي حساب (بريد / هاتف / رقم عضوية / معرّف طلب `HM-…` / UUID)
          ثم فعّل الباقة لمدة 90 يوماً مكدّسة فوق الصلاحية السارية إن وُجدت.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <div className="space-y-2">
            <Label htmlFor="founder-comp-q">بحث الحساب</Label>
            <Input
              id="founder-comp-q"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              dir="ltr"
              placeholder="email@… / 05… / HM-… / UUID"
            />
          </div>
          <div className="flex items-end">
            <Button
              type="button"
              variant="secondary"
              disabled={lookupLoading || !query.trim()}
              onClick={async () => {
                setLookupLoading(true);
                setLastResult(null);
                setCandidates([]);
                setBarber(null);
                try {
                  const res = await adminFounderCompLookupRemote({
                    accessToken,
                    query: query.trim(),
                  });
                  if (res.ok === false) {
                    if (res.candidates && res.candidates.length > 0) {
                      setCandidates(res.candidates);
                      toast.message('عدة نتائج — اختر الحساب المطلوب');
                    } else {
                      toast.error(res.error === 'barber_not_found' ? 'لم يُعثر على الحساب' : res.error);
                    }
                    return;
                  }
                  pickBarber(res.barber);
                  toast.success('تم العثور على الحساب');
                } finally {
                  setLookupLoading(false);
                }
              }}
            >
              {lookupLoading ? 'جاري البحث…' : 'بحث'}
            </Button>
          </div>
        </div>

        {candidates.length > 0 ? (
          <div className="space-y-2 rounded-lg border border-border/70 bg-background/60 p-3">
            <p className="text-sm font-semibold">نتائج متعددة — اختر حساباً:</p>
            <ul className="space-y-2">
              {candidates.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    className="w-full rounded-md border border-border/60 px-3 py-2 text-right text-sm hover:bg-muted/40"
                    onClick={() => pickBarber(c)}
                  >
                    <span className="font-medium">{c.name || 'بدون اسم'}</span>
                    <span className="mt-0.5 block font-mono text-xs text-muted-foreground" dir="ltr">
                      {c.email || '—'} · {c.phone || '—'} · {c.id.slice(0, 8)}…
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {barber ? (
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-sm space-y-1">
            <p>
              <span className="font-semibold">{barber.name || '—'}</span>
              {barber.member_number != null ? (
                <span className="text-muted-foreground"> · عضوية {barber.member_number}</span>
              ) : null}
            </p>
            <p className="font-mono text-xs text-muted-foreground" dir="ltr">
              {barber.id}
            </p>
            <p dir="ltr" className="text-xs text-muted-foreground">
              {barber.email || '—'} · {barber.phone || '—'} · tier: {barber.tier || '—'}
            </p>
            <p>
              صلاحية حالية حتى:{' '}
              <span className="font-medium">{formatUntil(barber.current_valid_until)}</span>
              {' · '}
              <span className="font-semibold text-amber-200">
                {Number(barber.listing_days_remaining ?? 0)} يوم متبقٍ
              </span>
              {barber.active_tiers ? (
                <span className="text-muted-foreground"> (باقة الإدراج: {barber.active_tiers})</span>
              ) : null}
            </p>
            <p className="text-xs text-muted-foreground">
              المصدر: نفس ملخص لوحة الحلاق (`barber_listing_summary`)
            </p>
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>الباقة المفعّلة</Label>
            <Select
              value={tier}
              onValueChange={(v) => {
                if (v === 'bronze' || v === 'gold' || v === 'diamond') setTier(v);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIER_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="founder-comp-reason">سبب المنحة (إلزامي)</Label>
            <Textarea
              id="founder-comp-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              placeholder="مثال: أصدر رخصة وغادر الدفع — تفعيل ترويجي 90 يوماً"
            />
          </div>
        </div>

        {lastResult ? (
          <p className="rounded-lg border border-sky-500/40 bg-sky-500/10 p-3 text-sm">
            تم التفعيل: {lastResult.listingDaysGranted} يوماً ({lastResult.tier}) — ساري حتى{' '}
            <strong>{formatUntil(lastResult.validUntil)}</strong>
            {' · '}
            <strong>{lastResult.listingDaysRemaining} يوم متبقٍ</strong>
            {lastResult.previousValidUntil ? (
              <>
                {' '}
                (كان {lastResult.previousListingDaysRemaining} يوماً / حتى{' '}
                {formatUntil(lastResult.previousValidUntil)})
              </>
            ) : null}
            <span className="mt-1 block text-xs text-muted-foreground">
              الأيام المتبقية من نفس مصدر لوحة الحلاق
            </span>
          </p>
        ) : null}

        <Button
          type="button"
          className="bg-amber-600 hover:bg-amber-700 text-white"
          disabled={activateLoading || !barber || reason.trim().length < 3}
          onClick={async () => {
            if (!barber) return;
            setActivateLoading(true);
            try {
              const res = await adminFounderCompActivateRemote({
                accessToken,
                barberId: barber.id,
                tier,
                reason: reason.trim(),
                lookupQuery: query.trim() || undefined,
              });
              if (!res.ok) {
                toast.error(res.error);
                return;
              }
              setLastResult({
                validUntil: res.validUntil,
                previousValidUntil: res.previousValidUntil,
                listingDaysGranted: res.listingDaysGranted,
                listingDaysRemaining: res.listingDaysRemaining,
                previousListingDaysRemaining: res.previousListingDaysRemaining,
                tier: res.tier,
              });
              setBarber({
                ...barber,
                tier: res.tier,
                current_valid_until: res.validUntil,
                listing_days_remaining: res.listingDaysRemaining,
                active_tiers: res.tier,
                is_active: true,
              });
              toast.success(
                `تم التفعيل — الحلاق يرى الآن ${res.listingDaysRemaining} يوماً متبقياً`
              );
            } finally {
              setActivateLoading(false);
            }
          }}
        >
          {activateLoading ? 'جاري التفعيل…' : 'تفعيل 90 يوماً'}
        </Button>
      </CardContent>
    </Card>
  );
}
