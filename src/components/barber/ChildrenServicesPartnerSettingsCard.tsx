import { useEffect, useState } from 'react';
import { Baby, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { SubscriptionTier } from '@/lib/index';
import { updateBarberChildrenServicesRemote } from '@/lib/barberChildrenServicesRemote';
import type { BarberPortalSession } from '@/lib/barberPortalLoginRemote';
import { CHILDREN_BARBER_CATEGORY } from '@/lib/barberCategoryLexicon';
import {
  CHILDREN_HAIRCUT_ALL_TIERS_AR,
  CHILDREN_SPECIALIST_DIAMOND_ONLY_AR,
  canEnableChildrenSpecialist,
} from '@/config/childrenSpecialistPolicy';

type Props = {
  barberId: string;
  barberData: BarberPortalSession;
  subscriptionTier: SubscriptionTier;
  onRefreshPortalSession: () => Promise<void>;
  /** في لوحة المتخصص: إخفاء مقدمة عامة */
  embeddedInSpecialistPanel?: boolean;
};

export function ChildrenServicesPartnerSettingsCard({
  barberId,
  barberData,
  subscriptionTier,
  onRefreshPortalSession,
  embeddedInSpecialistPanel = false,
}: Props) {
  const [acceptsChildren, setAcceptsChildren] = useState(false);
  const [childrenSpecialist, setChildrenSpecialist] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const s = barberData.childrenServices;
    setAcceptsChildren(s?.acceptsChildren === true);
    setChildrenSpecialist(s?.childrenSpecialist === true);
  }, [barberData.childrenServices, barberData.id]);

  const handleSave = async () => {
    if (childrenSpecialist && !canEnableChildrenSpecialist(subscriptionTier)) {
      toast.error('وضع «متخصص أطفال» متاح للباقة الماسية فقط.');
      return;
    }
    setSaving(true);
    const res = await updateBarberChildrenServicesRemote({
      barberId,
      email: barberData.email,
      acceptsChildren,
      childrenSpecialist: acceptsChildren && childrenSpecialist && canEnableChildrenSpecialist(subscriptionTier),
    });
    setSaving(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success('تم حفظ إعدادات حلاقة الأطفال.');
    await onRefreshPortalSession();
  };

  return (
    <Card
      className={
        embeddedInSpecialistPanel
          ? 'border-sky-400/30 bg-gradient-to-br from-sky-500/[0.05] to-card'
          : 'mb-6 border-sky-400/25 bg-gradient-to-br from-sky-500/[0.06] to-card'
      }
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Baby className="h-5 w-5 text-sky-500" />
          {embeddedInSpecialistPanel ? 'إعدادات الظهور' : 'حلاقة الأطفال'}
        </CardTitle>
        {!embeddedInSpecialistPanel ? (
          <CardDescription className="leading-relaxed">
            {CHILDREN_HAIRCUT_ALL_TIERS_AR} فعّل «أستقبل الأطفال» ليظهر صالونك عند بحث العائلات.
            {canEnableChildrenSpecialist(subscriptionTier)
              ? ' إن كنت متخصصاً بالأطفال فقط، فعّل «متخصص أطفال» للبطاقة المميزة.'
              : ` ${CHILDREN_SPECIALIST_DIAMOND_ONLY_AR}`}
          </CardDescription>
        ) : (
          <CardDescription className="leading-relaxed">
            تحكّم في ظهورك كمتخصّص أطفال على الخريطة وفلتر «متخصص أطفال».
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium">أستقبل حلاقة الأطفال</p>
            <p className="text-xs text-muted-foreground">
              يُضاف تصنيف «{CHILDREN_BARBER_CATEGORY}» لملفك ويظهر في فلتر «أطفال» على الخريطة.
            </p>
          </div>
          <Switch
            checked={acceptsChildren}
            onCheckedChange={(c) => {
              const next = c === true;
              setAcceptsChildren(next);
              if (!next) setChildrenSpecialist(false);
            }}
          />
        </div>

        {acceptsChildren && canEnableChildrenSpecialist(subscriptionTier) ? (
          <div className="flex flex-col gap-3 rounded-lg border border-sky-400/30 bg-sky-500/5 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">متخصص أطفال — بطاقة مميزة</p>
              <p className="text-xs text-muted-foreground">
                للصالونات التي تركّز على الأطفال أو تعمل أطفالاً فقط. يظهر في فلتر «متخصص أطفال».
              </p>
            </div>
            <Switch checked={childrenSpecialist} onCheckedChange={(c) => setChildrenSpecialist(c === true)} />
          </div>
        ) : null}

        {!canEnableChildrenSpecialist(subscriptionTier) && acceptsChildren ? (
          <p className="text-xs text-muted-foreground leading-relaxed rounded-lg border border-border bg-muted/20 p-3">
            {CHILDREN_SPECIALIST_DIAMOND_ONLY_AR}
          </p>
        ) : null}

        <Button type="button" className="w-full" disabled={saving} onClick={() => void handleSave()}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'حفظ إعدادات الأطفال'}
        </Button>
      </CardContent>
    </Card>
  );
}
