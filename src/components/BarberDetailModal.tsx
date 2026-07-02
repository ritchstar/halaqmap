import { useEffect, useMemo, useRef, useState } from 'react';
import { Barber, Review, SubscriptionTier } from '@/lib/index';
import { getMergedReviewsForBarber, isReviewPublished } from '@/lib/qrReviewsStorage';
import { fetchPublicBarberQrReviewsRemote } from '@/lib/barberQrReviewsRemote';
import { mockReviews } from '@/data/index';
import { fetchPublicBarberGalleryRemote } from '@/lib/barberGalleryRemote';
import { PORTFOLIO_FEATURED_BANNER_MAX } from '@/lib/barberPortfolioPolicy';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Phone, MapPin, MessageCircle, Shield, QrCode, Images, Loader2, Home } from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import { motion } from 'framer-motion';
import { CUSTOMER_MAP_CTA } from '@/config/subscriptionPlanHero';
import { TERM_GEOSPATIAL_DIGITAL_ASSET_AR } from '@/config/softwareLicenseTerminology';
import { getOrderedWeekHoursForDisplay, SAUDI_WEEK_DAY_LABELS } from '@/lib/saudiWorkingWeek';
import { useDiamondAppointmentSchedulingShown } from '@/lib/diamondSchedulingVisibility';
import { DiamondAppointmentBooking } from '@/components/DiamondAppointmentBooking';
import { CustomerBarberChatPreview } from '@/components/CustomerBarberChatPreview';
import { HomeServiceContactRequestForm } from '@/components/HomeServiceContactRequestForm';
import { GroomPrepContactRequestForm } from '@/components/GroomPrepContactRequestForm';
import { formatHomeServiceContactMessage } from '@/lib/homeServiceContactTemplate';
import { formatGroomPrepContactMessage } from '@/lib/groomPrepContactTemplate';
import { SaudiBishtIcon } from '@/components/icons/SaudiBishtIcon';
import { ChildrenSpecialistDetailBanner } from '@/components/barber/ChildrenSpecialistCardChrome';
import { MensGroomingCenterDetailBanner } from '@/components/barber/MensGroomingCenterCardChrome';
import { isChildrenSpecialistBarber } from '@/lib/childrenSpecialistDisplay';
import { isMensGroomingCenterBarber } from '@/lib/mensGroomingCenterDisplay';
import {
  BarberContactCtaButton,
  BarberContactRatingStars,
  BarberContactSheet,
  BarberContactSheetBarberHeader,
  BarberContactSheetSection,
} from '@/components/barber/BarberContactSheet';

type MenuPriceRow = { key: string; name: string; price: string };

interface BarberDetailModalProps {
  barber: Barber;
  isOpen: boolean;
  onClose: () => void;
}

