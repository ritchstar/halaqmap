import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, RefreshCw, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ROUTE_PATHS } from '@/lib/index';
import { requestBronzeShopOpenRotateRemote } from '@/lib/barberShopOpenStatusRemote';
import { toast } from '@/components/ui/sonner';

export default function ShopOpenStatusRotateRequest() {
  const [licenseCode, setLicenseCode] = useState('');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [ackMessage, setAckMessage] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    const r = await requestBronzeShopOpenRotateRemote({ licenseCode, email });
    setBusy(false);
    if (r.ok === false) {
      toast.error(r.error);
      return;
    }
    setSent(true);
    setAckMessage(r.message);
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center overflow-x-hidden bg-gradient-to-b from-background to-muted/20 px-4 py-12" dir="rtl">
      <Card className="w-full max-w-md border-primary/20 shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <RefreshCw className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-xl">تجديد رابط مفتوح/مغلق</CardTitle>
          <CardDescription className="text-sm leading-relaxed">
            للباقة <strong>البرونزية</strong>: أدخل رقم رخصة التفعيل والبريد المسجّل عند الانضمام. سنرسل رسالة
            تأكيد — الرابط القديم يُبطَل بعد التأكيد فقط.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {sent ? (
            <div className="space-y-4 rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-4 text-sm leading-7 text-emerald-900">
              <div className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
                <p>{ackMessage}</p>
              </div>
              <p className="text-xs text-emerald-800/90">
                لم تصل الرسالة؟ تحقّق من مجلد الرسائل غير المرغوبة، أو انتظر بضع دقائق قبل إعادة الطلب.
              </p>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={(e) => void onSubmit(e)}>
              <div className="space-y-2">
                <Label htmlFor="license-code">رقم رخصة التفعيل</Label>
                <Input
                  id="license-code"
                  dir="ltr"
                  className="text-left font-mono"
                  placeholder="HM-LIC-XXXX-XXXX-XXXX"
                  value={licenseCode}
                  onChange={(e) => setLicenseCode(e.target.value)}
                  required
                  autoComplete="off"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="owner-email">البريد المسجّل</Label>
                <Input
                  id="owner-email"
                  type="email"
                  dir="ltr"
                  className="text-left"
                  placeholder="owner@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <Button type="submit" className="w-full gap-2" disabled={busy}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                إرسال رسالة التأكيد
              </Button>
            </form>
          )}

          <p className="text-[11px] leading-relaxed text-muted-foreground text-center">
            الذهبي والماسي يجدون زر «توليد رابط جديد» داخل لوحة التحكم. لا تشارك الرابط الجديد إلا مع المناوبين
            الحاليين.
          </p>

          <div className="flex flex-col gap-2">
            <Button asChild variant="outline" className="w-full">
              <Link to={ROUTE_PATHS.SHOP_OPEN_STATUS}>العودة لصفحة التبديل</Link>
            </Button>
            <Button asChild variant="ghost" className="w-full text-xs">
              <Link to={ROUTE_PATHS.BARBERS_LANDING}>مسار الشركاء</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
