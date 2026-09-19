/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * يد اللاعب — صف أوراق قابلة للنقر، مع تعطيل أي ورقة غير قانونية حالياً
 * (لا تلحق بالبذلة المفتوحة رغم توفر بديل منها في اليد).
 */
import { BalootCardFace } from '@/components/baloot/BalootCardFace';
import { BALOOT_NATURAL_RANK_ORDER, type BalootCard, type BalootSuit } from '@/lib/balootEngine';

type BalootHandFanProps = {
  cards: readonly BalootCard[];
  legalCardIds: ReadonlySet<string>;
  trumpSuit: BalootSuit | null;
  onPlayCard: (cardId: string) => void;
  interactive: boolean;
};

/** ترتيب عرض ثابت: تجميع حسب البذلة ثم الرتبة الطبيعية — يمنع «قفز» الأوراق بصرياً بين الأدوار. */
function sortForDisplay(cards: readonly BalootCard[]): BalootCard[] {
  const suitOrder: BalootSuit[] = ['spades', 'hearts', 'clubs', 'diamonds'];
  return cards.slice().sort((a, b) => {
    if (a.suit !== b.suit) return suitOrder.indexOf(a.suit) - suitOrder.indexOf(b.suit);
    return BALOOT_NATURAL_RANK_ORDER.indexOf(a.rank) - BALOOT_NATURAL_RANK_ORDER.indexOf(b.rank);
  });
}

export function BalootHandFan({ cards, legalCardIds, trumpSuit, onPlayCard, interactive }: BalootHandFanProps) {
  const ordered = sortForDisplay(cards);
  return (
    <div className="flex flex-wrap items-end justify-center gap-2 py-2">
      {ordered.map((card) => {
        const isLegal = legalCardIds.has(card.id);
        return (
          <BalootCardFace
            key={card.id}
            card={card}
            trumpSuit={trumpSuit}
            size="lg"
            disabled={!interactive || !isLegal}
            onClick={interactive && isLegal ? () => onPlayCard(card.id) : undefined}
          />
        );
      })}
    </div>
  );
}
