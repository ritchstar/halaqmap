import { motion } from "framer-motion";
import { Star, MapPin, Phone, MessageCircle, Shield, Sparkles, Images } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { Barber, SubscriptionTier, calculateDistance } from "@/lib/index";
import { SaudiBishtIcon } from "@/components/icons/SaudiBishtIcon";
import {
  ChildrenSpecialistBadge,
  ChildrenSpecialistHeroBanner,
  ChildrenSpecialistHeroChrome,
} from "@/components/barber/ChildrenSpecialistCardChrome";
import {
  MensGroomingCenterBadge,
  MensGroomingCenterHeroBanner,
  MensGroomingCenterHeroChrome,
} from "@/components/barber/MensGroomingCenterCardChrome";
import {
  CHILDREN_SPECIALIST_CARD_RING_CLASS,
  CHILDREN_SPECIALIST_CARD_SURFACE_CLASS,
  isChildrenSpecialistBarber,
} from "@/lib/childrenSpecialistDisplay";
import {
  MENS_GROOMING_CENTER_CARD_RING_CLASS,
  MENS_GROOMING_CENTER_CARD_SURFACE_CLASS,
  isMensGroomingCenterBarber,
} from "@/lib/mensGroomingCenterDisplay";
import { cn } from "@/lib/utils";
import {
  BARBER_CARD_HERO_FRAME_BRONZE_CLASS,
  BARBER_CARD_HERO_FRAME_DIAMOND_CLASS,
  BARBER_CARD_HERO_FRAME_GOLD_CLASS,
  BARBER_CARD_HERO_IMAGE_CLASS,
} from "@/config/barberBannerImagePolicy";
import { useDiamondAppointmentSchedulingShown } from "@/lib/diamondSchedulingVisibility";
import { DiamondAppointmentBooking } from "@/components/DiamondAppointmentBooking";
import { CustomerBarberChatPreview } from "@/components/CustomerBarberChatPreview";
import { ShowcasePreviewCardBadge } from "@/components/ShowcaseEducationBanner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PlatformDisplayImage } from '@/components/platform/PlatformDisplayImage';

interface BarberCardProps {
  barber: Barber;
  userLocation: { lat: number; lng: number };
}

function PublicGalleryCountBadge({ barber }: { barber: Barber }) {
  const total = barber.galleryCount ?? 0;
  if (total <= 1) return null;
  if (
    barber.subscription !== SubscriptionTier.GOLD &&
    barber.subscription !== SubscriptionTier.DIAMOND
  ) {
    return null;
  }
  return (
    <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1 rounded-full border border-border/60 bg-background/85 px-2.5 py-1 text-[11px] font-semibold text-foreground backdrop-blur-sm">
      <Images className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
      <span dir="ltr">{total} صور</span>
    </div>
  );
}

function SpecialistHeroOverlay({ barber }: { barber: Barber }) {
  if (isMensGroomingCenterBarber(barber)) {
    return (
      <>
        <MensGroomingCenterHeroChrome />
        <MensGroomingCenterHeroBanner lines={barber.groomingCenterBannerLines ?? []} />
      </>
    );
  }
  if (!isChildrenSpecialistBarber(barber)) return null;
  return (
    <>
      <ChildrenSpecialistHeroChrome />
      <ChildrenSpecialistHeroBanner />
    </>
  );
}

function ChildrenServicesInline({ barber }: { barber: Barber }) {
  if (isMensGroomingCenterBarber(barber)) {
    return <MensGroomingCenterBadge className="mt-2" />;
  }
  if (isChildrenSpecialistBarber(barber)) {
    return <ChildrenSpecialistBadge className="mt-2" />;
  }
  if (barber.acceptsChildren) {
    return (
      <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
        يستقبل حلاقة الأطفال
      </p>
    );
  }
  return null;
}

function HomeVisitInline({ barber }: { barber: Barber }) {
  const h = barber.homeVisitOffer;
  if (!h?.offered || h.publicVisible === false) return null;
  if (barber.subscription !== SubscriptionTier.GOLD && barber.subscription !== SubscriptionTier.DIAMOND) {
    return null;
  }
  const price =
    h.displayedPriceSar != null && h.displayedPriceSar > 0 ? `${h.displayedPriceSar} ر.س` : null;
  const radius = h.radiusKm != null && h.radiusKm > 0 ? `~${h.radiusKm} كم` : null;
  return (
    <p className="text-[11px] sm:text-xs text-muted-foreground mt-1.5 leading-relaxed border-t border-border/60 pt-1.5">
      🏠 زيارة منزلية
      {price || radius ? (
        <span className="font-semibold text-foreground">
          {' '}
          {[price, radius].filter(Boolean).join(' · ')}
        </span>
      ) : null}
    </p>
  );
}

