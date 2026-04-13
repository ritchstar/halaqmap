import type { ReactNode } from 'react';
import { MessageCircle, Languages, Sparkles, User, Store } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SubscriptionTier } from '@/lib/index';
import { cn } from '@/lib/utils';

type Tier = SubscriptionTier.GOLD | SubscriptionTier.DIAMOND;

const GOLD_PERKS = [
  'شات كتابي مباشر مع الصالون من داخل حلاق ماب',
  'الاستفسار عن المواعيد والخدمات دون مغادرة التطبيق',
];

const DIAMOND_PERKS = [
  'كل مزايا الشات في الباقة الذهبية',
  'ترجمة تلقائية للرسائل بحسب لغة الكتابة (يُكتشف من أحرف النص) للعميل والحلاق معاً',
];

function Bubble({
  side,
  label,
  children,
  compact,
}: {
  side: 'customer' | 'barber';
  label: string;
  children: ReactNode;
  compact?: boolean;
}) {
  const isCustomer = side === 'customer';
  return (
    <div
      className={cn(
        'flex flex-col gap-1 max-w-[92%]',
        isCustomer ? 'items-end mr-0 ml-auto' : 'items-start mr-auto ml-0'
      )}
    >
      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
        {isCustomer ? <User className="w-3 h-3" /> : <Store className="w-3 h-3" />}
        <span>{label}</span>
      </div>
      <div
        className={cn(
          'rounded-2xl px-3 py-2 text-sm leading-relaxed text-right',
          isCustomer ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-muted text-foreground rounded-bl-md',
          compact && 'text-xs py-1.5 px-2.5'
        )}
      >
        {children}
      </div>
    </div>
  );
}

function TranslationHint({
  detectedLabel,
  translationLabel,
  translationText,
  compact,
}: {
  detectedLabel: string;
  translationLabel: string;
  translationText: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        'w-full max-w-[92%] rounded-lg border border-accent/40 bg-accent/5 px-2.5 py-2 space-y-1',
        compact ? 'text-[10px]' : 'text-xs'
      )}
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <Languages className="w-3.5 h-3.5 text-accent shrink-0" />
        <Badge variant="outline" className="text-[10px] h-5 border-accent/50 text-accent">
          {detectedLabel}
        </Badge>
      </div>
      <p className="text-muted-foreground">
        <span className="font-semibold text-foreground/80">{translationLabel}</span> {translationText}
      </p>
    </div>
  );
}

