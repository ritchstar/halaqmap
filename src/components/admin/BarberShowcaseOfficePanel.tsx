import { useCallback, useEffect, useMemo, useState } from 'react';
import { GraduationCap, Loader2, Sparkles, Wand2 } from 'lucide-react';
import BarberDashboard from '@/pages/BarberDashboard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/sonner';
import { SubscriptionTier } from '@/lib/index';
import type { BarberPortalSession } from '@/lib/barberPortalLoginRemote';
import type { ListingLicenseBalance } from '@/lib/listingLicenseRemote';
import {
  ensureShowcaseBarberAdmin,
  fetchPlatformShowcaseSettingsAdmin,
  savePlatformShowcaseSettingsAdmin,
  type PlatformShowcaseSettingsPayload,
  type ShowcaseBarberSummary,
} from '@/lib/platformShowcaseSettingsRemote';
import { PLATFORM_SHOWCASE_EDUCATION_INTRO } from '@/config/platformSmartTracking';

const SHOWCASE_OFFICE_EMAIL = 'platform-showcase@halaqmap.com';

function buildPreviewSession(barber: ShowcaseBarberSummary): BarberPortalSession {
  return {
    id: barber.id,
    name: barber.name,
    email: SHOWCASE_OFFICE_EMAIL,
    phone: barber.phone,
    subscription: SubscriptionTier.DIAMOND,
    ratingInviteToken: 'showcase-preview',
    memberNumber: null,
    openForCustomers: true,
    openStatusToken: '',
  };
}

const PREVIEW_LISTING_BALANCE: ListingLicenseBalance = {
  hasActiveListing: true,
  listingDaysRemaining: 3650,
  validUntil: new Date(Date.now() + 3650 * 86400000).toISOString(),
  activeTier: 'diamond',
};

type BarberShowcaseOfficePanelProps = {
  isActive: boolean;
};