function GroomPrepInline({ barber }: { barber: Barber }) {
  const g = barber.groomPrepOffer;
  if (!g?.offered || g.publicVisible === false) return null;
  if (barber.subscription !== SubscriptionTier.DIAMOND) return null;
  const price =
    g.displayedPriceSar != null && g.displayedPriceSar > 0 ? `${g.displayedPriceSar} ر.س` : null;
  return (
    <p className="text-[11px] sm:text-xs text-muted-foreground mt-1.5 leading-relaxed border-t border-border/60 pt-1.5 flex items-center gap-1">
      <SaudiBishtIcon className="h-3 w-3 shrink-0 text-amber-600" title="تجهيز عريس" />
      <span>
        تجهيز عريس
        {price ? (
          <span className="font-semibold text-foreground"> {price}</span>
        ) : null}
      </span>
    </p>
  );
}

function InclusiveCareInline({ barber }: { barber: Barber }) {
  const c = barber.inclusiveAccessibleCare;
  if (!c?.offered) return null;
  const p = c.displayedPriceSar;
  const note = c.customerNote?.trim();
  return (
    <p className="text-[11px] sm:text-xs text-muted-foreground mt-1.5 leading-relaxed border-t border-border/60 pt-1.5">
      كبار السن والمرضى وذوي الاحتياجات (تسهيلات بالمحل و/أو زيارة منزلية):{' '}
      <span className="font-semibold text-foreground">
        {p != null && p > 0 ? `${p} ر.س معروض` : '—'}
      </span>
      {note ? (
        <span className="block mt-1 font-normal opacity-90">
          {note.length > 72 ? `${note.slice(0, 72)}…` : note}
        </span>
      ) : null}
    </p>
  );
}

