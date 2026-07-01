import { useMemo, useState } from 'react';
import { Check, Copy, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SubscriptionTier } from '@/lib/index';
import type { BarberPortalSession } from '@/lib/barberPortalLoginRemote';
import { isActiveChildrenSpecialistSession } from '@/lib/childrenSpecialistDashboardMode';
import { CHILDREN_SPECIALIST_FILTER_LABEL_AR } from '@/lib/childrenSpecialistDisplay';
import {
  CHILDREN_SPECIALIST_DASHBOARD_ONBOARDING_AR,
  CHILDREN_SPECIALIST_DASHBOARD_STATUS_ITEMS,
  CHILDREN_SPECIALIST_DASHBOARD_TIPS_AR,
  buildChildrenSpecialistInstagramCopy,
  buildChildrenSpecialistWhatsAppCopy,
} from '@/config/childrenSpecialistDashboardCopy';
import { ChildrenSpecialistIcon } from '@/components/icons/ChildrenSpecialistIcon';
import {
  ChildrenSpecialistBadge,
  ChildrenSpecialistDetailBanner,
  ChildrenSpecialistHeroBanner,
  ChildrenSpecialistHeroChrome,
} from '@/components/barber/ChildrenSpecialistCardChrome';
import { ChildrenServicesPartnerSettingsCard } from '@/components/barber/ChildrenServicesPartnerSettingsCard';

type Props = {
  barberId: string;
  barberData: BarberPortalSession;
  salonDisplayName: string;
  subscriptionTier: SubscriptionTier;
  onRefreshPortalSession: () => Promise<void>;
};

function CopySnippetButton({ label, text }: { label: string; text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('تم نسخ النص.');
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('تعذّر النسخ — انسخ يدوياً.');
    }
  };

  return (
    <div className="space-y-2 rounded-lg border border-border bg-muted/20 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <Button type="button" size="sm" variant="secondary" className="gap-1.5 shrink-0" onClick={() => void handleCopy()}>
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'تم' : 'نسخ'}
        </Button>
      </div>
      <pre className="whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground font-sans">{text}</pre>
    </div>
  );
}

export function ChildrenSpecialistDashboardPanel({
  barberId,
  barberData,
  salonDisplayName,
  subscriptionTier,
  onRefreshPortalSession,
}: Props) {
  const isActive = isActiveChildrenSpecialistSession({
    tier: subscriptionTier,
    childrenServices: barberData.childrenServices,
  });

  const whatsAppCopy = useMemo(
    () => buildChildrenSpecialistWhatsAppCopy(salonDisplayName),
    [salonDisplayName],
  );
  const instagramCopy = useMemo(
    () => buildChildrenSpecialistInstagramCopy(salonDisplayName),
    [salonDisplayName],
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2 border-b border-sky-400/25 pb-3">
        <ChildrenSpecialistIcon className="h-6 w-6 text-sky-500" title={CHILDREN_SPECIALIST_FILTER_LABEL_AR} />
        <h2 className="text-lg font-bold text-foreground">{CHILDREN_SPECIALIST_FILTER_LABEL_AR}</h2>
        {isActive ? (
          <Badge className="bg-sky-500/20 text-sky-900 dark:text-sky-100 border-sky-400/40">نشط</Badge>
        ) : (
          <Badge variant="outline">غير مفعّل</Badge>
        )}
      </div>

      <ChildrenServicesPartnerSettingsCard
        barberId={barberId}
        barberData={barberData}
        subscriptionTier={subscriptionTier}
        onRefreshPortalSession={onRefreshPortalSession}
        embeddedInSpecialistPanel
      />

      {!isActive ? (
        <Alert className="border-sky-400/30 bg-sky-500/5">
          <Sparkles className="h-4 w-4 text-sky-500" />
          <AlertDescription className="text-sm font-medium leading-relaxed text-foreground">
            {CHILDREN_SPECIALIST_DASHBOARD_ONBOARDING_AR}
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            {CHILDREN_SPECIALIST_DASHBOARD_STATUS_ITEMS.map((item) => (
              <Card key={item.id} className="border-sky-400/20 bg-card/80">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
                    <Check className="h-4 w-4 text-sky-500 shrink-0" />
                    {item.titleAr}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-medium text-muted-foreground leading-relaxed">{item.bodyAr}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <ChildrenSpecialistDetailBanner />
        </>
      )}

      {isActive ? (
        <div className="space-y-4 border-t border-border/50 pt-5">
          <p className="text-xs font-medium text-muted-foreground">معاينة ونشر (اختياري)</p>
          <Card className="overflow-hidden border-sky-400/25">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">معاينة البطاقة على الخريطة</CardTitle>
              <CardDescription>شكل ظهور صالونك للعائلات عند تفعيل «متخصص أطفال».</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative mx-auto max-w-sm overflow-hidden rounded-xl border border-sky-400/35 shadow-lg">
                <div className="relative h-36 bg-gradient-to-br from-sky-200/40 to-cyan-100/30 dark:from-sky-900/40 dark:to-cyan-900/20">
                  <ChildrenSpecialistHeroChrome />
                  <ChildrenSpecialistHeroBanner compact />
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="font-bold text-foreground truncate">{salonDisplayName}</p>
                    <p className="text-xs text-muted-foreground">حلاقة أطفال · ماسي</p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 bg-card p-3">
                  <ChildrenSpecialistBadge size="md" />
                  <span className="text-[10px] text-muted-foreground">فلتر «متخصص أطفال»</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">نسخ للمشاركة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <CopySnippetButton label="واتساب / رسائل" text={whatsAppCopy} />
              <CopySnippetButton label="Instagram / Facebook" text={instagramCopy} />
            </CardContent>
          </Card>

          <ul className="space-y-2 text-sm font-medium text-muted-foreground leading-relaxed list-disc pr-5">
            {CHILDREN_SPECIALIST_DASHBOARD_TIPS_AR.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
