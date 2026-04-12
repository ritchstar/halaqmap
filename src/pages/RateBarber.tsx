import { useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, CheckCircle2, AlertTriangle, Home } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ROUTE_PATHS } from '@/lib/index';
import { mockBarbers } from '@/data/index';
import { validateRatingInviteToken } from '@/lib/ratingInvite';
import { appendQrReview, type StoredQrReview } from '@/lib/qrReviewsStorage';
import { RATING_QR_CUSTOMER_HINT } from '@/config/ratingQrInvite';
import { toast } from 'sonner';

export default function RateBarber() {
  const { barberId } = useParams<{ barberId: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('t');

  const barber = useMemo(
    () => mockBarbers.find((b) => b.id === barberId),
    [barberId],
  );

  const valid = barber && validateRatingInviteToken(barber, token);

  const [customerName, setCustomerName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barber || !valid) return;
    const name = customerName.trim();
    if (name.length < 2) {
      toast.error('يرجى إدخال الاسم (حرفان على الأقل).');
      return;
    }
    setBusy(true);
    const id = `qr-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const row: StoredQrReview = {
      id,
      barberId: barber.id,
      customerName: name,
      rating,
      comment: comment.trim(),
      date: new Date().toISOString().slice(0, 10),
      verified: true,
      viaQrInvite: true,
      isPublished: true,
      isHighlighted: false,
    };
    appendQrReview(row);
    setSubmitted(true);
    setBusy(false);
    toast.success('شكراً لتقييمك!');
  };

  return (
    <Layout>
      <div className="min-h-[70vh] bg-background py-12 px-4" dir="rtl">
        <motion.div
          className="container mx-auto max-w-lg"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {!barberId || !barber ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="w-5 h-5" />
                  رابط غير صالح
                </CardTitle>
                <CardDescription>لم يُعثر على هذا الصالون.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="gap-2">
                  <Link to={ROUTE_PATHS.HOME}>
                    <Home className="w-4 h-4" />
                    العودة للرئيسية
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : !valid ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="w-5 h-5" />
                  رمز الدعوة غير صحيح أو منتهٍ
                </CardTitle>
                <CardDescription>
                  استخدم الرمز الظاهر على ملصق QR في الصالون، أو اطلب من الحلاق رابط التقييم المحدّث.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="gap-2">
                  <Link to={ROUTE_PATHS.HOME}>
                    <Home className="w-4 h-4" />
                    العودة للرئيسية
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : submitted ? (
            <Card className="border-primary/40">
              <CardHeader className="text-center">
                <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <CardTitle>تم إرسال تقييمك</CardTitle>
                <CardDescription>
                  شكراً لك! يمكن للصالون إدارة ظهور التقييمات وإبرازها من لوحة التحكم.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Button asChild>
                  <Link to={ROUTE_PATHS.HOME}>العودة لحلاق ماب</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>تقييم {barber.name}</CardTitle>
                <CardDescription className="space-y-2 pt-1">
                  <span className="block">تقييم عبر رمز QR — يُسجَّل كزيارة مرتبطة بدعوتك الرسمية.</span>
                  <span className="block text-xs text-muted-foreground">{RATING_QR_CUSTOMER_HINT}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="nm">اسمك أو اسمك المستعار</Label>
                    <Input
                      id="nm"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="مثال: أحمد"
                      required
                      minLength={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>التقييم</Label>
                    <div className="flex flex-row-reverse justify-end gap-1">
                      {[5, 4, 3, 2, 1].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setRating(n)}
                          className="p-1 rounded-md hover:bg-muted transition-colors"
                          aria-label={`${n} من 5`}
                        >
                          <Star
                            className={`w-9 h-9 ${
                              n <= rating ? 'fill-amber-400 text-amber-500' : 'text-muted-foreground/35'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cm">تعليق (اختياري)</Label>
                    <Textarea
                      id="cm"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={4}
                      placeholder="كيف كانت تجربتك؟"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={busy}>
                    إرسال التقييم
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}
