import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Copy, ExternalLink, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ROUTE_PATHS } from '@/lib/index';
import {
  buildShopOpenManageHashLink,
  confirmBronzeShopOpenRotateRemote,
} from '@/lib/barberShopOpenStatusRemote';
import { toast } from '@/components/ui/sonner';

export default function ShopOpenStatusRotateConfirm() {
  const [params] = useSearchParams();
  const confirmToken = useMemo(() => (params.get('c') || '').trim(), [params]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [barberName, setBarberName] = useState('');
  const [shopOpenUrl, setShopOpenUrl] = useState('');
  const [openStatusToken, setOpenStatusToken] = useState('');

  const localLink = useMemo(
    () => (openStatusToken ? buildShopOpenManageHashLink(openStatusToken) : shopOpenUrl),
    [openStatusToken, shopOpenUrl],
  );

  const runConfirm = useCallback(async () => {
    if (!confirmToken) {
      setLoading(false);
      setError('رابط التأكيد غير مكتمل.');
      return;
    }
    setLoading(true);
    setError('');
    const r = await confirmBronzeShopOpenRotateRemote(confirmToken);
    setLoading(false);
    if (r.ok === false) {
      setError(r.error);
      return;
    }
    setBarberName(r.barberName);
    setShopOpenUrl(r.shopOpenUrl);
    setOpenStatusToken(r.openStatusToken);
    toast.success('تم تجديد الرابط — الرابط القديم لم يعد يعمل.');
  }, [confirmToken]);

  useEffect(() => {
    void runConfirm();
  }, [runConfirm]);

  async function copyLink() {
    if (!localLink) return;
    try {
      await navigator.clipboard.writeText(localLink);
      toast.success('تم نسخ الرابط الجديد.');
    } catch {
      toast.error('تعذّر النسخ من المتصفح.');
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center overflow-x-hidden bg-gradient-to-b from-background to-muted/20 px-4 py-12" dir="rtl">
      <Card className="w-full max-w-md border-primary/20 shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <RefreshCw className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-xl">تأكيد تجديد الرابط</CardTitle>
          <CardDescription className="text-sm leading-relaxed">
            بعد التأكيد يُولَّد رابط جديد لصفحة مفتوح/مغلق، ويتوقف الرابط القديم عن العمل.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {loading ? (
            <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm">جاري التحقق وتوليد الرابط…</p>
            </div>
          ) : error ? (
            <div className="space-y-4">
              <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm leading-7 text-destructive">
                {error}
              </p>
              <Button asChild className="w-full">
                <Link to={ROUTE_PATHS.SHOP_OPEN_ROTATE}>طلب تجديد جديد</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50/85 px-4 py-3 text-sm text-emerald-900">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <p className="font-bold">تم التجديد بنجاح</p>
                  <p className="mt-1 leading-7">{barberName || 'صالونك'}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">الرابط الجديد</p>
                <p className="break-all rounded-lg border bg-muted/30 px-3 py-2 text-[11px] leading-6" dir="ltr">
                  {localLink}
                </p>
              </div>

              <div className="grid gap-2">
                <Button type="button" className="w-full gap-2" onClick={() => void copyLink()}>
                  <Copy className="h-4 w-4" />
                  نسخ الرابط الجديد
                </Button>
                {localLink ? (
                  <Button type="button" variant="outline" className="w-full gap-2" asChild>
                    <a href={localLink} target="_blank" rel="noreferrer">
                      <ExternalLink className="h-4 w-4" />
                      فتح صفحة التبديل
                    </a>
                  </Button>
                ) : null}
              </div>
            </div>
          )}

          <Button asChild variant="ghost" className="w-full text-xs">
            <Link to={ROUTE_PATHS.BARBERS_LANDING}>مسار الشركاء</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
