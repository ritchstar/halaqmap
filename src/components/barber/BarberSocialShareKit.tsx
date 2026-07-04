import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Copy,
  Check,
  Download,
  Share2,
  Instagram,
  Facebook,
  ExternalLink,
  Sparkles,
  ImageIcon,
  RectangleVertical,
  Square,
} from 'lucide-react';
import { SiWhatsapp, SiX } from 'react-icons/si';
import QRCode from 'react-qr-code';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IMAGES } from '@/assets/images';
import { HalaqmapBrandMark } from '@/components/HalaqmapBrandMark';
import {
  BARBER_SHARE_TEMPLATES,
  BARBER_SOCIAL_PLATFORMS,
  BARBER_SOCIAL_SHARE_KIT,
  BARBER_SHARE_FORMAT_OPTIONS,
  buildBarberShareCaption,
  type BarberShareTemplateId,
  type BarberSocialPlatformId,
  type BarberShareCardFormatId,
} from '@/config/barberSocialShareCopy';
import { partnerSalonDisplayName } from '@/config/partnerDashboardBrand';
import type { SubscriptionTier } from '@/lib/index';
import type { BarberPortalHomeServiceSnapshot } from '@/lib/barberHomeServiceRemote';
import {
  BARBER_SHARE_CARD_DIMENSIONS,
  barberShareDownloadFilename,
  buildBarberShareUrlForTemplate,
  buildFacebookShareHref,
  buildWhatsAppShareHref,
  buildXShareHref,
  downloadBarberShareCardBlob,
  renderBarberSocialShareCardPng,
} from '@/lib/barberSocialShareCard';

type Props = {
  barberId: string;
  name: string;
  email: string;
  subscription: SubscriptionTier;
  ratingInviteToken: string;
  memberNumber: number | null;
  homeService?: BarberPortalHomeServiceSnapshot;
  cityLabel?: string;
};

const LOGO_URL = IMAGES.HALAQMAP_LOGO_20260409_073322_83;

