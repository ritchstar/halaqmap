import { Copy, Store } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { buildShopOpenManageHashLink, setBarberShopOpenStatusRemote } from '@/lib/barberShopOpenStatusRemote';
import type { BarberPortalSession } from '@/lib/barberPortalLoginRemote';

type Props = {
  barberData: BarberPortalSession;
  shopOpenSaving: boolean;
  setShopOpenSaving: (v: boolean) => void;
  onBarberDataChange: (updater: (prev: BarberPortalSession | null) => BarberPortalSession | null) => void;
  persistSession: (session: BarberPortalSession) => void;
};

export function BarberShopOpenStatusCard({
  barberData,
  shopOpenSaving,
  setShopOpenSaving,
  onBarberDataChange,
  persistSession,
}: Props) {
  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2 text-lg">
          <Store className="h-5 w-5 text-primary" />
          حالة «مفتوح / مغلق» للعملاء
        </CardTitle>
        <CardDescription className="text-sm leading-relaxed">
          يتحكم هذا الخيار في أيقونة الظهور التي يراها العملاء في نتائج الاستعلام. يمكنك أيضاً استخدام{' '}
          <strong>رابط التبديل السريع</strong> من أي جهاز دون فتح لوحة التحكم كاملة.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 rounded-xl border border-border/80 bg-muted/20 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1 text-right">
            <p className="text-sm font-semibold">قبول العملاء الآن</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              عند الإيقاف يظهر المحل كـ «مغلق» في فلتر «مفتوح الآن» دون إلغاء صلاحية حزمة رخصة النفاذ.
            </p>
          </div>
          <Switch
            checked={barberData.openForCustomers !== false}
            disabled={shopOpenSaving}
            onCheckedChange={async (v) => {
              const token = barberData.openStatusToken?.trim() || '';
              if (!token) {
                toast.error(
                  'لم يُحمّل رمز صفحة الفتح بعد. حدّث الصفحة، أو تواصل مع الإدارة لإعادة إصدار الرابط.'
                );
                return;
              }
              setShopOpenSaving(true);
              const prevOpen = barberData.openForCustomers !== false;
              onBarberDataChange((d) => (d ? { ...d, openForCustomers: v } : d));
              const r = await setBarberShopOpenStatusRemote(token, v);
              setShopOpenSaving(false);
              if (!r.ok) {
                onBarberDataChange((d) => (d ? { ...d, openForCustomers: prevOpen } : d));
                toast.error(r.error);
                return;
              }
              onBarberDataChange((d) => {
                if (!d) return d;
                const next = { ...d, openForCustomers: v };
                persistSession(next);
                return next;
              });
              toast.success(v ? 'تم ضبط المحل كـ «مفتوح» للعملاء.' : 'تم ضبط المحل كـ «مغلق» للعملاء.');
            }}
            className="shrink-0 sm:mr-auto"
          />
        </div>
        {barberData.openStatusToken ? (
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={async () => {
                const link = buildShopOpenManageHashLink(barberData.openStatusToken || '');
                if (!link) return;
                try {
                  await navigator.clipboard.writeText(link);
                  toast.success('تم نسخ رابط التبديل السريع.');
                } catch {
                  toast.error('تعذر النسخ من المتصفح.');
                }
              }}
            >
              <Copy className="h-4 w-4" />
              نسخ رابط التبديل السريع
            </Button>
            <Button type="button" variant="ghost" size="sm" asChild className="text-xs">
              <a href={buildShopOpenManageHashLink(barberData.openStatusToken || '') || '#'} target="_blank" rel="noreferrer">
                فتح صفحة التبديل
              </a>
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
