import { useEffect, useMemo, useRef, useState } from 'react';
import { Barber, SubscriptionTier } from '@/lib/index';
import { getMergedReviewsForBarber } from '@/lib/qrReviewsStorage';
import { fetchPublicBarberGalleryRemote } from '@/lib/barberGalleryRemote';
import { PORTFOLIO_FEATURED_BANNER_MAX } from '@/lib/barberPortfolioPolicy';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Phone, MapPin, MessageCircle, Star, Shield, Clock, QrCode, Images, Loader2, Home } from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import { motion, AnimatePresence } from 'framer-motion';
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
    setBarberReviews(getMergedReviewsForBarber(barber.id));
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
    const onRefresh = () => setBarberReviews(getMergedReviewsForBarber(barber.id));
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

  const getTierBadge = () => {
    const tierConfig = {
      [SubscriptionTier.DIAMOND]: { label: 'ماسي', className: 'bg-gradient-to-r from-accent via-accent/80 to-accent text-accent-foreground' },
      [SubscriptionTier.GOLD]: { label: 'ذهبي', className: 'bg-gradient-to-r from-accent/70 via-accent/60 to-accent/70 text-accent-foreground' },
      [SubscriptionTier.BRONZE]: { label: 'برونزي', className: 'bg-muted text-muted-foreground' },
    };
    const config = tierConfig[barber.subscription];
    return <Badge className={`${config.className} font-semibold px-3 py-1`}>{config.label}</Badge>;
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5" dir="ltr">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'fill-accent text-accent' : 'text-muted'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DialogTitle className="text-2xl font-bold">
                {barber.name}
                {previewSecretMarker}
              </DialogTitle>
              {barber.verified && (
                <Badge variant="outline" className="flex items-center gap-1 border-primary text-primary">
                  <Shield className="w-3 h-3" />
                  موثق
                </Badge>
              )}
            </div>
            {getTierBadge()}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
            <div className="flex items-center gap-1">
              {renderStars(barber.rating)}
              <span className="mr-1">({barber.reviewCount} تقييم)</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span className={barber.isOpen ? 'text-green-600' : 'text-destructive'}>
                {barber.isOpen ? 'مفتوح الآن' : 'مغلق'}
              </span>
            </div>
          </div>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6 mt-4"
        >
          {featuredPreview.length > 1 && galleryView === 'featured' ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {featuredPreview.map((src) => (
                <div key={src} className="aspect-square overflow-hidden rounded-lg border border-border bg-muted">
                  <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
                </div>
              ))}
            </div>
          ) : null}

          <Carousel className="w-full" dir="ltr">
            <CarouselContent>
              {carouselImages.map((image, index) => (
                <CarouselItem key={`${image}-${index}`}>
                  <div className="relative aspect-video rounded-lg overflow-hidden">
                    <img
                      src={image}
                      alt={`${barber.name} - صورة ${index + 1}`}
                      className="w-full h-full object-cover"
                      loading={index === 0 ? 'eager' : 'lazy'}
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {carouselImages.length > 1 ? (
              <>
                <CarouselPrevious className="left-4" />
                <CarouselNext className="right-4" />
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={handleLocationClick}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 text-lg"
            >
              <MapPin className="w-5 h-5 ml-2" />
              {CUSTOMER_MAP_CTA}
            </Button>
            <Button
              onClick={handlePhoneClick}
              variant="outline"
              className="w-full py-6 text-lg font-semibold"
            >
              <Phone className="w-5 h-5 ml-2" />
              {barber.phone}
            </Button>
          </div>

          {(barber.subscription === SubscriptionTier.GOLD || barber.subscription === SubscriptionTier.DIAMOND) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={handleWhatsAppClick}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-6 text-lg"
              >
                <SiWhatsapp className="w-5 h-5 ml-2" />
                واتساب
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full py-6 text-lg font-semibold border-primary text-primary hover:bg-primary/10"
                onClick={() =>
                  chatPreviewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
              >
                <MessageCircle className="w-5 h-5 ml-2" />
                شات مباشر — انتقل للمعاينة
              </Button>
            </div>
          )}

          {showHomeVisit && homeVisit && (
            <>
              <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/[0.05] to-card">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <Home className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-semibold">زيارة منزلية</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
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
              <Card className="border-amber-500/35 bg-gradient-to-br from-amber-500/[0.06] to-card">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <SaudiBishtIcon className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" title="تجهيز عريس" />
                    <div className="space-y-1">
                      <p className="font-semibold">تجهيز عريس</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
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
            <div ref={chatPreviewRef} className="scroll-mt-4">
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

          <div>
            <h3 className="text-xl font-bold mb-4">منيو الحلاقة والأسعار</h3>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right font-semibold">الخدمة</TableHead>
                      <TableHead className="text-left font-semibold">السعر</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {barber.services.map((service, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{service.name}</TableCell>
                        <TableCell className="text-left font-semibold text-primary">
                          {service.price} ريال
                        </TableCell>
                      </TableRow>
                    ))}
                    {barber.inclusiveAccessibleCare?.offered && (
                      <TableRow>
                        <TableCell className="font-medium leading-snug">
                          كبار السن والمرضى وذوي الاحتياجات الخاصة — تسهيلات بالمحل و/أو زيارة منزلية بحسب
                          الحالة
                        </TableCell>
                        <TableCell className="text-left font-semibold text-primary">
                          {barber.inclusiveAccessibleCare.displayedPriceSar != null &&
                          barber.inclusiveAccessibleCare.displayedPriceSar > 0
                            ? `${barber.inclusiveAccessibleCare.displayedPriceSar} ريال (معروض)`
                            : '—'}
                        </TableCell>
                      </TableRow>
                    )}
                    {showHomeVisit && homeVisit && (
                      <TableRow>
                        <TableCell className="font-medium leading-snug">
                          زيارة منزلية — طلب تواصل (ليس حجزاً عبر المنصة)
                        </TableCell>
                        <TableCell className="text-left font-semibold text-primary">
                          {homeVisit.displayedPriceSar != null && homeVisit.displayedPriceSar > 0
                            ? `${homeVisit.displayedPriceSar} ريال (إرشادي)`
                            : '—'}
                        </TableCell>
                      </TableRow>
                    )}
                    {showGroomPrep && groomPrep && (
                      <TableRow>
                        <TableCell className="font-medium leading-snug">
                          تجهيز عريس — طلب تواصل (ليس حجزاً عبر المنصة)
                        </TableCell>
                        <TableCell className="text-left font-semibold text-primary">
                          {groomPrep.displayedPriceSar != null && groomPrep.displayedPriceSar > 0
                            ? `${groomPrep.displayedPriceSar} ريال (إرشادي)`
                            : '—'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
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
                      <div className="border-t px-3 py-3 text-sm text-muted-foreground space-y-1.5 leading-relaxed">
                        {bits.map((line, i) => (
                          <p key={i}>{line}</p>
                        ))}
                      </div>
                    );
                  })()}
              </CardContent>
            </Card>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-bold mb-2">أوقات العمل</h3>
            <p className="text-xs text-muted-foreground mb-3">
              جدول الأسبوع كاملاً (من السبت إلى الجمعة)
            </p>
            <Card>
              <CardContent className="p-3 sm:p-4">
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
          </div>

          <Separator />

          <div>
            <h3 className="text-xl font-bold mb-4">التقييمات ({barberReviews.length})</h3>
            <div className="space-y-4">
              {barberReviews.length > 0 ? (
                barberReviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
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
                        <span className="text-sm text-muted-foreground">{review.date}</span>
                      </div>
                      <div className="mb-2">{renderStars(review.rating)}</div>
                      <p className="text-muted-foreground">{review.comment}</p>
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
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold mb-1">العنوان</p>
                <p className="text-muted-foreground">{barber.location.address}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}