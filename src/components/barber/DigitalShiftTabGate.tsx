import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { DigitalShiftAssistantHub } from '@/components/barber/DigitalShiftAssistantHub';
import { DigitalShiftUpgradeLocked } from '@/components/barber/DigitalShiftUpgradeLocked';
import type { BarberPlatformBannerState } from '@/lib/barberDashboardLocalState';
import type { Post } from '@/lib';
import { SubscriptionTier } from '@/lib';
import { fetchDigitalShiftSummaryRemote } from '@/lib/digitalShiftAssistantRemote';

export function DigitalShiftTabGate({
  barberId,
  barberEmail,
  subscriptionTier,
  bannerState,
  posts,
}: {
  barberId: string;
  barberEmail: string;
  subscriptionTier: SubscriptionTier;
  bannerState: BarberPlatformBannerState;
  posts: Post[];
}) {
  const isDiamond = subscriptionTier === SubscriptionTier.DIAMOND;
  const [loading, setLoading] = useState(isDiamond);
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    if (!isDiamond) {
      setLoading(false);
      setUnlocked(false);
      return;
    }

    let cancelled = false;
    void (async () => {
      setLoading(true);
      const result = await fetchDigitalShiftSummaryRemote({ barberId, email: barberEmail });
      if (cancelled) return;
      setLoading(false);
      if (result.ok) {
        setUnlocked(result.data.config?.enabled === true);
      } else {
        setUnlocked(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [barberId, barberEmail, isDiamond]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
        جاري التحقق من صلاحية المناوب الذكي…
      </div>
    );
  }

  if (!unlocked) {
    return <DigitalShiftUpgradeLocked subscriptionTier={subscriptionTier} />;
  }

  return (
    <DigitalShiftAssistantHub
      barberId={barberId}
      barberEmail={barberEmail}
      bannerState={bannerState}
      posts={posts}
    />
  );
}
