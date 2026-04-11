import { Barber, SubscriptionTier } from '@/lib/index';
import { mockReviews } from '@/data/index';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Phone, MapPin, MessageCircle, Calendar, Star, Shield, Clock } from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import { motion, AnimatePresence } from 'framer-motion';

interface BarberDetailModalProps {
  barber: Barber;
  isOpen: boolean;
  onClose: () => void;
}

export function BarberDetailModal({ barber, isOpen, onClose }: BarberDetailModalProps) {
  const barberReviews = mockReviews.filter(r => r.barberId === barber.id);

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
              <DialogTitle className="text-2xl font-bold">{barber.name}</DialogTitle>
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
          <Carousel className="w-full" dir="ltr">
            <CarouselContent>
              {barber.images.map((image, index) => (
                <CarouselItem key={index}>
                  <div className="relative aspect-video rounded-lg overflow-hidden">
                    <img
                      src={image}
                      alt={`${barber.name} - صورة ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </Carousel>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={handleLocationClick}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 text-lg"
            >
              <MapPin className="w-5 h-5 ml-2" />
              عرض الموقع على الخريطة
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
                variant="outline"
                className="w-full py-6 text-lg font-semibold border-primary text-primary hover:bg-primary/10"
              >
                <MessageCircle className="w-5 h-5 ml-2" />
                شات مباشر
              </Button>
            </div>
          )}

          {barber.subscription === SubscriptionTier.DIAMOND && (
            <Button
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold py-6 text-lg"
            >
              <Calendar className="w-5 h-5 ml-2" />
              احجز موعدك الآن
            </Button>
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
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <Separator />

          <div>
            <h3 className="text-xl font-bold mb-4">أوقات العمل</h3>
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {barber.workingHours.map((schedule, index) => (
                    <div key={index} className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                      <span className="font-semibold">{schedule.day}</span>
                      <span className="text-muted-foreground" dir="ltr">
                        {schedule.open} - {schedule.close}
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