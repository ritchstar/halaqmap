/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { LayoutTemplate, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/sonner';
import { formatPlatformMoney, formatPlatformNumber } from '@/lib/platformLocale';
import {
  SALON_PRIVATE_PAGE_PACKAGES,
  chargedHalalasForSalonPrivatePageVat,
  salonPrivatePagePackageByPageCount,
} from '@/config/salonPrivatePageCatalog';
import { usePlatformVatConfigRemote } from '@/hooks/usePlatformVatConfigRemote';
import {
  listSalonPrivatePageRequestsRemote,
  submitSalonPrivatePageRequestRemote,
  type SalonPrivatePageRequestRow,
} from '@/lib/salonPrivatePageRequestRemote';

const STATUS_AR: Record<string, string> = {
  submitted: 'تم إرسال الطلب',
  awaiting_payment: 'بانتظار الدفع',
  paid: 'مدفوع',
  in_design: 'قيد التجهيز',
  live: 'مفعّل',
  cancelled: 'ملغى',
};

export function SalonPrivatePageIntakePanel({
  barberId,
  barberEmail,
  salonName,
}: {
  barberId: string;
  barberEmail: string;
  salonName: string;
}) {
  const vat = usePlatformVatConfigRemote();
  const [pageCount, setPageCount] = useState(1);
  const [salonDisplayName, setSalonDisplayName] = useState(salonName);
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [aboutText, setAboutText] = useState('');
  const [servicesText, setServicesText] = useState('');
  const [productsText, setProductsText] = useState('');
  const [brandNotes, setBrandNotes] = useState('');
  const [contactWhatsapp, setContactWhatsapp] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [requests, setRequests] = useState<SalonPrivatePageRequestRow[]>([]);

  const pack = useMemo(() => salonPrivatePagePackageByPageCount(pageCount), [pageCount]);
  const payableHalalas = pack
    ? chargedHalalasForSalonPrivatePageVat(pack.baseHalalas, {
        enabled: vat.enabled,
        percent: vat.ratePercent,
      })
    : 0;

  const loadList = useCallback(async () => {
    setLoadingList(true);
    const r = await listSalonPrivatePageRequestsRemote({ barberId, email: barberEmail });
    setLoadingList(false);
    if (!r.ok) {
      toast.error(r.error);
      return;
    }
    setRequests(r.requests);
  }, [barberId, barberEmail]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  const onSubmit = async () => {
    if (!pack) return;
    setSubmitting(true);
    const r = await submitSalonPrivatePageRequestRemote({
      barberId,
      email: barberEmail,
      payload: {
        pageCount,
        salonDisplayName,
        city,
        district,
        aboutText,
        servicesText,
        productsText,
        brandNotes,
        contactWhatsapp,
      },
    });
    setSubmitting(false);
    if (!r.ok) {
      toast.error(r.error);
      return;
    }
    toast.success('تم إرسال طلب التفاهم — الدفع يُفعَّل في الخطوة التالية.');
    setAboutText('');
    setServicesText('');
    setProductsText('');
    setBrandNotes('');
    await loadList();
  };

  return (
    <div className="space-y-6">
      <Card className="border-teal-500/25 bg-teal-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <LayoutTemplate className="h-5 w-5 text-teal-600" aria-hidden />
            صفحة عرض خاصة
          </CardTitle>
          <CardDescription className="text-sm leading-relaxed">
            إضافة برمجية لأصحاب الرخصة الذهبية والماسية المفعّلة. املأ التفاهم ثم أرسل الطلب. الدفع عبر ميسر
            يُربط لاحقاً بنفس أسلوب شحن المناوب — لا يُشترى بلا رخصة سارية.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="spp-pages">عدد الصفحات</Label>
            <select
              id="spp-pages"
              className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={pageCount}
              onChange={(e) => setPageCount(Number(e.target.value))}
            >
              {SALON_PRIVATE_PAGE_PACKAGES.map((p) => (
                <option key={p.sku} value={p.pageCount}>
                  {p.labelAr} — {formatPlatformMoney(p.baseSar)} ر.س
                </option>
              ))}
            </select>
            {pack ? (
              <p className="text-xs text-muted-foreground">
                {formatPlatformNumber(pack.pageCount)} × {formatPlatformMoney(pack.unitSar)} ر.س للصفحة
                {vat.enabled
                  ? ` · عند الدفع يُضاف ض.ق.م ويصبح ${formatPlatformMoney(payableHalalas / 100)} ر.س`
                  : ' · المبلغ المعروض قبل الضريبة'}
              </p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="spp-name">اسم الصالون كما سيظهر</Label>
              <Input
                id="spp-name"
                value={salonDisplayName}
                onChange={(e) => setSalonDisplayName(e.target.value)}
                maxLength={120}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="spp-city">المدينة</Label>
              <Input id="spp-city" value={city} onChange={(e) => setCity(e.target.value)} maxLength={80} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="spp-district">الحي</Label>
              <Input id="spp-district" value={district} onChange={(e) => setDistrict(e.target.value)} maxLength={80} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="spp-about">نبذة العرض</Label>
            <Textarea
              id="spp-about"
              rows={4}
              value={aboutText}
              onChange={(e) => setAboutText(e.target.value)}
              maxLength={2000}
              placeholder="من أنتم، أسلوب الصالون، وما الذي تريد الزائرة أن تراه أولاً."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="spp-services">الخدمات</Label>
            <Textarea
              id="spp-services"
              rows={4}
              value={servicesText}
              onChange={(e) => setServicesText(e.target.value)}
              maxLength={2000}
              placeholder="قص، صبغة، عناية، سبا — كما تريد عرضها."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="spp-products">المنتجات (اختياري)</Label>
            <Textarea
              id="spp-products"
              rows={3}
              value={productsText}
              onChange={(e) => setProductsText(e.target.value)}
              maxLength={2000}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="spp-brand">ملاحظات الهوية البصرية (اختياري)</Label>
            <Textarea
              id="spp-brand"
              rows={3}
              value={brandNotes}
              onChange={(e) => setBrandNotes(e.target.value)}
              maxLength={2000}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="spp-wa">واتساب للتواصل حول الطلب (اختياري)</Label>
            <Input
              id="spp-wa"
              dir="ltr"
              value={contactWhatsapp}
              onChange={(e) => setContactWhatsapp(e.target.value)}
              maxLength={32}
            />
          </div>

          <Button type="button" className="gap-2" disabled={submitting} onClick={() => void onSubmit()}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            إرسال طلب التفاهم
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">طلباتك</CardTitle>
          <CardDescription>بعد الإرسال يظهر الطلب هنا. الدفع خطوة لاحقة.</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingList ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              جاري التحميل…
            </p>
          ) : requests.length === 0 ? (
            <p className="text-sm text-muted-foreground">لا طلبات بعد.</p>
          ) : (
            <ul className="space-y-3">
              {requests.map((row) => (
                <li
                  key={row.id}
                  className="rounded-xl border border-border/70 bg-card px-4 py-3 text-sm"
                >
                  <p className="font-bold">{row.salon_display_name}</p>
                  <p className="mt-1 text-muted-foreground">
                    {formatPlatformNumber(row.page_count)} صفحات · {formatPlatformMoney(Number(row.base_sar))} ر.س ·{' '}
                    {STATUS_AR[row.status] ?? row.status}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
