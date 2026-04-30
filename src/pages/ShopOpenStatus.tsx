import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ROUTE_PATHS } from '@/lib/index';
import { fetchBarberShopOpenStatusRemote, setBarberShopOpenStatusRemote } from '@/lib/barberShopOpenStatusRemote';
import { toast } from 'sonner';

function tierLabelAr(tier: string): string {
  const t = tier.toLowerCase();
  if (t === 'diamond') return 'ماسي';
  if (t === 'gold') return 'ذهبي';
  return 'برونزي';
}

export default function ShopOpenStatus() {
  const [params] = useSearchParams();
  const token = useMemo(() => (params.get('t') || '').trim(), [params]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [barberName, setBarberName] = useState('');
  const [tier, setTier] = useState('bronze');
  const [openForCustomers, setOpenForCustomers] = useState(true);

  const load = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const r = await fetchBarberShopOpenStatusRemote(token);
    setLoading(false);
    if (!r.ok) {
      toast.error(r.error);
      return;
    }
    setBarberName(r.barberName);
    setTier(r.tier);
    setOpenForCustomers(r.openForCustomers);
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onToggle(next: boolean) {
    if (!token || saving) return;
    setSaving(true);
    const prev = openForCustomers;
    setOpenForCustomers(next);
    const r = await setBarberShopOpenStatusRemote(token, next);
    setSaving(false);
    if (!r.ok) {
      setOpenForCustomers(prev);
      toast.error(r.error);
      return;
    }
    toast.success(next ? 'تم ضبط المحل كـ «مفتوح» للعملاء على الخريطة.' : 'تم ضبط المحل كـ «مغلق» للعملاء على الخريطة.');
  }

  if (!token) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12" dir="rtl">
        <Card className="max-w-md w-full border-destructive/30">
          <CardHeader>
            <CardTitle>الرابط غير مكتمل</CardTitle>
            <CardDescription>
              يجب أن يتضمّن الرابط المعطى من الإدارة أو من لوحة التحكم معامل <span dir="ltr">t=</span> للرمز السري.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link to={ROUTE_PATHS.BARBERS_LANDING}>العودة لصفحة الشركاء</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-background to-muted/20" dir="rtl">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Card className="border-primary/20 shadow-lg">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Store className="h-7 w-7 text-primary" />
            </div>
            <CardTitle className="text-xl">حالة المحل على الخريطة</CardTitle>
            <CardDescription className="text-sm leading-relaxed">
              تحكم بأيقونة <strong>مفتوح الآن / مغلق</strong> التي يراها العملاء على حلاق ماب. لا تحتاج لوحة تحكم كاملة
              — مفيدة خصوصاً لباقة <strong>البرونزي</strong>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {loading ? (
              <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm">جاري التحميل…</p>
              </div>
            ) : (
              <>
                <div className="rounded-lg border bg-muted/30 px-4 py-3 text-center space-y-1">
                  <p className="text-sm text-muted-foreground">الصالون</p>
                  <p className="text-lg font-bold text-foreground">{barberName || '—'}</p>
                  <p className="text-xs text-muted-foreground">الباقة: {tierLabelAr(tier)}</p>
                </div>
                <div className="flex items-center justify-between gap-4 rounded-xl border border-border/80 bg-card px-4 py-4">
                  <div className="space-y-1 text-right">
                    <Label htmlFor="shop-open-switch" className="text-base font-semibold">
                      قبول العملاء الآن
                    </Label>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      عند الإيقاف يظهر المحل كـ «مغلق» على الخريطة دون إخفاء اشتراكك عن المنصة.
                    </p>
                  </div>
                  <Switch
                    id="shop-open-switch"
                    checked={openForCustomers}
                    disabled={saving}
                    onCheckedChange={(v) => void onToggle(v)}
                    className="shrink-0"
                  />
                </div>
                <p className="text-[11px] text-center text-muted-foreground leading-relaxed">
                  احفظ هذا الرابط في متصفحك أو على شاشة المحل. من يملك الرابط يستطيع تغيير الحالة — تعامل معه كرمز
                  خاص.
                </p>
              </>
            )}
            <Button asChild variant="outline" className="w-full">
              <Link to={ROUTE_PATHS.BARBERS_LANDING}>صفحة الشركاء</Link>
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