export function BarberShowcaseOfficePanel({ isActive }: BarberShowcaseOfficePanelProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ensuring, setEnsuring] = useState(false);
  const [settings, setSettings] = useState<PlatformShowcaseSettingsPayload | null>(null);
  const [barber, setBarber] = useState<ShowcaseBarberSummary | null>(null);
  const [educationDraft, setEducationDraft] = useState(PLATFORM_SHOWCASE_EDUCATION_INTRO);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetchPlatformShowcaseSettingsAdmin();
    setLoading(false);
    if (res.ok === false) {
      toast.error(res.error);
      return;
    }
    setSettings(res.settings);
    setBarber(res.barber);
    setEducationDraft(res.settings.education_intro_ar || PLATFORM_SHOWCASE_EDUCATION_INTRO);
  }, []);

  useEffect(() => {
    if (!isActive) return;
    void load();
  }, [isActive, load]);

  const previewSession = useMemo(
    () => (barber ? buildPreviewSession(barber) : null),
    [barber],
  );

  const persistSettings = async (patch: Partial<PlatformShowcaseSettingsPayload>) => {
    setSaving(true);
    const res = await savePlatformShowcaseSettingsAdmin(patch);
    setSaving(false);
    if (res.ok === false) {
      toast.error(res.error);
      return false;
    }
    setSettings(res.settings);
    toast.success('تم حفظ إعدادات المعاينة');
    return true;
  };

  const handleEnsureBarber = async () => {
    setEnsuring(true);
    const res = await ensureShowcaseBarberAdmin();
    setEnsuring(false);
    if (res.ok === false) {
      toast.error(res.error);
      return;
    }
    if (res.barber) setBarber(res.barber);
    toast.success(res.created ? 'تم إنشاء حساب المعاينة' : 'حساب المعاينة جاهز');
    void load();
  };

  if (!isActive) return null;

  if (loading && !settings) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin ml-2" />
        جاري تحميل مكتب المعاينة…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Alert className="border-teal-400/30 bg-teal-500/5">
        <GraduationCap className="h-4 w-4 text-teal-400" />
        <AlertTitle>مكتب المعاينة الماسي — للمؤسس فقط</AlertTitle>
        <AlertDescription className="text-sm leading-relaxed">
          هنا تُعدّل لوحة الشريك كما يراها العميل عند غياب نتائج في منطقته. البنر التعليمي يطمئن المستخدم
          ويشرح شكل المنصة — دون خطاب مباشر للمستثمر.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-teal-400" />
              التحكم بالخريطة
            </CardTitle>
            <CardDescription>
              بعد توافد حلاقين حقيقيين، أوقف المعاينة على الخريطة — تبقى لوحة التحكم للتجربة.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between gap-3 rounded-xl border border-border/60 p-3">
              <div>
                <Label htmlFor="showcase-map-visible" className="font-semibold">
                  إظهار المعاينة للعملاء
                </Label>
                <p className="text-xs text-muted-foreground mt-1">مفتاح عام — إخفاء/إظهار على الخريطة</p>
              </div>
              <Switch
                id="showcase-map-visible"
                checked={settings?.map_visible !== false}
                disabled={saving}
                onCheckedChange={(checked) => {
                  void persistSettings({ map_visible: checked === true });
                }}
              />
            </div>

            <div className="flex items-center justify-between gap-3 rounded-xl border border-border/60 p-3">
              <div>
                <Label htmlFor="showcase-fallback" className="font-semibold">
                  fallback عند غياب النتائج
                </Label>
                <p className="text-xs text-muted-foreground mt-1">يظهر البنر عندما لا يجد الاستعلام شريكاً حقيقياً</p>
              </div>
              <Switch
                id="showcase-fallback"
                checked={settings?.fallback_when_empty !== false}
                disabled={saving}
                onCheckedChange={(checked) => {
                  void persistSettings({ fallback_when_empty: checked === true });
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="showcase-education">النص التعليمي للمستخدم</Label>
              <Textarea
                id="showcase-education"
                dir="rtl"
                className="min-h-[120px] text-sm"
                value={educationDraft}
                onChange={(e) => setEducationDraft(e.target.value)}
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={saving}
                onClick={() => void persistSettings({ education_intro_ar: educationDraft })}
              >
                حفظ النص
              </Button>
            </div>

            <div className="rounded-xl border border-dashed border-border/70 p-3 space-y-3">
              <p className="text-sm font-semibold">حساب المعاينة</p>
              {barber ? (
                <p className="text-xs text-muted-foreground">
                  {barber.name} · {barber.address}
                </p>
              ) : (
                <p className="text-xs text-amber-600">لم يُنشأ حساب المعاينة بعد.</p>
              )}
              <Button type="button" disabled={ensuring} onClick={() => void handleEnsureBarber()} className="gap-2">
                {ensuring ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                {barber ? 'تحديث/تأكيد حساب المعاينة' : 'إنشاء حساب المعاينة الماسي'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border/40 bg-muted/20">
            <CardTitle className="text-lg">معاينة لوحة الشريك (ماسي)</CardTitle>
            <CardDescription>تحكم كامل — رفع المعرض والبنر كما في الإنتاج</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {previewSession ? (
              <div className="max-h-[78vh] overflow-auto border-t border-border/40">
                <BarberDashboard
                  founderPreview
                  previewSession={previewSession}
                  previewListingBalance={PREVIEW_LISTING_BALANCE}
                  previewChrome={
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <GraduationCap className="h-4 w-4 text-teal-500" />
                      <span className="font-semibold text-foreground">وضع معاينة المؤسس</span>
                      <span>— التغييرات تُحفظ على حساب المعاينة في قاعدة البيانات</span>
                    </div>
                  }
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 py-20 text-center text-muted-foreground">
                <Wand2 className="h-8 w-8 opacity-40" />
                <p className="text-sm">أنشئ حساب المعاينة أولاً لعرض لوحة الشريك هنا.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