export function CustomerBarberChatPreview({
  tier,
  barberName,
  compact,
  className,
}: {
  tier: Tier;
  barberName: string;
  compact?: boolean;
  className?: string;
}) {
  const isDiamond = tier === SubscriptionTier.DIAMOND;
  const perks = isDiamond ? DIAMOND_PERKS : GOLD_PERKS;

  const body = (
    <>
      <ul className={cn('space-y-1.5 text-muted-foreground', compact ? 'text-[10px]' : 'text-xs')}>
        {perks.map((line) => (
          <li key={line} className="flex gap-2 items-start">
            <Sparkles className={cn('w-3.5 h-3.5 shrink-0 mt-0.5', isDiamond ? 'text-accent' : 'text-amber-600')} />
            <span>{line}</span>
          </li>
        ))}
      </ul>

      <div className={cn('rounded-xl border bg-background/80 overflow-hidden', compact ? 'mt-2' : 'mt-4')}>
        <div className="flex items-center justify-between gap-2 border-b bg-muted/40 px-3 py-2">
          <div className="flex items-center gap-2 min-w-0">
            <MessageCircle className="w-4 h-4 text-primary shrink-0" />
            <span className={cn('font-semibold truncate', compact ? 'text-xs' : 'text-sm')}>
              محادثة مع {barberName}
            </span>
          </div>
          <Badge variant="secondary" className={cn('shrink-0', compact && 'text-[10px] px-1.5 py-0')}>
            {isDiamond ? 'ماسي + ترجمة' : 'ذهبي'}
          </Badge>
        </div>
        <ScrollArea className={cn(compact ? 'h-[168px]' : 'h-[220px]')}>
          <div className={cn('space-y-3 p-3', compact && 'space-y-2 p-2')}>
            {!isDiamond ? (
              <>
                <Bubble side="customer" label="أنت (العميل)" compact={compact}>
                  السلام عليكم، هل عندكم موعد اليوم بعد العصر؟
                </Bubble>
                <Bubble side="barber" label={barberName} compact={compact}>
                  وعليكم السلام، نعم عندنا الساعة الخامسة — هل يناسبك؟
                </Bubble>
                <Bubble side="customer" label="أنت (العميل)" compact={compact}>
                  تمام، احجز لي وسأكون هناك إن شاء الله.
                </Bubble>
              </>
            ) : (
              <>
                <Bubble side="customer" label="أنت — كتبت بالإنجليزية" compact={compact}>
                  <span dir="ltr" className="inline-block text-left w-full">
                    Hi, do you have a slot after 6 pm?
                  </span>
                </Bubble>
                <div className="flex flex-col items-end gap-1 w-full">
                  <TranslationHint
                    compact={compact}
                    detectedLabel="النظام يكتشف: الإنجليزية"
                    translationLabel="يظهر للصالون:"
                    translationText="مرحباً، هل لديكم موعد بعد السادسة مساءً؟"
                  />
                </div>
                <Bubble side="barber" label={`${barberName} — رد بالعربية`} compact={compact}>
                  نعم، السابعة متاحة. ننتظرك.
                </Bubble>
                <div className="flex flex-col items-start gap-1 w-full">
                  <TranslationHint
                    compact={compact}
                    detectedLabel="النظام يكتشف: العربية"
                    translationLabel="يظهر للعميل:"
                    translationText="Yes, 7 pm is available. We’ll be waiting for you."
                  />
                </div>
              </>
            )}
          </div>
        </ScrollArea>
        <div className="border-t px-3 py-2 text-[10px] text-muted-foreground text-center bg-muted/20">
          عرض تجريبي لتصميم الشات — الربط الفعلي قيد التطوير
        </div>
      </div>
    </>
  );

  if (compact) {
    return (
      <div className={cn('rounded-lg border border-primary/25 bg-gradient-to-br from-primary/5 to-muted/30', className)}>
        <div className="p-2.5 space-y-2">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-primary shrink-0" />
            <span className="text-xs font-bold">معاينة الشات المباشر</span>
            {isDiamond ? (
              <Badge className="text-[10px] h-5 bg-accent text-accent-foreground mr-auto">ماسي + ترجمة</Badge>
            ) : (
              <Badge variant="secondary" className="text-[10px] h-5 mr-auto">
                ذهبي
              </Badge>
            )}
          </div>
          {body}
        </div>
      </div>
    );
  }

  return (
    <Card
      id="customer-barber-chat-preview"
      className={cn(
        'border-primary/20 bg-gradient-to-br from-primary/5 via-card to-muted/20 overflow-hidden',
        isDiamond && 'border-accent/30 from-accent/10',
        className
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex flex-wrap items-center gap-2 text-lg">
          <MessageCircle className="w-5 h-5 text-primary" />
          معاينة الشات المباشر مع الصالون
          {isDiamond ? (
            <Badge className="bg-accent text-accent-foreground gap-1">
              <Languages className="w-3 h-3" />
              باقة ماسية — ترجمة ذكية
            </Badge>
          ) : (
            <Badge variant="secondary">باقة ذهبية</Badge>
          )}
        </CardTitle>
        <CardDescription className="text-sm leading-relaxed">
          منظور العميل داخل حلاق ماب: محادثة كتابية مع الحلاق. في الباقة الماسية تُترجم الرسائل تلقائياً بحسب لغة
          الكتابة (مثل العربية أو الإنجليزية) ليصل الطرف الآخر نصاً مفهوماً له.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">{body}</CardContent>
    </Card>
  );
}