export function BarberSocialShareKit({
  barberId,
  name,
  email,
  subscription,
  ratingInviteToken,
  memberNumber,
  homeService,
  cityLabel,
}: Props) {
  const salonName = useMemo(() => partnerSalonDisplayName({ name, email }), [name, email]);

  const availableTemplates = useMemo(() => {
    const homeOn = homeService?.offered === true && homeService?.publicVisible !== false;
    return BARBER_SHARE_TEMPLATES.filter((t) => !t.requiresHomeService || homeOn);
  }, [homeService?.offered, homeService?.publicVisible]);

  const [templateId, setTemplateId] = useState<BarberShareTemplateId>('map_presence');
  const [cardFormat, setCardFormat] = useState<BarberShareCardFormatId>('square');
  const [platform, setPlatform] = useState<BarberSocialPlatformId>('instagram');
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [cardBusy, setCardBusy] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!availableTemplates.some((t) => t.id === templateId)) {
      setTemplateId(availableTemplates[0]?.id ?? 'map_presence');
    }
  }, [availableTemplates, templateId]);

  useEffect(() => {
    if (platform === 'instagram') {
      setCardFormat('story');
    }
  }, [platform]);

  const template = useMemo(
    () => availableTemplates.find((t) => t.id === templateId) ?? availableTemplates[0]!,
    [availableTemplates, templateId],
  );

  const shareUrl = useMemo(
    () =>
      buildBarberShareUrlForTemplate({
        templateId: template.id,
        barberId,
        ratingInviteToken,
      }),
    [template.id, barberId, ratingInviteToken],
  );

  const caption = useMemo(
    () =>
      buildBarberShareCaption({
        templateId: template.id,
        platform,
        salonName,
        tier: subscription,
        shareUrl,
        cityLabel,
      }),
    [template.id, platform, salonName, subscription, shareUrl, cityLabel],
  );

  const renderInput = useMemo(
    () => ({
      template,
      salonName,
      tier: subscription,
      memberNumber,
      shareUrl,
      logoUrl: LOGO_URL,
      format: cardFormat,
    }),
    [template, salonName, subscription, memberNumber, shareUrl, cardFormat],
  );

  const regeneratePreview = useCallback(async () => {
    setCardBusy(true);
    try {
      const blob = await renderBarberSocialShareCardPng(renderInput);
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(blob);
      });
    } catch {
      toast.error('تعذّر تجهيز معاينة البطاقة — جرّب مجدداً');
    } finally {
      setCardBusy(false);
    }
  }, [renderInput]);

  useEffect(() => {
    void regeneratePreview();
    return () => {
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    };
  }, [regeneratePreview]);

  const copyCaption = async () => {
    try {
      await navigator.clipboard.writeText(caption);
      setCopiedCaption(true);
      toast.success('تم نسخ النص — الصقه في منشورك');
      window.setTimeout(() => setCopiedCaption(false), 2200);
    } catch {
      toast.error('تعذّر النسخ من المتصفح');
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      toast.success('تم نسخ الرابط');
      window.setTimeout(() => setCopiedLink(false), 2200);
    } catch {
      toast.error('تعذّر النسخ');
    }
  };

  const downloadPng = async (format: BarberShareCardFormatId) => {
    setCardBusy(true);
    try {
      const blob = await renderBarberSocialShareCardPng({ ...renderInput, format });
      downloadBarberShareCardBlob(
        blob,
        barberShareDownloadFilename({ format, templateId: template.id, salonName }),
      );
      toast.success(`تم تحميل ${BARBER_SHARE_CARD_DIMENSIONS[format].labelAr}`);
    } catch {
      toast.error('تعذّر تحميل الصورة');
    } finally {
      setCardBusy(false);
    }
  };

  const nativeShare = async () => {
    if (!navigator.share) {
      toast.message('استخدم تحميل الصورة + نسخ النص على هذا الجهاز');
      return;
    }
    setCardBusy(true);
    try {
      const blob = await renderBarberSocialShareCardPng(renderInput);
      const file = new File(
        [blob],
        barberShareDownloadFilename({ format: cardFormat, templateId: template.id, salonName }),
        { type: 'image/png' },
      );
      await navigator.share({
        title: `${salonName} — حلاق ماب`,
        text: caption,
        files: [file],
      });
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      toast.error('تعذّر فتح نافذة المشاركة');
    } finally {
      setCardBusy(false);
    }
  };

  const platformShareHref = useMemo(() => {
    if (platform === 'facebook') return buildFacebookShareHref(shareUrl);
    if (platform === 'x') return buildXShareHref(caption, shareUrl);
    if (platform === 'whatsapp') return buildWhatsAppShareHref(caption);
    return null;
  }, [platform, shareUrl, caption]);

  const formatMeta = BARBER_SHARE_CARD_DIMENSIONS[cardFormat];
  const previewAspect = cardFormat === 'story' ? 'aspect-[9/16]' : 'aspect-square';
  const previewMaxWidth = cardFormat === 'story' ? 'max-w-[220px]' : 'max-w-[340px]';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="space-y-6"
    >
      <div>
        <h2 className="mb-2 flex flex-wrap items-center gap-2 text-xl font-bold sm:text-2xl">
          <Share2 className="h-6 w-6 text-teal-600" />
          {BARBER_SOCIAL_SHARE_KIT.tabTitle}
          <Badge variant="secondary" className="gap-1 text-[10px]">
            <Sparkles className="h-3 w-3" />
            1080×1080
          </Badge>
          <Badge variant="outline" className="gap-1 border-violet-400/40 text-[10px] text-violet-700 dark:text-violet-300">
            <RectangleVertical className="h-3 w-3" />
            Story 1080×1920
          </Badge>
        </h2>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {BARBER_SOCIAL_SHARE_KIT.lede}
        </p>
        <p className="mt-2 text-xs text-muted-foreground/90">{BARBER_SOCIAL_SHARE_KIT.optionalNote}</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(240px,360px)]">
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">صيغة الصورة</CardTitle>
              <CardDescription>مربع للمنشورات — Story للستories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-2">
                {BARBER_SHARE_FORMAT_OPTIONS.map((f) => {
                  const active = cardFormat === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setCardFormat(f.id)}
                      className={`rounded-xl border p-4 text-right transition-all ${
                        active
                          ? 'border-teal-500/50 bg-teal-500/10 ring-1 ring-teal-500/30'
                          : 'border-border bg-muted/20 hover:border-teal-500/25'
                      }`}
                    >
                      <div className="mb-2 flex items-center justify-end gap-2">
                        {f.id === 'story' ? (
                          <RectangleVertical className="h-5 w-5 text-violet-500" />
                        ) : (
                          <Square className="h-5 w-5 text-teal-600" />
                        )}
                        <span className="font-semibold">{f.labelAr}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{f.descriptionAr}</p>
                    </button>
                  );
                })}
              </div>
              {cardFormat === 'story' ? (
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                  {BARBER_SOCIAL_SHARE_KIT.storyHint}
                </p>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">اختر القالب</CardTitle>
              <CardDescription>نص وبطاقة متناسقان — يُخصَّصان باسم صالونك</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs
                value={templateId}
                onValueChange={(v) => setTemplateId(v as BarberShareTemplateId)}
                className="w-full"
              >
                <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-muted/50 p-1">
                  {availableTemplates.map((t) => (
                    <TabsTrigger key={t.id} value={t.id} className="text-xs sm:text-sm">
                      {t.labelAr}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {availableTemplates.map((t) => (
                  <TabsContent key={t.id} value={t.id} className="mt-4 space-y-2">
                    <p className="text-sm font-semibold text-foreground">{t.headlineAr}</p>
                    <p className="text-sm text-muted-foreground">{t.sublineAr}</p>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">المنصة والنص</CardTitle>
              <CardDescription>انسخ النص أو افتح مشاركة سريعة</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {BARBER_SOCIAL_PLATFORMS.map((p) => (
                  <Button
                    key={p.id}
                    type="button"
                    size="sm"
                    variant={platform === p.id ? 'default' : 'outline'}
                    onClick={() => setPlatform(p.id)}
                  >
                    {p.labelAr}
                  </Button>
                ))}
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">معاينة النص</Label>
                <div
                  dir="rtl"
                  className="chat-arabic-text max-h-48 overflow-y-auto whitespace-pre-wrap rounded-xl border border-border bg-muted/30 p-4 text-sm leading-relaxed"
                >
                  {caption}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="default" className="gap-2" onClick={() => void copyCaption()}>
                  {copiedCaption ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  نسخ النص
                </Button>
                <Button type="button" variant="outline" className="gap-2" onClick={() => void copyLink()}>
                  {copiedLink ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  نسخ الرابط
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2"
                  disabled={cardBusy}
                  onClick={() => void downloadPng(cardFormat)}
                >
                  <Download className="h-4 w-4" />
                  تحميل {formatMeta.labelAr}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2"
                  disabled={cardBusy}
                  onClick={() => void downloadPng(cardFormat === 'square' ? 'story' : 'square')}
                >
                  <Download className="h-4 w-4" />
                  تحميل {cardFormat === 'square' ? 'Story' : 'مربع'}
                </Button>
                {typeof navigator !== 'undefined' && 'share' in navigator ? (
                  <Button
                    type="button"
                    variant="secondary"
                    className="gap-2"
                    disabled={cardBusy}
                    onClick={() => void nativeShare()}
                  >
                    <Share2 className="h-4 w-4" />
                    مشاركة الجهاز
                  </Button>
                ) : null}
              </div>

              {platform === 'instagram' ? (
                <Alert className="border-amber-500/30 bg-amber-500/5">
                  <Instagram className="h-4 w-4" />
                  <AlertDescription className="text-xs leading-relaxed">
                    {BARBER_SOCIAL_SHARE_KIT.instagramHint}
                  </AlertDescription>
                </Alert>
              ) : null}

              {platformShareHref ? (
                <Button type="button" variant="outline" className="w-full gap-2 sm:w-auto" asChild>
                  <a href={platformShareHref} target="_blank" rel="noopener noreferrer">
                    {platform === 'facebook' ? (
                      <Facebook className="h-4 w-4" />
                    ) : platform === 'whatsapp' ? (
                      <SiWhatsapp className="h-4 w-4" />
                    ) : (
                      <SiX className="h-4 w-4" />
                    )}
                    فتح {BARBER_SOCIAL_PLATFORMS.find((p) => p.id === platform)?.labelAr}
                    <ExternalLink className="h-3.5 w-3.5 opacity-60" />
                  </a>
                </Button>
              ) : null}

              <p className="break-all text-xs text-muted-foreground" dir="ltr">
                {shareUrl}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="overflow-hidden border-teal-500/20 bg-gradient-to-b from-teal-500/[0.04] to-card xl:sticky xl:top-4 xl:self-start">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <ImageIcon className="h-5 w-5 text-teal-600" />
              معاينة البطاقة
            </CardTitle>
            <CardDescription>
              {formatMeta.labelAr} —{' '}
              {cardFormat === 'story' ? 'Instagram · Facebook Stories' : 'Instagram · Facebook · X'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className={`relative mx-auto ${previewMaxWidth} w-full overflow-hidden rounded-2xl border border-white/10 bg-[#041322] shadow-2xl ring-1 ring-teal-500/20 ${previewAspect}`}
            >
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt={`بطاقة مشاركة ${salonName}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full min-h-[200px] items-center justify-center text-sm text-muted-foreground">
                  {cardBusy ? 'جاري التجهيز…' : 'المعاينة…'}
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-3 rounded-xl border border-border bg-background/80 p-3">
              <HalaqmapBrandMark className="h-10 w-10 shrink-0 rounded-xl ring-1 ring-teal-500/30" />
              <div className="min-w-0 text-right">
                <p className="truncate text-sm font-bold">{salonName}</p>
                <p className="text-xs text-muted-foreground">{template.headlineAr}</p>
              </div>
            </div>

            <div className="flex justify-center rounded-xl bg-white p-3">
              <QRCode value={shareUrl} size={cardFormat === 'story' ? 100 : 120} />
            </div>
            <p className="text-center text-[11px] text-muted-foreground">
              رمز QR مطابق للرابط · {formatMeta.labelAr}
            </p>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
