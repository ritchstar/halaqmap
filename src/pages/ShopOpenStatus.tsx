import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Store, DoorOpen, DoorClosed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ROUTE_PATHS } from '@/lib/index';
import { fetchBarberShopOpenStatusRemote, setBarberShopOpenStatusRemote } from '@/lib/barberShopOpenStatusRemote';
import { toast } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';

const SUCCESS_MAP_UPDATE = '(تم تحديث حالتك على الخريطة بنجاح ✅)';

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

  async function setOpen(next: boolean) {
    if (!token || saving) return;
    if (next === openForCustomers) return;
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
    toast.success(SUCCESS_MAP_UPDATE);
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
              <Link to={ROUTE_PATHS.BARBERS_LANDING}>العودة إلى مسار الخدمات البرمجية للمنصة</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-background to-muted/20" dir="rtl">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Card className="border-primary/20 shadow-lg overflow-hidden">
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

                <div className="space-y-3">
                  <p className="text-center text-sm font-semibold text-foreground">اضغط لتغيير الحالة</p>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={saving}
                      onClick={() => void setOpen(true)}
                      className={cn(
                        'h-auto min-h-[5.5rem] flex-col gap-2 border-2 py-4 transition-colors duration-150',
                        openForCustomers
                          ? 'border-emerald-600 bg-emerald-600 text-white shadow-md hover:bg-emerald-600/90 hover:text-white'
                          : 'border-emerald-600/40 bg-emerald-50/80 text-emerald-900 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-100'
                      )}
                    >
                      <DoorOpen className="h-8 w-8 shrink-0" aria-hidden />
                      <span className="text-base font-bold">مفتوح</span>
                      <span className="text-[11px] font-normal opacity-90">للعملاء على الخريطة</span>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={saving}
                      onClick={() => void setOpen(false)}
                      className={cn(
                        'h-auto min-h-[5.5rem] flex-col gap-2 border-2 py-4 transition-colors duration-150',
                        !openForCustomers
                          ? 'border-red-600 bg-red-600 text-white shadow-md hover:bg-red-600/90 hover:text-white'
                          : 'border-red-600/40 bg-red-50/80 text-red-900 hover:bg-red-100 dark:bg-red-950/30 dark:text-red-100'
                      )}
                    >
                      <DoorClosed className="h-8 w-8 shrink-0" aria-hidden />
                      <span className="text-base font-bold">مغلق</span>
                      <span className="text-[11px] font-normal opacity-90">على الخريطة</span>
                    </Button>
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={openForCustomers ? 'open' : 'closed'}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className={cn(
                        'text-center text-sm font-semibold rounded-lg py-2 px-3',
                        openForCustomers
                          ? 'bg-emerald-600/12 text-emerald-800 dark:text-emerald-200'
                          : 'bg-red-600/12 text-red-800 dark:text-red-200'
                      )}
                    >
                      {openForCustomers ? 'وضعك الحالي: مفتوح — يظهر الدبوس باللون الأخضر' : 'وضعك الحالي: مغلق — يظهر الدبوس باللون الرمادي'}
                    </motion.p>
                  </AnimatePresence>
                </div>

                <p className="text-[11px] text-center text-muted-foreground leading-relaxed">
                  احفظ هذا الرابط في متصفحك أو على شاشة المحل. من يملك الرابط يستطيع تغيير الحالة — تعامل معه كرمز
                  خاص.
                </p>
              </>
            )}
            <Button asChild variant="outline" className="w-full">
              <Link to={ROUTE_PATHS.BARBERS_LANDING}>مسار الخدمات البرمجية للمنصة</Link>
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
