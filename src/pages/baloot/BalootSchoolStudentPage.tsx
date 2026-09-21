/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * الصفحة الخاصة الدائمة لطالب مدرسة البلوت — غير عامة وغير مفهرسة (noindex).
 * لا تُفتح إلا لتسجيل بحالة 'paid' فعلياً (تحقق حي عبر /api/baloot-school-pay
 * بنفس نمط فحص الحالة في BalootSchoolPayPage.tsx — لا نجاح وهمي على الواجهة).
 *
 * المنهج الأساسي هنا (القواعد، ترتيب الورق، الحسبة) مبني بالكامل على محرك
 * قواعد بلوت الثابت `balootEngine.ts` — نفس الثوابت والدوال المستخدمة فعلياً
 * في ساحة اللعب المجانية، فلا يوجد مصدر أرقام مختلف أو مُخترع هنا. الحاسبة
 * التفاعلية أدناه (اختيار بذلة الحكم) تُعيد حساب ترتيب وقيم الـ٣٢ ورقة حياً
 * عبر `cardStrengthIndex` و`cardValue` الحقيقيتين من المحرك.
 *
 * حدود مقصودة (Sky's report guardrails): لا وعود احتراف أو فوز مضمون، ولا
 * مباريات عامة أو جوائز أو رهانات في هذه المرحلة — شرح القرار فقط.
 */
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertTriangle, BookOpen, Calculator, Crown, Layers, Loader2, Megaphone, ShieldCheck, Target } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BalootSchoolMotifBackground } from '@/components/baloot/BalootSchoolMotifBackground';
import { BalootCardFace } from '@/components/baloot/BalootCardFace';
import { BALOOT_SUIT_LABELS_AR, BALOOT_SUIT_SYMBOLS } from '@/config/balootArena';
import { ROUTE_PATHS } from '@/lib';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { fetchBalootSchoolPay } from '@/lib/balootSchoolPayRemote';
import {
  BALOOT_BALOOT_BONUS_POINTS,
  BALOOT_HAND_CARD_POINTS_TOTAL,
  BALOOT_KABOOT_BONUS_POINTS,
  BALOOT_SIRA_BONUS_BY_LENGTH,
  BALOOT_SIRA_BONUS_FIVE_PLUS,
  BALOOT_SUITS,
  buildBalootDeck,
  cardStrengthIndex,
  cardValue,
  type BalootSuit,
} from '@/lib/balootEngine';

const GLOSSARY = [
  { termAr: 'حكم', bodyAr: 'البذلة التي يُعلنها فريق المزايدة لتكون هي الأقوى طوال الشوط — ترتيبها يختلف عن باقي البذل.' },
  { termAr: 'صن', bodyAr: 'نمط لعب بلا بذلة حكم إطلاقاً — كل البذل الأربع تُحسب بقيم البذلة العادية، ويفوز أعلى ورقة من البذلة المفتوحة فقط. متاح الآن في ساحة اللعب كبديل عن الحكم أثناء المزايدة.' },
  { termAr: 'دبل / ريدبل', bodyAr: 'دبلة ×٢ من فريق الدفاع بعد تحديد الحكم أو الصن مباشرة، ثم ريدبل ×٤ اختياري من فريق المزايدة — تُضاعف رهان الشوط بالكامل. متاحة الآن في ساحة اللعب.' },
  { termAr: 'سرى', bodyAr: 'ثلاث أوراق متتالية فأكثر من نفس البذلة بالترتيب الطبيعي (٧-٨-٩-١٠-جاك-كوز-شايب-آص) في يد لاعب واحد. الأقوى فقط على الطاولة يُحتسب.' },
  { termAr: 'بلوت', bodyAr: 'امتلاك شايب وكوز بذلة الحكم معاً في نفس اليد — مكافأة إضافية تُكتشف تلقائياً.' },
  { termAr: 'كبّوت', bodyAr: 'فوز فريق واحد بكل الأشواط الفرعية الثمانية في نفس الشوط — مكافأة إضافية.' },
  { termAr: 'كبس', bodyAr: 'فريق المزايدة لم يحقق نقاطاً أكثر من الخصم في الشوط — يخسر شوطه بالكامل، ويأخذ الخصم كل نقاط الشوط.' },
  { termAr: 'الشوط الفرعي (الأكلة)', bodyAr: 'دورة واحدة يلعب فيها الأربعة ورقة واحدة لكل منهم — ٨ أشواط فرعية تُكوّن الشوط الكامل.' },
];

