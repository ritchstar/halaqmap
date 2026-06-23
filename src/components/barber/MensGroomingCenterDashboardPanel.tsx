import { useMemo, useState } from 'react';
import { Check, Copy, Plus, Sparkles, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { SubscriptionTier } from '@/lib/index';
import type { BarberPortalSession } from '@/lib/barberPortalLoginRemote';
import { isActiveMensGroomingCenterSession } from '@/lib/mensGroomingCenterDashboardMode';
import { MENS_GROOMING_CENTER_FILTER_LABEL_AR } from '@/lib/mensGroomingCenterDisplay';
import {
  MENS_GROOMING_CENTER_DASHBOARD_LEDE_AR,
  MENS_GROOMING_CENTER_DASHBOARD_ONBOARDING_AR,
  MENS_GROOMING_CENTER_DASHBOARD_TIPS_AR,
} from '@/config/mensGroomingCenterDashboardCopy';
import { MENS_GROOMING_MANDATORY_HAIRCUT_AR } from '@/config/mensGroomingCenterPolicy';
import { MensGroomingCenterIcon } from '@/components/icons/MensGroomingCenterIcon';
import {
  MensGroomingCenterBadge,
  MensGroomingCenterDetailBanner,
  MensGroomingCenterHeroBanner,
} from '@/components/barber/MensGroomingCenterCardChrome';
import { updateBarberMensGroomingCenterRemote } from '@/lib/barberMensGroomingCenterRemote';

type Props = {
  barberId: string;
  barberData: BarberPortalSession;
  salonDisplayName: string;
  subscriptionTier: SubscriptionTier;
  onRefreshPortalSession: () => Promise<void>;
};

export function MensGroomingCenterDashboardPanel({
  barberId,
  barberData,
  salonDisplayName,
  subscriptionTier,
  onRefreshPortalSession,
}: Props) {
  const initialLines = barberData.mensGroomingCenter?.groomingCenterBannerLines?.length
    ? barberData.mensGroomingCenter.groomingCenterBannerLines
    : [MENS_GROOMING_MANDATORY_HAIRCUT_AR, ''];

  const [lines, setLines] = useState<string[]>(initialLines);
  const [saving, setSaving] = useState(false);

  const isActive = isActiveMensGroomingCenterSession({
    tier: subscriptionTier,
    mensGroomingCenter: barberData.mensGroomingCenter,
  });

  const previewLines = useMemo(
    () => lines.map((line) => line.trim()).filter(Boolean),
    [lines],
  );

  const handleSave = async () => {
    setSaving(true);
    const result = await updateBarberMensGroomingCenterRemote({
      barberId,
      email: barberData.email,
      groomingCenterBannerLines: previewLines,
    });
    setSaving(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success('تم حفظ خدمات البنر.');
    await onRefreshPortalSession();
  };

  return (
    <div className="space-y-6">
      <Card className="border-amber-500/30 bg-gradient-to-l from-amber-500/8 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <MensGroomingCenterIcon className="h-5 w-5 text-amber-600" />
            {MENS_GROOMING_CENTER_FILTER_LABEL_AR}
          </CardTitle>
          <CardDescription className="leading-relaxed">{MENS_GROOMING_CENTER_DASHBOARD_LEDE_AR}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Sparkles className="h-4 w-4" />
            <AlertDescription className="leading-relaxed">
              {MENS_GROOMING_CENTER_DASHBOARD_ONBOARDING_AR}
            </AlertDescription>
          </Alert>

          <div className="relative overflow-hidden rounded-xl border border-amber-400/25 bg-slate-900">
            <div className="relative h-36 bg-gradient-to-br from-slate-800 to-slate-950">
              <MensGroomingCenterHeroBanner lines={previewLines} />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-10">
                <p className="text-sm font-bold text-white">{salonDisplayName}</p>
                <MensGroomingCenterBadge className="mt-2" />
              </div>
            </div>
          </div>

          <MensGroomingCenterDetailBanner lines={previewLines} />

          <div className="space-y-3">
            <p className="text-sm font-semibold">خدمات البنر (أسماء حرة)</p>
            {lines.map((line, index) => (
              <div key={`groom-line-${index}`} className="flex gap-2">
                <Input
                  value={line}
                  onChange={(e) => {
                    const next = [...lines];
                    next[index] = e.target.value;
                    setLines(next);
                  }}
                  placeholder={index === 0 ? MENS_GROOMING_MANDATORY_HAIRCUT_AR : 'مثال: مساج رأس ورقبة'}
                  className="text-right"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  disabled={index === 0 || lines.length <= 2}
                  onClick={() => setLines(lines.filter((_, i) => i !== index))}
                  aria-label="حذف السطر"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {lines.length < 8 ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="gap-1.5"
                onClick={() => setLines([...lines, ''])}
              >
                <Plus className="h-4 w-4" />
                إضافة خدمة
              </Button>
            ) : null}
          </div>

          <Button type="button" onClick={() => void handleSave()} disabled={saving || !isActive}>
            {saving ? 'جاري الحفظ…' : 'حفظ خدمات البنر'}
          </Button>

          {!isActive ? (
            <p className="text-xs text-amber-700 dark:text-amber-300">
              يتطلب هذا المسار تفعيلاً ماسياً مع المكتب الخاص عند التسجيل.
            </p>
          ) : null}

          <ul className="space-y-2 text-sm text-muted-foreground">
            {MENS_GROOMING_CENTER_DASHBOARD_TIPS_AR.map((tip) => (
              <li key={tip} className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
