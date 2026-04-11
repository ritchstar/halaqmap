import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Building2,
  Upload,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Loader2,
  ArrowRight,
  Shield,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ROUTE_PATHS, SubscriptionTier } from '@/lib';
import { IMAGES } from '@/assets/images';

export default function Payment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tier = searchParams.get('tier') as SubscriptionTier || SubscriptionTier.BRONZE;
  const requestId = searchParams.get('requestId') || 'REQ-' + Date.now();

  const [paymentMethod, setPaymentMethod] = useState<'moyasar' | 'card' | 'bank_transfer'>('moyasar');
  const [isProcessing, setIsProcessing] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [ibanCopied, setIbanCopied] = useState(false);

  // Subscription prices
  const prices = {
    [SubscriptionTier.BRONZE]: 100,
    [SubscriptionTier.GOLD]: 150,
    [SubscriptionTier.DIAMOND]: 200,
  };

  const tierNames = {
    [SubscriptionTier.BRONZE]: 'برونزي',
    [SubscriptionTier.GOLD]: 'ذهبي',
    [SubscriptionTier.DIAMOND]: 'ماسي',
  };

  const tierColors = {
    [SubscriptionTier.BRONZE]: 'from-amber-700 to-amber-900',
    [SubscriptionTier.GOLD]: 'from-accent to-yellow-600',
    [SubscriptionTier.DIAMOND]: 'from-primary to-cyan-600',
  };

  const price = prices[tier];
  const tierName = tierNames[tier];
  const tierColor = tierColors[tier];

  // Bank details
  const IBAN = 'SA5430400108037273420021';
  const BANK_NAME = 'البنك العربي الوطني';
  const ACCOUNT_NAME = 'حلاق ماب';

  const handleCopyIban = () => {
    navigator.clipboard.writeText(IBAN);
    setIbanCopied(true);
    setTimeout(() => setIbanCopied(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReceiptFile(e.target.files[0]);
    }
  };

  const handlePayment = async () => {
    setIsProcessing(true);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    if (paymentMethod === 'moyasar') {
      // TODO: Integrate with Moyasar API
      alert('سيتم توجيهك إلى بوابة ميسر للدفع...');
    } else if (paymentMethod === 'card') {
      // TODO: Integrate with card payment gateway
      alert('سيتم توجيهك إلى بوابة الدفع الإلكتروني...');
    } else if (paymentMethod === 'bank_transfer') {
      if (!receiptFile) {
        alert('يرجى رفع إيصال التحويل البنكي');
        setIsProcessing(false);
        return;
      }
      alert('تم إرسال إيصال التحويل بنجاح! سيتم مراجعته خلال 24 ساعة.');
    }

    setIsProcessing(false);
    // Navigate to success page or dashboard
    navigate(ROUTE_PATHS.BARBER_DASHBOARD);
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background py-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(13,148,136,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(212,175,55,0.1),transparent_50%)]" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="container mx-auto px-4 relative z-10"
        >
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 mb-6"
            >
              <CreditCard className="w-10 h-10 text-primary" />
            </motion.div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4">إتمام الدفع</h1>
            <p className="text-lg text-muted-foreground">
              اختر طريقة الدفع المناسبة لإتمام اشتراكك
            </p>
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Payment Methods */}
            <div className="lg:col-span-2 space-y-6">
              {/* Subscription Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>ملخص الاشتراك</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${tierColor} flex items-center justify-center text-white font-bold`}>
                        {tierName === 'برونزي' && '🥉'}
                        {tierName === 'ذهبي' && '🥇'}
                        {tierName === 'ماسي' && '💎'}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">باقة {tierName}</h3>
                        <p className="text-sm text-muted-foreground">اشتراك شهري</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-2xl font-bold text-primary">{price} ر.س</p>
                      <p className="text-xs text-muted-foreground">شهرياً</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Methods */}
              <Card>
                <CardHeader>
                  <CardTitle>اختر طريقة الدفع</CardTitle>
                  <CardDescription>جميع المعاملات آمنة ومشفرة</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                    {/* Moyasar */}
                    <label
                      className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        paymentMethod === 'moyasar'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <RadioGroupItem value="moyasar" id="moyasar" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CreditCard className="w-5 h-5 text-primary" />
                          <h3 className="font-semibold">ميسر (Moyasar)</h3>
                          <Badge variant="secondary" className="text-xs">موصى به</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          بوابة دفع سعودية آمنة - دعم جميع البطاقات (مدى، فيزا، ماستركارد)
                        </p>
                        <div className="flex gap-2 mt-2">
                          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Mastercard_2019_logo.svg/200px-Mastercard_2019_logo.svg.png" alt="Mastercard" className="h-6" />
                          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/200px-Visa_Inc._logo.svg.png" alt="Visa" className="h-6" />
                          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Mada_Logo.svg/200px-Mada_Logo.svg.png" alt="Mada" className="h-6" />
                        </div>
                      </div>
                    </label>

                    {/* Credit/Debit Card */}
                    <label
                      className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        paymentMethod === 'card'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <RadioGroupItem value="card" id="card" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CreditCard className="w-5 h-5 text-primary" />
                          <h3 className="font-semibold">بطاقة ائتمانية / مدى</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          ادفع باستخدام بطاقتك الائتمانية أو بطاقة مدى
                        </p>
                      </div>
                    </label>

                    {/* Bank Transfer */}
                    <label
                      className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        paymentMethod === 'bank_transfer'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Building2 className="w-5 h-5 text-primary" />
                          <h3 className="font-semibold">تحويل بنكي</h3>
                          <Badge variant="outline" className="text-xs">6 أشهر مقدماً</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          حوّل المبلغ إلى حسابنا البنكي وارفع الإيصال
                        </p>
                      </div>
                    </label>
                  </RadioGroup>

                  {/* Bank Transfer Details */}
                  {paymentMethod === 'bank_transfer' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 pt-4"
                    >
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>ملاحظة:</strong> التحويل البنكي يتطلب دفع 6 أشهر مقدماً ({price * 6} ر.س)
                        </AlertDescription>
                      </Alert>

                      <Card className="bg-muted/50">
                        <CardHeader>
                          <CardTitle className="text-lg">معلومات الحساب البنكي</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <Label className="text-sm text-muted-foreground">اسم البنك</Label>
                            <p className="text-base font-semibold">{BANK_NAME}</p>
                          </div>
                          <div>
                            <Label className="text-sm text-muted-foreground">اسم الحساب</Label>
                            <p className="text-base font-semibold">{ACCOUNT_NAME}</p>
                          </div>
                          <div>
                            <Label className="text-sm text-muted-foreground">رقم الآيبان (IBAN)</Label>
                            <div className="flex items-center gap-2 mt-1">
                              <Input
                                value={IBAN}
                                readOnly
                                dir="ltr"
                                className="font-mono text-base"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={handleCopyIban}
                                className="flex-shrink-0"
                              >
                                {ibanCopied ? (
                                  <Check className="w-4 h-4 text-green-600" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                            {ibanCopied && (
                              <p className="text-xs text-green-600 mt-1">تم النسخ!</p>
                            )}
                          </div>
                          <div>
                            <Label className="text-sm text-muted-foreground">المبلغ المطلوب</Label>
                            <p className="text-2xl font-bold text-primary">{price * 6} ر.س</p>
                            <p className="text-xs text-muted-foreground">لمدة 6 أشهر</p>
                          </div>
                        </CardContent>
                      </Card>

                      <div className="space-y-2">
                        <Label htmlFor="receipt">رفع إيصال التحويل *</Label>
                        <div
                          onClick={() => document.getElementById('receipt')?.click()}
                          className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
                        >
                          <input
                            id="receipt"
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                              <Upload className="w-6 h-6 text-primary" />
                            </div>
                            {receiptFile ? (
                              <div className="flex items-center gap-2 text-green-600">
                                <CheckCircle2 className="w-5 h-5" />
                                <span className="font-medium">{receiptFile.name}</span>
                              </div>
                            ) : (
                              <>
                                <p className="text-sm font-medium">اضغط لرفع إيصال التحويل</p>
                                <p className="text-xs text-muted-foreground">
                                  PNG, JPG, PDF حتى 10MB
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>

              {/* Payment Button */}
              <Button
                onClick={handlePayment}
                disabled={isProcessing || (paymentMethod === 'bank_transfer' && !receiptFile)}
                className="w-full h-14 text-lg font-semibold"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                    جاري المعالجة...
                  </>
                ) : (
                  <>
                    {paymentMethod === 'bank_transfer' ? 'إرسال الإيصال' : 'متابعة الدفع'}
                    <ArrowRight className="w-5 h-5 mr-2" />
                  </>
                )}
              </Button>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Security Badge */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">دفع آمن ومشفر</h3>
                      <p className="text-sm text-muted-foreground">
                        جميع المعاملات محمية بتشفير SSL 256-bit
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Lock className="w-4 h-4" />
                    <span>معلوماتك محمية بالكامل</span>
                  </div>
                </CardContent>
              </Card>

              {/* Support */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-3">هل تحتاج مساعدة؟</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    فريق الدعم متاح للإجابة على استفساراتك
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">📧</span>
                      <span dir="ltr">admin@halaqmap.com</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">📱</span>
                      <span dir="ltr">0559602685</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Info */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-3">معلومات الدفع</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>تجديد تلقائي شهرياً</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>إمكانية الإلغاء في أي وقت</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>فاتورة رسمية بعد كل دفعة</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>دعم فني على مدار الساعة</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
