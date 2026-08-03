/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useCallback, useEffect, useState } from 'react';
import {
  CalendarDays,
  Copy,
  Loader2,
  Plus,
  RefreshCw,
  Scissors,
  Trash2,
  UserRound,
  ImagePlus,
  MessageCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/sonner';
import {
  deleteTeamMemberRemote,
  listDayScheduleRemote,
  listTeamMembersRemote,
  rotateStaffAccessTokenRemote,
  setTeamSlotBlockRemote,
  updateCardCtaRemote,
  upsertTeamMemberRemote,
  uploadTeamMemberPhotoRemote,
  bookBarberPath,
  staffBookingsAbsoluteUrl,
  type CardCtaFlags,
  type TeamMemberRemote,
  DEFAULT_CARD_CTA,
} from '@/lib/namedBarberBookingRemote';
import { readBarberAuthSession } from '@/lib/barberPortalSession';
import { buildWhatsAppChatHref } from '@/lib/saudiWhatsAppPhone';
import { optimizeImageFileForBarberPortfolio } from '@/lib/portfolioImageOptimization';
import { cn } from '@/lib/utils';

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function BarberTeamBookingSection() {
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<TeamMemberRemote[]>([]);
  const [cardCta, setCardCta] = useState<CardCtaFlags>({ ...DEFAULT_CARD_CTA });
  const [photoCount, setPhotoCount] = useState(0);
  const [maxPhotos, setMaxPhotos] = useState(10);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [scheduleDate, setScheduleDate] = useState(todayIso());
  const [slots, setSlots] = useState<string[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [bookingLinkCopied, setBookingLinkCopied] = useState(false);
  const [staffLinkCopiedId, setStaffLinkCopiedId] = useState<string | null>(null);
  const [notifyDraft, setNotifyDraft] = useState<Record<string, string>>({});
  const [savingNotifyId, setSavingNotifyId] = useState<string | null>(null);
  const [rotatingId, setRotatingId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const res = await listTeamMembersRemote();
    setLoading(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    setMembers(res.members);
    setCardCta(res.cardCta);
    setPhotoCount(res.photoCount);
    setMaxPhotos(res.maxPhotos);
    setNotifyDraft(
      Object.fromEntries(res.members.map((m) => [m.id, String(m.notify_phone ?? '')])),
    );
    setSelectedId((prev) => {
      if (prev && res.members.some((m) => m.id === prev)) return prev;
      return res.members[0]?.id ?? null;
    });
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const refreshSchedule = useCallback(async () => {
    if (!selectedId) {
      setSlots([]);
      setAvailableSlots([]);
      return;
    }
    setScheduleLoading(true);
    const res = await listDayScheduleRemote({
      teamMemberId: selectedId,
      bookingDate: scheduleDate,
    });
    setScheduleLoading(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    setSlots(res.slots);
    setAvailableSlots(res.availableSlots);
  }, [selectedId, scheduleDate]);

  useEffect(() => {
    void refreshSchedule();
  }, [refreshSchedule]);

  const patchCta = async (key: keyof CardCtaFlags, value: boolean) => {
    const prev = cardCta;
    const next = { ...cardCta, [key]: value };
    setCardCta(next);
    const res = await updateCardCtaRemote({ [key]: value });
    if (!res.ok) {
      setCardCta(prev);
      toast.error(res.error);
      return;
    }
    setCardCta(res.cardCta);
    toast.success('تم حفظ إعداد ظهور الأيقونات على البطاقة.');
  };

  const addMember = async () => {
    if (!name.trim()) {
      toast.error('أدخل اسم الحلاق.');
      return;
    }
    setSaving(true);
    const res = await upsertTeamMemberRemote({
      displayName: name.trim(),
      sortOrder: members.length,
      isActive: true,
    });
    setSaving(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success('تمت إضافة الحلاق.');
    setName('');
    void refresh();
  };

  const removeMember = async (id: string) => {
    const res = await deleteTeamMemberRemote(id);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.message('تم حذف الحلاق من الطاقم.');
    void refresh();
  };

  const toggleActive = async (member: TeamMemberRemote, active: boolean) => {
    const res = await upsertTeamMemberRemote({
      memberId: member.id,
      displayName: member.display_name,
      photoUrl: member.photo_url,
      sortOrder: member.sort_order,
      isActive: active,
      defaultDurationMinutes: member.default_duration_minutes,
      internalNotes: member.internal_notes,
      returnToWorkDate: active ? null : member.return_to_work_date ?? null,
    });
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success(active ? 'الحلاق متاح للحجز.' : 'الحلاق خارج الخدمة.');
    void refresh();
  };

  const setReturnDate = async (member: TeamMemberRemote, date: string) => {
    const res = await upsertTeamMemberRemote({
      memberId: member.id,
      displayName: member.display_name,
      photoUrl: member.photo_url,
      sortOrder: member.sort_order,
      isActive: member.is_active,
      defaultDurationMinutes: member.default_duration_minutes,
      internalNotes: member.internal_notes,
      returnToWorkDate: date || null,
    });
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    void refresh();
  };

  const onPhotoSelected = async (member: TeamMemberRemote, file: File | null) => {
    if (!file) return;
    if (photoCount >= maxPhotos) {
      toast.error(`بلغت الحد (${maxPhotos} صور). احذف صورة قديمة أولاً.`);
      return;
    }
    setUploadingId(member.id);
    const opt = await optimizeImageFileForBarberPortfolio(file, 'gallery');
    if (!opt.ok) {
      setUploadingId(null);
      toast.error(opt.error);
      return;
    }
    const up = await uploadTeamMemberPhotoRemote({
      memberId: member.id,
      imageBase64: opt.imageBase64,
    });
    setUploadingId(null);
    if (!up.ok) {
      toast.error(up.error);
      return;
    }
    toast.success('تم رفع صورة الحلاق.');
    void refresh();
  };

  const toggleSlot = async (slot: string, currentlyAvailable: boolean) => {
    if (!selectedId) return;
    const blocked = currentlyAvailable;
    const res = await setTeamSlotBlockRemote({
      teamMemberId: selectedId,
      bookingDate: scheduleDate,
      startTime: slot,
      blocked,
    });
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    void refreshSchedule();
  };

  const copyBookingLink = async () => {
    const barberId = String(readBarberAuthSession()?.id ?? '').trim();
    if (!barberId) {
      toast.error('تعذّر قراءة معرّف الصالون من الجلسة.');
      return;
    }
    const full = `${window.location.origin}/#${bookBarberPath(barberId)}`;
    try {
      await navigator.clipboard.writeText(full);
      setBookingLinkCopied(true);
      toast.success('تم نسخ رابط صفحة الحجز.');
      setTimeout(() => setBookingLinkCopied(false), 2000);
    } catch {
      toast.error('تعذّر النسخ.');
    }
  };

  const copyStaffLink = async (member: TeamMemberRemote) => {
    const token = String(member.staff_access_token ?? '').trim();
    if (!token) {
      toast.error('لا يوجد رابط لهذا الحلاق بعد. حدّث الصفحة أو أعد إصدار الرابط.');
      return;
    }
    try {
      await navigator.clipboard.writeText(staffBookingsAbsoluteUrl(token));
      setStaffLinkCopiedId(member.id);
      toast.success(`تم نسخ رابط متابعة حجوزات ${member.display_name}.`);
      setTimeout(() => setStaffLinkCopiedId((prev) => (prev === member.id ? null : prev)), 2000);
    } catch {
      toast.error('تعذّر النسخ.');
    }
  };

  const saveNotifyPhone = async (member: TeamMemberRemote) => {
    const phone = String(notifyDraft[member.id] ?? '').trim();
    setSavingNotifyId(member.id);
    const res = await upsertTeamMemberRemote({
      memberId: member.id,
      displayName: member.display_name,
      photoUrl: member.photo_url,
      sortOrder: member.sort_order,
      isActive: member.is_active,
      defaultDurationMinutes: member.default_duration_minutes,
      internalNotes: member.internal_notes,
      returnToWorkDate: member.return_to_work_date ?? null,
      notifyPhone: phone || null,
    });
    setSavingNotifyId(null);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success('تم حفظ رقم واتساب الحلاق.');
    void refresh();
  };

  const pingStaffWhatsApp = (member: TeamMemberRemote) => {
    const phone = String(member.notify_phone ?? notifyDraft[member.id] ?? '').trim();
    if (!phone) {
      toast.error('أدخل رقم واتساب الحلاق واحفظه أولاً.');
      return;
    }
    const token = String(member.staff_access_token ?? '').trim();
    if (!token) {
      toast.error('لا يوجد رابط متابعة لهذا الحلاق.');
      return;
    }
    const salonName = String(readBarberAuthSession()?.name ?? '').trim() || 'الصالون';
    const pageUrl = staffBookingsAbsoluteUrl(token);
    const message = [
      `حجز بانتظارك في ${salonName}.`,
      `الحلاق: ${member.display_name}`,
      `افتح صفحة متابعة حجوزاتك:`,
      pageUrl,
    ].join('\n');
    const href = buildWhatsAppChatHref(phone, message);
    if (!href) {
      toast.error('رقم واتساب غير صالح.');
      return;
    }
    window.open(href, '_blank', 'noopener,noreferrer');
  };

  const rotateStaffLink = async (member: TeamMemberRemote) => {
    setRotatingId(member.id);
    const res = await rotateStaffAccessTokenRemote(member.id);
    setRotatingId(null);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success('أُعيد إصدار الرابط. الرابط السابق لم يعد يعمل.');
    void refresh();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h2 className="text-xl font-bold sm:text-2xl">الحجز بالاسم والطاقم</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          تحكم بكل أيقونة على بطاقة الماسي بشكل مستقل، وأدر حضور الحلاقين وصورهم وجدول الإتاحة.
        </p>
      </div>

      <Card className="border-accent/30">
        <CardHeader>
          <CardTitle className="text-base">أيقونات البطاقة (ماسي)</CardTitle>
          <CardDescription>
            فعّل أو أخفِ كل أيقونة على حدة. يُطبَّق على البنر بعد البحث مباشرة.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {(
            [
              ['showPhone', 'الاتصال (هاتف)'],
              ['showWhatsApp', 'واتساب'],
              ['showChat', 'الشات الكتابي'],
              ['showBooking', 'الحجز المتقدم'],
            ] as const
          ).map(([key, label]) => (
            <div
              key={key}
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/20 px-3 py-2.5"
            >
              <p className="text-sm font-medium">{label}</p>
              <Switch
                checked={cardCta[key]}
                onCheckedChange={(checked) => void patchCta(key, checked)}
              />
            </div>
          ))}
          {cardCta.showBooking && members.filter((m) => m.is_active).length === 0 ? (
            <p className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-900 dark:text-amber-100">
              أيقونة الحجز مفعّلة لكن لا يوجد حلاقون نشطون. أضف طاقماً أو سيُحجز على مستوى الصالون.
            </p>
          ) : null}
          <Button type="button" variant="outline" size="sm" onClick={() => void copyBookingLink()}>
            {bookingLinkCopied ? 'تم النسخ' : 'نسخ رابط صفحة الحجز'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <UserRound className="h-5 w-5" />
            طاقم الحلاقين
          </CardTitle>
          <CardDescription>
            حتى 25 حلاقاً — وصوّر الطاقم حتى {maxPhotos} صور مضغوطة على خوادم المنصة ({photoCount}/
            {maxPhotos}).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-1.5">
              <Label>اسم الحلاق</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: أحمد" />
            </div>
            <Button type="button" onClick={() => void addMember()} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              إضافة
            </Button>
          </div>

          <div className="space-y-3">
            {members.length === 0 ? (
              <p className="text-sm text-muted-foreground">لا يوجد حلاقون بعد.</p>
            ) : (
              members.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    'space-y-3 rounded-lg border p-3',
                    selectedId === m.id ? 'border-accent bg-accent/5' : 'border-border',
                    !m.is_active ? 'opacity-80' : '',
                  )}
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className="flex flex-1 items-center gap-3 text-right"
                      onClick={() => setSelectedId(m.id)}
                    >
                      <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-muted">
                        {m.photo_url ? (
                          <img src={m.photo_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <Scissors className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{m.display_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {m.is_active ? 'متاح للحجز' : 'خارج الخدمة'}
                          {!m.is_active && m.return_to_work_date
                            ? ` · يعود ${m.return_to_work_date}`
                            : ''}
                        </p>
                      </div>
                    </button>
                    <label className="inline-flex cursor-pointer items-center">
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        disabled={uploadingId === m.id}
                        onChange={(e) => {
                          const f = e.target.files?.[0] ?? null;
                          e.target.value = '';
                          void onPhotoSelected(m, f);
                        }}
                      />
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border hover:bg-muted">
                        {uploadingId === m.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ImagePlus className="h-4 w-4" />
                        )}
                      </span>
                    </label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => void removeMember(m.id)}
                      title="حذف"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={m.is_active}
                        onCheckedChange={(checked) => void toggleActive(m, checked)}
                      />
                      <span className="text-xs text-muted-foreground">متاح للحجز</span>
                    </div>
                    {!m.is_active ? (
                      <div className="flex items-center gap-2">
                        <Label className="text-xs whitespace-nowrap">تاريخ العودة للعمل</Label>
                        <Input
                          type="date"
                          className="h-8 w-40 text-xs"
                          value={m.return_to_work_date ?? ''}
                          onChange={(e) => void setReturnDate(m, e.target.value)}
                        />
                      </div>
                    ) : null}
                  </div>

                  <div className="space-y-2 rounded-md border border-border/70 bg-muted/20 p-2.5">
                    <p className="text-xs font-medium text-foreground">متابعة حجوزات الحلاق</p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => void copyStaffLink(m)}
                      >
                        <Copy className="h-3.5 w-3.5" />
                        {staffLinkCopiedId === m.id ? 'تم النسخ' : 'نسخ رابط متابعة الحجوزات'}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="gap-1.5"
                        disabled={rotatingId === m.id}
                        onClick={() => void rotateStaffLink(m)}
                        title="إبطال الرابط السابق وإصدار رابط جديد"
                      >
                        {rotatingId === m.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <RefreshCw className="h-3.5 w-3.5" />
                        )}
                        إعادة إصدار الرابط
                      </Button>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                      <div className="flex-1 space-y-1">
                        <Label className="text-xs">واتساب الحلاق (اختياري)</Label>
                        <Input
                          inputMode="tel"
                          dir="ltr"
                          className="h-8 text-xs"
                          placeholder="05xxxxxxxx"
                          value={notifyDraft[m.id] ?? ''}
                          onChange={(e) =>
                            setNotifyDraft((prev) => ({ ...prev, [m.id]: e.target.value }))
                          }
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          disabled={savingNotifyId === m.id}
                          onClick={() => void saveNotifyPhone(m)}
                        >
                          {savingNotifyId === m.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            'حفظ الرقم'
                          )}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          className="gap-1.5"
                          onClick={() => pingStaffWhatsApp(m)}
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                          نبّه الحلاق
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarDays className="h-5 w-5" />
            جدول إتاحة تفاعلي
          </CardTitle>
          <CardDescription>
            اضغط على وقت متاح لإغلاقه يدوياً، أو على وقت محظور لإعادة فتحه. الحجوزات النشطة تُغلق تلقائياً.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!selectedId ? (
            <p className="text-sm text-muted-foreground">اختر حلاقاً من القائمة أعلاه لإدارة جدوله.</p>
          ) : (
            <>
              <div className="space-y-1.5">
                <Label>اليوم</Label>
                <Input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="max-w-xs"
                />
              </div>
              {scheduleLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  جاري تحميل الجدول…
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                  {slots.map((slot) => {
                    const available = availableSlots.includes(slot);
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => void toggleSlot(slot, available)}
                        className={cn(
                          'rounded-md border px-2 py-2 text-xs tabular-nums transition',
                          available
                            ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100'
                            : 'border-border bg-muted/40 text-muted-foreground line-through',
                        )}
                        title={available ? 'متاح — اضغط للإغلاق' : 'مغلق/مشغول — اضغط لمحاولة الفتح'}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
