import { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Copy } from 'lucide-react';
import QRCode from 'react-qr-code';
import { toast } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import { ROUTE_PATHS } from '@/lib';
import { getSiteOrigin } from '@/config/siteOrigin';
import { PARTNER_LANDING_QR_PROMO } from '@/lib/partnerMarketingCopy';

const QR_BLUE = '#003893';
const QR_RED = '#C8102E';
const QR_BG = '#EFF4FB';

/** بطاقة QR لمسار الشركاء — للطباعة والحملات (تُعرض خارج الصفحة العامة للمسار عند الحاجة). */
export function PartnerPathQrPrintCard() {
  const siteOrigin = getSiteOrigin();
  const landingUrl = `${siteOrigin}/#${ROUTE_PATHS.BARBERS_LANDING}`;
  const [copied, setCopied] = useState(false);
  const copyLandingUrl = useCallback(() => {
    void navigator.clipboard.writeText(landingUrl).then(
      () => {
        setCopied(true);
        toast.success('تم نسخ رابط مسار الشركاء');
        window.setTimeout(() => setCopied(false), 2200);
      },
      () => toast.error('تعذّر النسخ من المتصفح')
    );
  }, [landingUrl]);

  return (
    <section
      className="relative border-y-4 border-[#C8102E] py-10 md:py-12"
      style={{ backgroundColor: QR_BG }}
      aria-labelledby="partner-qr-heading"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1.5" style={{ backgroundColor: QR_BLUE }} />
      <div className="container relative mx-auto px-4">
        <motion.div
          className="mx-auto max-w-5xl overflow-hidden rounded-2xl border-[3px] bg-white shadow-xl"
          style={{ borderColor: QR_BLUE }}
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
        >
          <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${QR_RED} 0%, ${QR_BLUE} 100%)` }} />
          <div className="flex flex-col-reverse items-center gap-8 p-6 md:flex-row md:flex-row-reverse md:items-center md:justify-between md:gap-10 md:p-9">
            <div className="w-full max-w-lg flex-1 space-y-4 text-right">
              <p className="text-xs font-bold tracking-wide" style={{ color: QR_RED }}>
                {PARTNER_LANDING_QR_PROMO.kicker}
              </p>
              <h2
                id="partner-qr-heading"
                className="text-2xl font-black leading-snug md:text-3xl"
                style={{ color: QR_BLUE }}
              >
                {PARTNER_LANDING_QR_PROMO.title}
              </h2>
              <ol className="list-none space-y-3">
                {PARTNER_LANDING_QR_PROMO.steps.map((line, i) => (
                  <li key={line} className="flex items-start justify-end gap-3 text-sm leading-relaxed text-slate-800 md:text-base">
                    <span>{line}</span>
                    <span
                      className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: QR_BLUE }}
                    >
                      {i + 1}
                    </span>
                  </li>
                ))}
              </ol>
              <p className="text-xs text-slate-600">{PARTNER_LANDING_QR_PROMO.hint}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2 border-2 font-semibold"
                style={{ borderColor: QR_RED, color: QR_RED }}
                onClick={copyLandingUrl}
              >
                <Copy className="h-4 w-4" />
                {copied ? 'تم النسخ' : 'نسخ الرابط'}
              </Button>
            </div>
            <div className="flex shrink-0 flex-col items-center gap-3 rounded-xl border-2 border-[#C8102E]/35 bg-white p-4 shadow-inner">
              <div className="rounded-lg bg-white p-2 ring-2 ring-[#003893]/35 ring-offset-2 ring-offset-white">
                <QRCode
                  value={landingUrl}
                  size={176}
                  style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                  fgColor={QR_BLUE}
                  bgColor="#ffffff"
                  level="M"
                />
              </div>
              <p className="max-w-[14rem] break-all text-center text-[10px] leading-tight text-slate-500" dir="ltr">
                {landingUrl}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
