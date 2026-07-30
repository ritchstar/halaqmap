/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useCallback, useEffect, useState } from 'react';
import { CalendarDays, Loader2, Plus, Scissors, Trash2, UserRound } from 'lucide-react';
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
  setTeamSlotBlockRemote,
  updateContactModeRemote,
  upsertTeamMemberRemote,
  bookBarberPath,
  type ContactMode,
  type TeamMemberRemote,
} from '@/lib/namedBarberBookingRemote';
import { readBarberAuthSession } from '@/lib/barberPortalSession';
import { cn } from '@/lib/utils';

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function BarberTeamBookingSection() {
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<TeamMemberRemote[]>([]);
  const [contactMode, setContactMode] = useState<ContactMode>('classic');
  const [name, setName] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [scheduleDate, setScheduleDate] = useState(todayIso());
  const [slots, setSlots] = useState<string[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [bookingLinkCopied, setBookingLinkCopied] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    const res = await listTeamMembersRemote();
    setLoading(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    setMembers(res.members);
    setContactMode(res.contactMode);
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

  const addMember = async () => {
    if (!name.trim()) {
      toast.error('أدخل اسم الحلاق.');
      return;
    }
    setSaving(true);
    const res = await upsertTeamMemberRemote({
      displayName: name.trim(),
      photoUrl: photoUrl.trim() || null,
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
    setPhotoUrl('');
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

  const toggleContactMode = async (checked: boolean) => {
    const next: ContactMode = checked ? 'booking_only' : 'classic';
    const res = await updateContactModeRemote(next);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    setContactMode(res.contactMode);
    toast.success(
      next === 'booking_only'
        ? 'تم تفعيل وضع الحجز بالاسم — أُخفي الاتصال المباشر من البطاقة.'
        : 'عاد وضع الاتصال الكلاسيكي (هاتف وواتساب).',
    );
  };

  const toggleSlot = async (slot: string, currentlyAvailable: boolean) => {
    if (!selectedId) return;
    // إن كان متاحاً → احظره؛ إن كان محظوراً/مشغولاً ولا يظهر في المتاح → حاول فك الحظر فقط
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
          أدر حلاقي الصالون وجدول الإتاحة، وأخفِ الاتصال المباشر لصالح صفحة الحجز المرتبطة بحسابك.
        </p>
      </div>

      <Card className="border-accent/30">
        <CardHeader>
          <CardTitle className="text-base">وضع الظهور على البطاقة</CardTitle>
          <CardDescription>
            عند التفعيل تُخفى أيقونات الهاتف والواتساب ويظهر زر الحجز والموقع فقط.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">وضع الحجز بالاسم — إخفاء الاتصال</p>
              <p className="text-xs text-muted-foreground">
                الحالة الحالية: {contactMode === 'booking_only' ? 'حجز فقط' : 'كلاسيكي'}
              </p>
            </div>
            <Switch
              checked={contactMode === 'booking_only'}
              onCheckedChange={(checked) => void toggleContactMode(checked)}
            />
          </div>
          {contactMode === 'booking_only' && members.filter((m) => m.is_active).length === 0 ? (
            <p className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-900 dark:text-amber-100">
              وضع الحجز مفعّل لكن لا يوجد حلاقون نشطون. أضف طاقماً أو سيُحجز على مستوى الصالون فقط.
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
          <CardDescription>حتى 25 حلاقاً — صورة واسم ومدة جلسة افتراضية.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>اسم الحلاق</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: أحمد" />
            </div>
            <div className="space-y-1.5">
              <Label>رابط الصورة (اختياري)</Label>
              <Input
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://…"
                dir="ltr"
                className="text-left"
              />
            </div>
          </div>
          <Button type="button" onClick={() => void addMember()} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            إضافة حلاق
          </Button>

          <div className="space-y-2">
            {members.length === 0 ? (
              <p className="text-sm text-muted-foreground">لا يوجد حلاقون بعد.</p>
            ) : (
              members.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    'flex items-center gap-3 rounded-lg border p-3',
                    selectedId === m.id ? 'border-accent bg-accent/5' : 'border-border',
                  )}
                >
                  <button
                    type="button"
                    className="flex flex-1 items-center gap-3 text-right"
                    onClick={() => setSelectedId(m.id)}
                  >
                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-muted">
                      {m.photo_url ? (
                        <img src={m.photo_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <Scissors className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{m.display_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {m.default_duration_minutes} د · {m.is_active ? 'نشط' : 'موقوف'}
                      </p>
                    </div>
                  </button>
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