export function BarberDetailModal({ barber, isOpen, onClose }: BarberDetailModalProps) {
  const showDiamondScheduling = useDiamondAppointmentSchedulingShown(barber);
  const previewSecretMarker = barber.previewListing ? (
    <span className="text-muted-foreground font-normal" title="إدراج معاينة">
      {' '}
      *
    </span>
  ) : null;
  const chatPreviewRef = useRef<HTMLDivElement>(null);
  const [pendingChatMessage, setPendingChatMessage] = useState<string | null>(null);
  const [showHomeContactForm, setShowHomeContactForm] = useState(false);
  const [showGroomContactForm, setShowGroomContactForm] = useState(false);
  const [barberReviews, setBarberReviews] = useState(() => getMergedReviewsForBarber(barber.id));
  const [fullGalleryUrls, setFullGalleryUrls] = useState<string[] | null>(null);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [galleryView, setGalleryView] = useState<'featured' | 'full'>('featured');

  const featuredPreview = useMemo(() => {
    if (barber.featuredImages?.length) {
      return barber.featuredImages.slice(0, PORTFOLIO_FEATURED_BANNER_MAX);
    }
    return barber.images.slice(0, PORTFOLIO_FEATURED_BANNER_MAX);
  }, [barber.featuredImages, barber.images]);

  const galleryTotal = barber.galleryCount ?? featuredPreview.length;
  const showGalleryControls =
    (barber.subscription === SubscriptionTier.GOLD || barber.subscription === SubscriptionTier.DIAMOND) &&
    galleryTotal > 1;

  const carouselImages =
    galleryView === 'full' && fullGalleryUrls?.length
      ? fullGalleryUrls
      : featuredPreview.length > 0
        ? featuredPreview
        : barber.images;

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const remote = await fetchPublicBarberQrReviewsRemote(barber.id);
      if (cancelled) return;
      if (remote.ok) {
        const staticPart = mockReviews.filter((r) => r.barberId === barber.id && isReviewPublished(r));
        const byId = new Map<string, Review>();
        for (const r of staticPart) byId.set(r.id, r);
        for (const r of remote.reviews) byId.set(r.id, r);
        const combined = Array.from(byId.values());
        combined.sort((a, b) => {
          const ah = a.isHighlighted ? 1 : 0;
          const bh = b.isHighlighted ? 1 : 0;
          if (bh !== ah) return bh - ah;
          return (b.date || '').localeCompare(a.date || '');
        });
        setBarberReviews(combined);
        return;
      }
      setBarberReviews(getMergedReviewsForBarber(barber.id));
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [barber.id, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    setFullGalleryUrls(null);
    setGalleryView('featured');
    setGalleryLoading(false);
    setPendingChatMessage(null);
    setShowHomeContactForm(false);
    setShowGroomContactForm(false);
  }, [barber.id, isOpen]);

  useEffect(() => {
    const onRefresh = () => {
      void fetchPublicBarberQrReviewsRemote(barber.id).then((remote) => {
        if (!remote.ok) {
          setBarberReviews(getMergedReviewsForBarber(barber.id));
          return;
        }
        const staticPart = mockReviews.filter((r) => r.barberId === barber.id && isReviewPublished(r));
        const byId = new Map<string, Review>();
        for (const r of staticPart) byId.set(r.id, r);
        for (const r of remote.reviews) byId.set(r.id, r);
        setBarberReviews(Array.from(byId.values()));
      });
    };
    window.addEventListener('halaqmap-qr-reviews', onRefresh);
    return () => window.removeEventListener('halaqmap-qr-reviews', onRefresh);
  }, [barber.id]);

  const homeVisit = barber.homeVisitOffer;
  const showHomeVisit =
    homeVisit?.offered &&
    homeVisit.publicVisible !== false &&
    (barber.subscription === SubscriptionTier.GOLD || barber.subscription === SubscriptionTier.DIAMOND);

  const groomPrep = barber.groomPrepOffer;
  const showGroomPrep =
    groomPrep?.offered &&
    groomPrep.publicVisible !== false &&
    barber.subscription === SubscriptionTier.DIAMOND;

  const showChildrenSpecialist = isChildrenSpecialistBarber(barber);
  const showMensGroomingCenter = isMensGroomingCenterBarber(barber);

  const menuRows = useMemo((): MenuPriceRow[] => {
    const rows: MenuPriceRow[] = barber.services.map((service, index) => ({
      key: `service-${index}`,
      name: service.name,
      price: `${service.price} ريال`,
    }));
    if (barber.inclusiveAccessibleCare?.offered) {
      const care = barber.inclusiveAccessibleCare;
      rows.push({
        key: 'inclusive-care',
        name: 'كبار السن والمرضى وذوي الاحتياجات الخاصة — تسهيلات بالمحل و/أو زيارة منزلية بحسب الحالة',
        price:
          care.displayedPriceSar != null && care.displayedPriceSar > 0
            ? `${care.displayedPriceSar} ريال (معروض)`
            : '—',
      });
    }
    if (showHomeVisit && homeVisit) {
      rows.push({
        key: 'home-visit',
        name: 'زيارة منزلية — طلب تواصل (ليس حجزاً عبر المنصة)',
        price:
          homeVisit.displayedPriceSar != null && homeVisit.displayedPriceSar > 0
            ? `${homeVisit.displayedPriceSar} ريال (إرشادي)`
            : '—',
      });
    }
    if (showGroomPrep && groomPrep) {
      rows.push({
        key: 'groom-prep',
        name: 'تجهيز عريس — طلب تواصل (ليس حجزاً عبر المنصة)',
        price:
          groomPrep.displayedPriceSar != null && groomPrep.displayedPriceSar > 0
            ? `${groomPrep.displayedPriceSar} ريال (إرشادي)`
            : '—',
      });
    }
    return rows;
  }, [barber.services, barber.inclusiveAccessibleCare, showHomeVisit, homeVisit, showGroomPrep, groomPrep]);

  const handleHomeContactSubmit = async (
    values: Parameters<typeof formatHomeServiceContactMessage>[1],
  ) => {
    const message = formatHomeServiceContactMessage(barber.name, values);
    setPendingChatMessage(message);
    setShowHomeContactForm(false);
    chatPreviewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleGroomContactSubmit = async (
    values: Parameters<typeof formatGroomPrepContactMessage>[1],
  ) => {
    const message = formatGroomPrepContactMessage(barber.name, values);
    setPendingChatMessage(message);
    setShowGroomContactForm(false);
    chatPreviewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleLocationClick = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${barber.location.lat},${barber.location.lng}`;
    window.open(url, '_blank');
  };

  const handleWhatsAppClick = () => {
    const url = `https://wa.me/${barber.whatsapp.replace(/[^0-9]/g, '')}`;
    window.open(url, '_blank');
  };

  const handlePhoneClick = () => {
    window.location.href = `tel:${barber.phone}`;
  };

  const openFullGallery = async () => {
    if (fullGalleryUrls?.length) {
      setGalleryView('full');
      return;
    }
    setGalleryLoading(true);
    const res = await fetchPublicBarberGalleryRemote(barber.id);
    setGalleryLoading(false);
    if (res.ok && res.publicUrls.length > 0) {
      setFullGalleryUrls(res.publicUrls);
      setGalleryView('full');
    }
  };

  return (
    <BarberContactSheet
      open={isOpen}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
      header={
        <BarberContactSheetBarberHeader
          title={
            <>
              {barber.name}
              {previewSecretMarker}
            </>
          }
          verified={barber.verified}
          tier={barber.subscription}
          rating={barber.rating}
          reviewCount={barber.reviewCount}
          isOpen={barber.isOpen}
        />
      }
      bodyClassName="mt-0 space-y-0"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="barber-contact-inner mt-4 min-w-0 max-w-full overflow-x-clip space-y-5 sm:space-y-6"
      >
          {showMensGroomingCenter ? (
            <MensGroomingCenterDetailBanner lines={barber.groomingCenterBannerLines ?? []} />
          ) : null}
          {showChildrenSpecialist ? <ChildrenSpecialistDetailBanner /> : null}

          {featuredPreview.length > 1 && galleryView === 'featured' ? (
            <div className="grid min-w-0 max-w-full grid-cols-2 gap-2 sm:grid-cols-4">
              {featuredPreview.map((src) => (
                <div key={src} className="aspect-square overflow-hidden rounded-lg border border-border bg-muted">
                  <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
                </div>
              ))}
            </div>
          ) : null}

          <Carousel className="relative w-full min-w-0 max-w-full overflow-hidden" dir="ltr">
            <CarouselContent className="ml-0">
              {carouselImages.map((image, index) => (
                <CarouselItem key={`${image}-${index}`} className="basis-full pl-0">
                  <div className="relative aspect-video overflow-hidden rounded-lg">
                    <img
                      src={image}
                      alt={`${barber.name} - صورة ${index + 1}`}
                      className="h-full w-full max-w-full object-cover"
                      loading={index === 0 ? 'eager' : 'lazy'}
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {carouselImages.length > 1 ? (
              <>
                <CarouselPrevious className="left-2 h-8 w-8 border-background/80 bg-background/90 sm:left-4" />
                <CarouselNext className="right-2 h-8 w-8 border-background/80 bg-background/90 sm:right-4" />
              </>
            ) : null}
          </Carousel>

          {showGalleryControls ? (
            <div className="flex flex-wrap items-center gap-2">
              {galleryTotal > featuredPreview.length ? (
                <Button
                  type="button"
                  variant="secondary"
                  className="gap-2"
                  disabled={galleryLoading}
                  onClick={() => void openFullGallery()}
                >
                  {galleryLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : (
                    <Images className="h-4 w-4" aria-hidden />
                  )}
                  عرض المعرض كاملاً ({galleryTotal} صورة)
                </Button>
              ) : null}
              {galleryView === 'full' ? (
                <Button type="button" variant="outline" onClick={() => setGalleryView('featured')}>
                  الصور المميزة
                </Button>
              ) : null}
            </div>
          ) : null}

          <div className="grid min-w-0 max-w-full grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
            <BarberContactCtaButton
              onClick={handleLocationClick}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <MapPin className="w-5 h-5 ml-2 shrink-0" />
              {CUSTOMER_MAP_CTA}
            </BarberContactCtaButton>
            <BarberContactCtaButton onClick={handlePhoneClick} variant="outline">
              <Phone className="w-5 h-5 ml-2 shrink-0" />
              <span dir="ltr">{barber.phone}</span>
            </BarberContactCtaButton>
          </div>

          {(barber.subscription === SubscriptionTier.GOLD || barber.subscription === SubscriptionTier.DIAMOND) && (
            <div className="grid min-w-0 max-w-full grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
              <BarberContactCtaButton
                onClick={handleWhatsAppClick}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <SiWhatsapp className="w-5 h-5 ml-2 shrink-0" />
                واتساب
              </BarberContactCtaButton>
              <BarberContactCtaButton
                type="button"
                variant="outline"
                className="border-primary text-primary hover:bg-primary/10"
                onClick={() =>
                  chatPreviewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
              >
                <MessageCircle className="w-5 h-5 ml-2 shrink-0" />
                شات مباشر — انتقل للمعاينة
              </BarberContactCtaButton>
            </div>
          )}

          {showHomeVisit && homeVisit && (
            <>
              <Card className="min-w-0 overflow-hidden border-emerald-500/30 bg-gradient-to-br from-emerald-500/[0.05] to-card">
                <CardContent className="min-w-0 p-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <Home className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="min-w-0 space-y-1">
                      <p className="font-semibold break-words">زيارة منزلية</p>
                      <p className="text-sm text-muted-foreground leading-relaxed break-words">
                        {homeVisit.displayedPriceSar != null && homeVisit.displayedPriceSar > 0
                          ? `من ${homeVisit.displayedPriceSar} ر.س (إرشادي)`
                          : 'سعر حسب التنسيق المباشر'}
                        {homeVisit.radiusKm != null && homeVisit.radiusKm > 0
                          ? ` · نطاق ~${homeVisit.radiusKm} كم`
                          : ''}
                      </p>
                      {homeVisit.customerNote?.trim() ? (
                        <p className="text-xs text-muted-foreground">{homeVisit.customerNote.trim()}</p>
                      ) : null}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-green-600/40 text-green-700 hover:bg-green-50 dark:hover:bg-green-950/20"
                      onClick={handleWhatsAppClick}
                    >
                      <SiWhatsapp className="w-4 h-4 ml-2" />
                      تواصل واتساب
                    </Button>
                    <Button
                      type="button"
                      className="w-full"
                      onClick={() => {
                        setShowHomeContactForm((v) => !v);
                        if (!showHomeContactForm) {
                          window.setTimeout(() => {
                            chatPreviewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }, 100);
                        }
                      }}
                    >
                      <Home className="w-4 h-4 ml-2" />
                      {showHomeContactForm ? 'إخفاء النموذج' : 'طلب تواصل منزلية'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
              {showHomeContactForm ? (
                <HomeServiceContactRequestForm
                  barberName={barber.name}
                  onSubmit={handleHomeContactSubmit}
                />
              ) : null}
            </>
          )}

          {showGroomPrep && groomPrep && (
            <>
              <Card className="min-w-0 overflow-hidden border-amber-500/35 bg-gradient-to-br from-amber-500/[0.06] to-card">
                <CardContent className="min-w-0 p-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <SaudiBishtIcon className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" title="تجهيز عريس" />
                    <div className="min-w-0 space-y-1">
                      <p className="font-semibold break-words">تجهيز عريس</p>
                      <p className="text-sm text-muted-foreground leading-relaxed break-words">
                        {groomPrep.displayedPriceSar != null && groomPrep.displayedPriceSar > 0
                          ? `من ${groomPrep.displayedPriceSar} ر.س (إرشادي)`
                          : 'سعر حسب التنسيق المباشر'}
                      </p>
                      {groomPrep.customerNote?.trim() ? (
                        <p className="text-xs text-muted-foreground">{groomPrep.customerNote.trim()}</p>
                      ) : null}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-green-600/40 text-green-700 hover:bg-green-50 dark:hover:bg-green-950/20"
                      onClick={handleWhatsAppClick}
                    >
                      <SiWhatsapp className="w-4 h-4 ml-2" />
                      تواصل واتساب
                    </Button>
                    <Button
                      type="button"
                      className="w-full"
                      onClick={() => {
                        setShowGroomContactForm((v) => !v);
                        if (!showGroomContactForm) {
                          window.setTimeout(() => {
                            chatPreviewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }, 100);
                        }
                      }}
                    >
                      <SaudiBishtIcon className="w-4 h-4 ml-2" title="تجهيز عريس" />
                      {showGroomContactForm ? 'إخفاء النموذج' : 'طلب تواصل تجهيز عريس'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
              {showGroomContactForm ? (
                <GroomPrepContactRequestForm
                  barberName={barber.name}
                  onSubmit={handleGroomContactSubmit}
                />
              ) : null}
            </>
          )}

          {(barber.subscription === SubscriptionTier.GOLD ||
            barber.subscription === SubscriptionTier.DIAMOND) && (
            <div ref={chatPreviewRef} className="barber-contact-inner scroll-mt-4 min-w-0 max-w-full overflow-hidden">
              <CustomerBarberChatPreview
                tier={
                  barber.subscription === SubscriptionTier.DIAMOND
                    ? SubscriptionTier.DIAMOND
                    : SubscriptionTier.GOLD
                }
                barberId={barber.id}
                barberName={barber.name}
                previewListing={barber.previewListing}
                injectMessage={pendingChatMessage}
                onInjectMessageSent={() => setPendingChatMessage(null)}
              />
            </div>
          )}

          {barber.subscription === SubscriptionTier.DIAMOND && showDiamondScheduling && (
            <DiamondAppointmentBooking barberId={barber.id} barberName={barber.name} />
          )}

          <Separator />

          <BarberContactSheetSection>
            <h3 className="mb-4 text-lg font-bold sm:text-xl">منيو الحلاقة والأسعار</h3>
            <Card className="min-w-0 overflow-hidden">
              <CardContent className="p-0">
                <ul className="divide-y md:hidden">
                  {menuRows.map((row) => (
                    <li key={row.key} className="flex items-start justify-between gap-3 px-3 py-3">
                      <span className="min-w-0 flex-1 font-medium leading-snug break-words">{row.name}</span>
                      <span className="shrink-0 font-semibold text-primary">{row.price}</span>
                    </li>
                  ))}
                </ul>
                <div className="hidden overflow-x-auto md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right font-semibold">الخدمة</TableHead>
                        <TableHead className="text-left font-semibold">السعر</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {menuRows.map((row) => (
                        <TableRow key={row.key}>
                          <TableCell className="font-medium leading-snug">{row.name}</TableCell>
                          <TableCell className="text-left font-semibold text-primary">{row.price}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {barber.inclusiveAccessibleCare?.offered &&
                  (() => {
                    const c = barber.inclusiveAccessibleCare;
                    const bits: string[] = [];
                    if (c.restrictToDays && c.activeDayFlags) {
                      const ds = SAUDI_WEEK_DAY_LABELS.filter((d) => c.activeDayFlags![d]);
                      if (ds.length) bits.push(`أيام ${TERM_GEOSPATIAL_DIGITAL_ASSET_AR} عن الخدمة: ${ds.join('، ')}`);
                    }
                    const note = c.customerNote?.trim();
                    if (note) bits.push(note);
                    if (bits.length === 0) return null;
                    return (
                      <div className="border-t px-3 py-3 text-sm text-muted-foreground space-y-1.5 leading-relaxed break-words">
                        {bits.map((line, i) => (
                          <p key={i}>{line}</p>
                        ))}
                      </div>
                    );
                  })()}
              </CardContent>
            </Card>
          </BarberContactSheetSection>

          <Separator />

          <BarberContactSheetSection>
            <h3 className="mb-2 text-lg font-bold">أوقات العمل</h3>
            <p className="text-xs text-muted-foreground mb-3">
              جدول الأسبوع كاملاً (من السبت إلى الجمعة)
            </p>
            <Card className="min-w-0 overflow-hidden">
              <CardContent className="min-w-0 p-3 sm:p-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 sm:gap-2">
                  {getOrderedWeekHoursForDisplay(barber.workingHours).map(({ day, line, closed }) => (
                    <div
                      key={day}
                      className={`flex flex-col gap-0.5 rounded-md border px-2 py-1.5 text-center sm:text-right ${
                        closed ? 'bg-muted/40 border-border/60' : 'bg-muted/50 border-border'
                      }`}
                    >
                      <span className="text-[10px] sm:text-xs font-semibold text-foreground leading-tight">{day}</span>
                      <span
                        className={`text-[10px] sm:text-xs font-mono leading-tight ${closed ? 'text-muted-foreground' : 'text-foreground'}`}
                        dir="ltr"
                      >
                        {line}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </BarberContactSheetSection>

          <Separator />

          <BarberContactSheetSection>
            <h3 className="mb-4 text-lg font-bold sm:text-xl">التقييمات ({barberReviews.length})</h3>
            <div className="space-y-4">
              {barberReviews.length > 0 ? (
                barberReviews.map((review) => (
                  <Card key={review.id} className="min-w-0 overflow-hidden">
                    <CardContent className="min-w-0 p-4">
                      <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex min-w-0 flex-wrap items-center gap-2">
                          <span className="font-semibold">{review.customerName}</span>
                          {review.verified && (
                            <Badge variant="outline" className="text-xs border-primary text-primary">
                              <Shield className="w-3 h-3 ml-1" />
                              موثق
                            </Badge>
                          )}
                          {review.viaQrInvite && (
                            <Badge variant="secondary" className="text-xs gap-1">
                              <QrCode className="w-3 h-3" />
                              عبر دعوة QR
                            </Badge>
                          )}
                        </div>
                        <span className="shrink-0 text-sm text-muted-foreground">{review.date}</span>
                      </div>
                      <div className="mb-2">
                        <BarberContactRatingStars rating={review.rating} />
                      </div>
                      <p className="break-words text-muted-foreground">{review.comment}</p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    لا توجد تقييمات بعد
                  </CardContent>
                </Card>
              )}
            </div>
          </BarberContactSheetSection>

          <BarberContactSheetSection
            id="barber-contact-address"
            className="scroll-mt-4 rounded-lg bg-muted/50 p-4 max-sm:mb-1"
          >
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div className="min-w-0">
                <p className="mb-1 font-semibold">العنوان</p>
                <p className="break-words text-muted-foreground">{barber.location.address}</p>
              </div>
            </div>
          </BarberContactSheetSection>
        </motion.div>
    </BarberContactSheet>
  );
}