function useNoIndex() {
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'robots');
    meta.setAttribute('content', 'noindex, nofollow');
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);
}

/** بطاقة ترتيب ونقاط بذلة واحدة — تُعاد حسابها حياً بحسب بذلة الحكم المختارة (المحرك الحقيقي، لا جدول ثابت). */
function SuitRankingColumn({ suit, trumpSuit }: { suit: BalootSuit; trumpSuit: BalootSuit }) {
  const isTrump = suit === trumpSuit;
  const cards = useMemo(
    () =>
      buildBalootDeck()
        .filter((c) => c.suit === suit)
        .sort((a, b) => cardStrengthIndex(a, trumpSuit) - cardStrengthIndex(b, trumpSuit)),
    [suit, trumpSuit],
  );
  const suitTotal = useMemo(() => cards.reduce((sum, c) => sum + cardValue(c, trumpSuit), 0), [cards, trumpSuit]);

  return (
    <div className={`rounded-xl border p-3 ${isTrump ? 'border-primary bg-primary/5' : 'border-border'}`}>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-bold">
          {BALOOT_SUIT_SYMBOLS[suit]} {BALOOT_SUIT_LABELS_AR[suit]}
        </span>
        {isTrump ? <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-bold text-primary">الحكم</span> : null}
      </div>
      <p className="mb-2 text-[11px] text-muted-foreground">من الأضعف (يمين) للأقوى (يسار) — مجموع البذلة: {suitTotal} نقطة</p>
      <div className="flex flex-row-reverse flex-wrap gap-1.5">
        {cards.map((card) => (
          <div key={card.id} className="flex flex-col items-center gap-1">
            <BalootCardFace card={card} trumpSuit={trumpSuit} size="sm" />
            <span className="text-[11px] font-bold text-muted-foreground">{cardValue(card, trumpSuit)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BalootSchoolStudentPage() {
  useDocumentTitle('صفحتي — مدرسة البلوت');
  useNoIndex();
  const { rid = '' } = useParams<{ rid: string }>();
  const [status, setStatus] = useState<'loading' | 'paid' | 'not_paid' | 'missing'>('loading');
  const [fullName, setFullName] = useState('');
  const [trumpSuit, setTrumpSuit] = useState<BalootSuit>('hearts');

  useEffect(() => {
    let cancelled = false;
    void fetchBalootSchoolPay(rid).then((result) => {
      if (cancelled) return;
      if (!result.ok) {
        setStatus('missing');
        return;
      }
      const s = String(result.status || '');
      setFullName(String(result.fullName || ''));
      setStatus(s === 'paid' ? 'paid' : 'not_paid');
    });
    return () => {
      cancelled = true;
    };
  }, [rid]);

  if (status === 'loading') {
    return (
      <div dir="rtl" className="flex min-h-screen items-center justify-center gap-2 bg-background text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        جاري التحقق من اشتراكك…
      </div>
    );
  }

  if (status !== 'paid') {
    return (
      <div dir="rtl" className="relative min-h-screen overflow-hidden bg-background">
        <BalootSchoolMotifBackground />
        <div className="relative z-10 container mx-auto max-w-xl px-4 py-16">
          <Alert variant={status === 'missing' ? 'destructive' : 'default'}>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{status === 'missing' ? 'الرابط غير صالح' : 'الاشتراك غير مفعّل بعد'}</AlertTitle>
            <AlertDescription className="space-y-3 text-sm leading-relaxed">
              <p>
                {status === 'missing'
                  ? 'لم نعثر على هذا التسجيل.'
                  : 'هذه الصفحة خاصة بطلاب مدرسة البلوت بعد إتمام الدفع فقط. أكمل الدفع أولاً للوصول إليها.'}
              </p>
              <div className="flex flex-wrap gap-2">
                {status === 'not_paid' && rid ? (
                  <Button asChild>
                    <Link to={ROUTE_PATHS.BALOOT_SCHOOL_PAY.replace(':rid', encodeURIComponent(rid))}>إتمام الدفع</Link>
                  </Button>
                ) : null}
                <Button asChild variant="outline">
                  <Link to={ROUTE_PATHS.BALOOT_SCHOOL_LANDING}>العودة لصفحة مدرسة البلوت</Link>
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="relative min-h-screen overflow-hidden bg-background">
      <BalootSchoolMotifBackground />
      <div className="relative z-10 container mx-auto max-w-5xl space-y-10 px-4 py-12">
        <div className="text-center">
          <div className="mx-auto mb-3 flex items-center justify-center gap-2 text-primary">
            <Crown className="h-6 w-6" />
            <span className="text-sm font-bold">مدرسة البلوت — صفحتي الخاصة</span>
          </div>
          <h1 className="text-2xl font-extrabold text-foreground md:text-3xl">
            {fullName ? `أهلاً بك، ${fullName}` : 'أهلاً بك في صفحتك الخاصة'}
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            هذه الصفحة خاصة بك وغير مفهرسة أو عامة. المحتوى أدناه يشرح القرار ولا يَعِد بفوز مضمون — لا مباريات عامة
            أو جوائز أو رهانات في هذه المرحلة.
          </p>
        </div>

        {/* القواعد الأساسية */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5 text-primary" /> القواعد الأساسية (حكم)
            </CardTitle>
            <CardDescription>نفس قواعد ساحة اللعب المجانية — هنا الشرح، وهناك التطبيق الفعلي.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
            <p>
              يلعب البلوت أربعة لاعبين في فريقين ثابتين (كل لاعب مقابل الجالس أمامه شريك له)، بأوراق ٣٢ ورقة (من ٧
              إلى آص، بلا ٢ حتى ٦). توزَّع ٨ أوراق لكل لاعب، ثم تبدأ المزايدة: يعلن أحد اللاعبين بذلة لتكون «الحكم»
              (الأقوى طوال الشوط)، أو يمرر الدور لمن يليه. إن مرّر الجميع يُجبر الموزّع على إعلان بذلة من أقوى بذلة
              في يده.
            </p>
            <p>
              بعد تحديد الحكم يبدأ اللعب: ٨ أشواط فرعية («أكلات») يلعب في كل منها الأربعة ورقة واحدة بالدور. من
              يملك بذلة الشوط المفتوح يجب أن يلحق بها إن استطاع؛ من لا يملكها حرّ في اللعب بأي ورقة (تشمل الحكم).
              يفوز بالشوط الفرعي أعلى ورقة حكم إن لُعبت، وإلا أعلى ورقة من البذلة المفتوحة.
            </p>
            <p>
              بعد اكتمال الأشواط الفرعية الثمانية تُحسب نقاط الشوط الكامل (انظر «الحسبة» أدناه)، وتُضاف لنقاط
              الفريقين التراكمية حتى يصل أحدهما لهدف المباراة (١٥٢ نقطة في ساحة اللعب الحالية).
            </p>
          </CardContent>
        </Card>

        {/* ترتيب الورق والحسبة التفاعلية */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calculator className="h-5 w-5 text-primary" /> ترتيب الورق والحسبة
            </CardTitle>
            <CardDescription>
              اختر بذلة الحكم لترى ترتيب كل الأوراق ونقاطها فوراً — نفس القيم الحقيقية من محرك ساحة اللعب، لا جدول
              منفصل.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {BALOOT_SUITS.map((suit) => (
                <Button
                  key={suit}
                  type="button"
                  size="sm"
                  variant={trumpSuit === suit ? 'default' : 'outline'}
                  onClick={() => setTrumpSuit(suit)}
                >
                  {BALOOT_SUIT_SYMBOLS[suit]} {BALOOT_SUIT_LABELS_AR[suit]}
                </Button>
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {BALOOT_SUITS.map((suit) => (
                <SuitRankingColumn key={suit} suit={suit} trumpSuit={trumpSuit} />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              مجموع نقاط الشوط الثابتة دائماً {BALOOT_HAND_CARD_POINTS_TOTAL} نقطة (٦٢ لبذلة الحكم + ٣٠ لكل بذلة من
              البذل الثلاث الأخرى) — قبل إضافة أي مكافآت.
            </p>
          </CardContent>
        </Card>

        {/* المكافآت وقاعدة الكبس */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Megaphone className="h-5 w-5 text-primary" /> المكافآت وقاعدة الكبس
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm leading-relaxed text-muted-foreground sm:grid-cols-2">
            <div className="rounded-xl border border-border p-3">
              <p className="mb-1 font-bold text-foreground">سرى</p>
              <p>
                ثلاث أوراق متتالية فأكثر من نفس البذلة بالترتيب الطبيعي: ٣ أوراق = {BALOOT_SIRA_BONUS_BY_LENGTH[3]}{' '}
                نقطة، ٤ أوراق = {BALOOT_SIRA_BONUS_BY_LENGTH[4]} نقطة، ٥ أوراق فأكثر = {BALOOT_SIRA_BONUS_FIVE_PLUS}{' '}
                نقطة. الأقوى فقط على الطاولة كلها يُحتسب — الباقي صفر.
              </p>
            </div>
            <div className="rounded-xl border border-border p-3">
              <p className="mb-1 font-bold text-foreground">بلوت</p>
              <p>امتلاك شايب وكوز بذلة الحكم معاً في نفس اليد = {BALOOT_BALOOT_BONUS_POINTS} نقطة إضافية، تُكتشف تلقائياً.</p>
            </div>
            <div className="rounded-xl border border-border p-3">
              <p className="mb-1 font-bold text-foreground">كبّوت</p>
              <p>فوز فريق واحد بكل الأشواط الفرعية الثمانية = {BALOOT_KABOOT_BONUS_POINTS} نقاط إضافية.</p>
            </div>
            <div className="rounded-xl border border-border p-3">
              <p className="mb-1 font-bold text-foreground">كبس</p>
              <p>
                إن لم يحقق فريق المزايدة نقاطاً أكثر من الخصم في الشوط (بعد المكافآت)، يخسر شوطه بالكامل ويأخذ الخصم
                كل نقاط الشوط مجتمعة. هذا اصطلاح شائع منشور، وقد يختلف قليلاً بين تجمّعات اللاعبين — راجعه مقابل قواعدكم
                الخاصة إن كنتم تلعبون بنظام منزلي مختلف.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* قرارات المزايدة واللعب */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5 text-primary" /> قرارات المزايدة واللعب
            </CardTitle>
            <CardDescription>شرح القرار ومنطقه — لا وعود بفوز مضمون.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
            <p>
              <strong className="text-foreground">متى تُعلن الحكم:</strong> قوة يدك تُقاس بمجموع قيم أوراقك في تلك
              البذلة لو صارت حكماً (الجاك = ٢٠، التسعة = ١٤، الآص = ١١، العشرة = ١٠...) مضافاً إليها طول البذلة نفسها
              — بذلة طويلة بأوراق متوسطة قد تستحق الإعلان أكثر من بذلة قصيرة بورقة قوية واحدة، لأن الطول يمنحك تحكماً
              في الشوط الفرعي عبر عدة أدوار.
            </p>
            <p>
              <strong className="text-foreground">القيادة في بداية الشوط الفرعي:</strong> غالباً تُفضَّل القيادة بورقة
              غير حكم أولاً، للحفاظ على أوراق الحكم لحظة الحاجة الحاسمة لاحقاً في الشوط.
            </p>
            <p>
              <strong className="text-foreground">اللحاق بالبذلة المفتوحة:</strong> إن كان شريكك متصدراً الشوط
              الفرعي فلا داعي للمبالغة بورقة قوية؛ اكتفِ بأضعف ورقة. إن كان الخصم متصدراً وتستطيع الفوز، افعل ذلك
              بأرخص ورقة كافية بدل إهدار ورقة أقوى بلا داعٍ.
            </p>
            <p>
              <strong className="text-foreground">عند العجز عن اللحاق:</strong> إن كان شريكك متصدراً، تخلّص من أضعف
              ورقة غير حكم لديك. إن كان الخصم متصدراً وتملك حكماً، فكّر في الحكم بأرخص ورقة كافية للفوز بدل إهدار
              ورقة حكم قوية.
            </p>
          </CardContent>
        </Card>

        {/* قاموس المصطلحات */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Layers className="h-5 w-5 text-primary" /> قاموس مصطلحات البلوت
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {GLOSSARY.map((item) => (
              <div key={item.termAr} className="rounded-xl border border-border p-3">
                <p className="mb-1 text-sm font-bold text-foreground">{item.termAr}</p>
                <p className="text-xs leading-relaxed text-muted-foreground">{item.bodyAr}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Alert>
          <ShieldCheck className="h-4 w-4" />
          <AlertTitle>محتوى يتوسّع تدريجياً</AlertTitle>
          <AlertDescription className="text-sm leading-relaxed">
            هذا المنهج الأساسي (القواعد، ترتيب الورق، الحسبة) هو بداية مدرسة البلوت. مواقف تدريبية وشرح بالذكاء
            الاصطناعي (لشرح القرار، لا لاختراع قواعد أو وعد بـ«أفضل حركة» دائماً) مراحل قادمة على نفس هذا الأساس
            الثابت.
          </AlertDescription>
        </Alert>

        <div className="flex flex-wrap justify-center gap-3 pb-6">
          <Button asChild variant="outline">
            <Link to={ROUTE_PATHS.BALOOT_ARENA}>جرّب ساحة بلوت المجانية</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link to={ROUTE_PATHS.BALOOT_SCHOOL_LANDING}>صفحة مدرسة البلوت</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
