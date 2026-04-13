import { motion } from "framer-motion";
import { Star, MapPin, Phone, MessageCircle, Shield, Sparkles } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { Barber, SubscriptionTier, calculateDistance } from "@/lib/index";
import { useDiamondAppointmentSchedulingShown } from "@/lib/diamondSchedulingVisibility";
import { DiamondAppointmentBooking } from "@/components/DiamondAppointmentBooking";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface BarberCardProps {
  barber: Barber;
  userLocation: { lat: number; lng: number };
}

export function BarberCard({ barber, userLocation }: BarberCardProps) {
  const distance = calculateDistance(
    userLocation.lat,
    userLocation.lng,
    barber.location.lat,
    barber.location.lng
  );
  const showDiamondScheduling = useDiamondAppointmentSchedulingShown(barber);

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
        >
          <Card className="overflow-hidden bg-gradient-to-br from-card via-card to-muted/25 border-border hover:shadow-lg transition-all duration-200">
            <div className="relative h-48 overflow-hidden">
              <img
                src={barber.images[0]}
                alt={barber.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent" />
              <Badge className="absolute top-3 left-3 bg-muted text-muted-foreground border-border">
                برونزي
              </Badge>
            </div>

            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-foreground mb-1">{barber.name}</h3>
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
                <h3 className="text-lg font-semibold text-foreground mb-1">{barber.name}</h3>
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
              </div>
              <Badge className="bg-muted text-muted-foreground border-border">
                برونزي
              </Badge>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-4">
              {barber.images.slice(0, 4).map((img, idx) => (
                <div key={idx} className="aspect-square rounded-lg overflow-hidden">
                  <img
                    src={img}
                    alt={`${barber.name} ${idx + 1}`}
                    className="w-full h-full object-cover"
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
        <Card className="overflow-hidden bg-gradient-to-br from-card via-card to-accent/5 border-accent/20 hover:shadow-xl hover:shadow-accent/10 transition-all duration-200">
          <div className="relative h-48 overflow-hidden">
            <img
              src={barber.images[0]}
              alt={barber.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent" />
            <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground border-accent/50">
              <Sparkles className="w-3 h-3 ml-1" />
              ذهبي
            </Badge>
            {barber.verified && (
              <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground">
                <Shield className="w-3 h-3 ml-1" />
                موثق
              </Badge>
            )}
          </div>

          <div className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-foreground mb-1">{barber.name}</h3>
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
      <Card className="overflow-hidden bg-gradient-to-br from-card via-accent/5 to-accent/10 border-accent/30 hover:shadow-2xl hover:shadow-accent/20 transition-all duration-200 ring-2 ring-accent/20">
        <div className="relative h-56 overflow-hidden">
          <img
            src={barber.images[0]}
            alt={barber.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/60 to-transparent" />
          <Badge className="absolute top-3 left-3 bg-gradient-to-r from-accent via-accent to-accent/80 text-accent-foreground border-accent/50 shadow-lg shadow-accent/30">
            <Sparkles className="w-4 h-4 ml-1 animate-pulse" />
            ماسي
          </Badge>
          {barber.verified && (
            <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground shadow-lg">
              <Shield className="w-4 h-4 ml-1" />
              موثق
            </Badge>
          )}
          <div className="absolute bottom-3 right-3 bg-accent/90 backdrop-blur-sm text-accent-foreground px-3 py-1 rounded-full text-xs font-semibold">
            أولوية الظهور
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-foreground mb-1">{barber.name}</h3>
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