export function BarberCard({ barber, userLocation }: BarberCardProps) {
  const distance = calculateDistance(
    userLocation.lat,
    userLocation.lng,
    barber.location.lat,
    barber.location.lng
  );
  const showDiamondScheduling = useDiamondAppointmentSchedulingShown(barber);
  const previewSecretMarker = barber.previewListing ? (
    <span className="text-muted-foreground font-normal" title="إدراج معاينة">
      {" "}
      *
    </span>
  ) : null;
  const showcaseCardRing = barber.showcasePreview
    ? 'ring-2 ring-teal-400/50 shadow-[0_0_40px_rgba(20,184,166,0.15)]'
    : '';
  const isChildrenSpec = isChildrenSpecialistBarber(barber);
  const isMensGrooming = isMensGroomingCenterBarber(barber);
  const specialistRing = isMensGrooming
    ? MENS_GROOMING_CENTER_CARD_RING_CLASS
    : isChildrenSpec
      ? CHILDREN_SPECIALIST_CARD_RING_CLASS
      : '';
  const specialistSurface = isMensGrooming
    ? MENS_GROOMING_CENTER_CARD_SURFACE_CLASS
    : isChildrenSpec
      ? CHILDREN_SPECIALIST_CARD_SURFACE_CLASS
      : '';
  const tierBadgeTop = isMensGrooming || isChildrenSpec ? 'top-11' : 'top-3';

  const openGoogleMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${barber.location.lat},${barber.location.lng}`;
    window.open(url, "_blank");
  };

  const openWhatsApp = () => {
    const url = `https://wa.me/${barber.whatsapp.replace(/[^0-9]/g, "")}`;
    window.open(url, "_blank");
  };

  const callPhone = () => {
    window.location.href = `tel:${barber.phone}`;
  };

  if (barber.subscription === SubscriptionTier.BRONZE) {
    if (barber.showcaseTopBanner) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 35 }}
          className="overflow-visible"
        >
          <Card className={cn('overflow-hidden bg-gradient-to-br from-card via-card to-muted/25 border-border hover:shadow-lg transition-all duration-200', specialistRing, specialistSurface)}>
            <div className={BARBER_CARD_HERO_FRAME_BRONZE_CLASS}>
              <PlatformDisplayImage
                src={barber.images[0]}
                alt={barber.name}
                variant="banner_card"
                className={BARBER_CARD_HERO_IMAGE_CLASS}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent" />
              <SpecialistHeroOverlay barber={barber} />
              <Badge className={cn('absolute left-3 bg-muted text-muted-foreground border-border', tierBadgeTop)}>
                برونزي
              </Badge>
            </div>

            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-foreground mb-1">
                    {barber.name}
                    {previewSecretMarker}
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(barber.rating)
                              ? "fill-accent text-accent"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">({barber.reviewCount})</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <MapPin className="w-4 h-4" />
                    <span>{distance.toFixed(1)} كم</span>
                  </div>
                  <Badge variant={barber.isOpen ? "default" : "secondary"} className="text-xs">
                    {barber.isOpen ? "مفتوح الآن" : "مغلق"}
                  </Badge>
                  <InclusiveCareInline barber={barber} />
                  <ChildrenServicesInline barber={barber} />
                  <HomeVisitInline barber={barber} />
                  <GroomPrepInline barber={barber} />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={openGoogleMaps}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <MapPin className="w-4 h-4 ml-2" />
                  الموقع
                </Button>
                <Button
                  onClick={openWhatsApp}
                  className="bg-[#25D366] hover:bg-[#20BA5A] text-white"
                  size="icon"
                >
                  <SiWhatsapp className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="border-primary text-primary hover:bg-primary/10"
                >
                  <MessageCircle className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 35 }}
      >
        <Card className="overflow-hidden bg-gradient-to-br from-card via-card to-muted/20 border-border hover:shadow-lg transition-all duration-200">
          <div className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  {barber.name}
                  {previewSecretMarker}
                </h3>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(barber.rating)
                            ? "fill-accent text-accent"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">({barber.reviewCount})</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <MapPin className="w-4 h-4" />
                  <span>{distance.toFixed(1)} كم</span>
                </div>
                <Badge variant={barber.isOpen ? "default" : "secondary"} className="text-xs">
                  {barber.isOpen ? "مفتوح الآن" : "مغلق"}
                </Badge>
                <InclusiveCareInline barber={barber} />
                <ChildrenServicesInline barber={barber} />
                <HomeVisitInline barber={barber} />
                <GroomPrepInline barber={barber} />
              </div>
              <Badge className="bg-muted text-muted-foreground border-border">
                برونزي
              </Badge>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-4">
              {barber.images.slice(0, 4).map((img, idx) => (
                <div key={idx} className="aspect-square rounded-lg overflow-hidden">
                  <PlatformDisplayImage
                    src={img}
                    alt={`${barber.name} ${idx + 1}`}
                    variant="gallery_tile"
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={openGoogleMaps}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <MapPin className="w-4 h-4 ml-2" />
                الموقع
              </Button>
              <Button
                onClick={callPhone}
                variant="outline"
                size="icon"
                className="border-border hover:bg-muted"
              >
                <Phone className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  if (barber.subscription === SubscriptionTier.GOLD) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 35 }}
      >
        <Card className={cn('overflow-hidden bg-gradient-to-br from-card via-card to-accent/5 border-accent/25 shadow-md hover:shadow-xl hover:shadow-accent/10 transition-all duration-200 ring-1 ring-accent/20', specialistRing, specialistSurface)}>
          <div className={BARBER_CARD_HERO_FRAME_GOLD_CLASS}>
            <PlatformDisplayImage
              src={barber.images[0]}
              alt={barber.name}
              variant="banner_card"
              className={BARBER_CARD_HERO_IMAGE_CLASS}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent" />
            <SpecialistHeroOverlay barber={barber} />
            <Badge className={cn('absolute left-3 bg-accent text-accent-foreground border-accent/50 shadow-sm', tierBadgeTop)}>
              <Sparkles className="w-3 h-3 ml-1" />
              ذهبي
            </Badge>
            {barber.verified && (
              <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground">
                <Shield className="w-3 h-3 ml-1" />
                موثق
              </Badge>
            )}
            <PublicGalleryCountBadge barber={barber} />
          </div>

          <div className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-foreground mb-1">
                  {barber.name}
                  {previewSecretMarker}
                </h3>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(barber.rating)
                            ? "fill-accent text-accent"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">({barber.reviewCount})</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <MapPin className="w-4 h-4" />
                  <span>{distance.toFixed(1)} كم</span>
                </div>
                <Badge variant={barber.isOpen ? "default" : "secondary"} className="text-xs">
                  {barber.isOpen ? "مفتوح الآن" : "مغلق"}
                </Badge>
                <InclusiveCareInline barber={barber} />
                <ChildrenServicesInline barber={barber} />
                <HomeVisitInline barber={barber} />
                <GroomPrepInline barber={barber} />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={openGoogleMaps}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <MapPin className="w-4 h-4 ml-2" />
                الموقع
              </Button>
              <Button
                onClick={openWhatsApp}
                className="bg-[#25D366] hover:bg-[#20BA5A] text-white"
                size="icon"
              >
                <SiWhatsapp className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="border-primary text-primary hover:bg-primary/10"
              >
                <MessageCircle className="w-4 h-4" />
              </Button>
            </div>
            <div className="mt-4">
              <CustomerBarberChatPreview
                tier={SubscriptionTier.GOLD}
                barberId={barber.id}
                barberName={barber.name}
                previewListing={barber.previewListing}
                compact
              />
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 35 }}
    >
      <Card className={cn('overflow-hidden bg-gradient-to-br from-card via-accent/5 to-accent/10 border-accent/30 hover:shadow-2xl hover:shadow-accent/20 transition-all duration-200 ring-2 ring-accent/20', showcaseCardRing, specialistRing, specialistSurface)}>
        <div className={BARBER_CARD_HERO_FRAME_DIAMOND_CLASS}>
          <PlatformDisplayImage
            src={barber.images[0]}
            alt={barber.name}
            variant="banner_card"
            className={BARBER_CARD_HERO_IMAGE_CLASS}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/60 to-transparent" />
          <SpecialistHeroOverlay barber={barber} />
          <Badge className={cn('absolute left-3 bg-gradient-to-r from-accent via-accent to-accent/80 text-accent-foreground border-accent/50 shadow-lg shadow-accent/30', tierBadgeTop)}>
            <Sparkles className="w-4 h-4 ml-1 animate-pulse" />
            ماسي
          </Badge>
          {barber.showcasePreview ? (
            <ShowcasePreviewCardBadge />
          ) : barber.verified ? (
            <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground shadow-lg">
              <Shield className="w-4 h-4 ml-1" />
              موثق
            </Badge>
          ) : null}
          {isChildrenSpec ? (
            <div className="absolute bottom-3 right-3 z-10">
              <ChildrenSpecialistBadge size="md" />
            </div>
          ) : (
            <div className="absolute bottom-3 right-3 bg-accent/90 backdrop-blur-sm text-accent-foreground px-3 py-1 rounded-full text-xs font-semibold">
              أولوية الظهور
            </div>
          )}
          <PublicGalleryCountBadge barber={barber} />
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-foreground mb-1">
                {barber.name}
                {previewSecretMarker}
              </h3>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(barber.rating)
                          ? "fill-accent text-accent"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground font-medium">({barber.reviewCount})</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <MapPin className="w-4 h-4" />
                <span className="font-medium">{distance.toFixed(1)} كم</span>
              </div>
              <Badge variant={barber.isOpen ? "default" : "secondary"} className="text-xs">
                {barber.isOpen ? "مفتوح الآن" : "مغلق"}
              </Badge>
              <InclusiveCareInline barber={barber} />
              <ChildrenServicesInline barber={barber} />
              <HomeVisitInline barber={barber} />
              <GroomPrepInline barber={barber} />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={openGoogleMaps}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
            >
              <MapPin className="w-4 h-4 ml-2" />
              الموقع
            </Button>
            <Button
              onClick={openWhatsApp}
              className="bg-[#25D366] hover:bg-[#20BA5A] text-white shadow-lg"
              size="icon"
            >
              <SiWhatsapp className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="border-primary text-primary hover:bg-primary/10 shadow-md"
            >
              <MessageCircle className="w-5 h-5" />
            </Button>
          </div>
          <div className="mt-4">
            <CustomerBarberChatPreview
              tier={barber.subscription === SubscriptionTier.DIAMOND ? SubscriptionTier.DIAMOND : SubscriptionTier.GOLD}
              barberId={barber.id}
              barberName={barber.name}
              previewListing={barber.previewListing}
              compact
            />
          </div>
          {showDiamondScheduling && (
            <div className="mt-4">
              <DiamondAppointmentBooking barberId={barber.id} barberName={barber.name} compact />
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}