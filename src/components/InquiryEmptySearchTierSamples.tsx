/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { motion } from 'framer-motion';
import { BarberCard } from '@/components/BarberCards';
import { inquiryEmptySearchGoldBronzeSamples } from '@/lib/inquiryEmptySearchTierSamples';
import type { Barber } from '@/lib/index';

type Props = {
  userLocation: { lat: number; lng: number };
  onSelectBarber: (barber: Barber) => void;
};

export function InquiryEmptySearchTierSamples({ userLocation, onSelectBarber }: Props) {
  const samples = inquiryEmptySearchGoldBronzeSamples();
  if (samples.length === 0) return null;

  return (
    <div className="mt-8 space-y-8">
      {samples.map(({ barber, label }, i) => (
        <div key={barber.id} className="space-y-2">
          <p className="text-sm font-bold text-amber-200/90">{label}</p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 + i * 0.06, duration: 0.45 }}
            onClick={() => onSelectBarber(barber)}
            className="cursor-pointer"
          >
            <BarberCard barber={barber} userLocation={userLocation} />
          </motion.div>
        </div>
      ))}
    </div>
  );
}
