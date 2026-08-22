/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useEffect, useState } from 'react';
import {
  claimLocalGuestSeat,
  guestDeviceHash,
  readGuestInviteFromUrl,
  readGuestSeatFromUrl,
  readOrCreateGuestDeviceId,
  readOwnGuestSeatId,
  replaceGuestSeatInUrl,
  type GuestLockKind,
} from '@/lib/storeGuestDeviceLock';
import { claimEventGuestSeat } from '@/lib/storeEventLiveRemote';
import { claimWeddingGuestSeat } from '@/lib/storeWeddingLiveRemote';

export type GuestDeviceGate = {
  status: 'idle' | 'checking' | 'ok' | 'blocked';
  seatId: string;
  deviceHash: string;
};

export function useGuestDeviceGate(input: {
  kind: GuestLockKind;
  token: string;
  enabled: boolean;
  isLab: boolean;
}): GuestDeviceGate {
  const [status, setStatus] = useState<GuestDeviceGate['status']>(input.enabled ? 'checking' : 'idle');
  const [seatId, setSeatId] = useState('');
  const [deviceHash, setDeviceHash] = useState('');

  useEffect(() => {
    if (!input.enabled || !input.token) {
      setStatus('idle');
      return;
    }
    const deviceId = readOrCreateGuestDeviceId();
    const hash = guestDeviceHash(deviceId);
    setDeviceHash(hash);
    const asked = readGuestSeatFromUrl() || readOwnGuestSeatId(input.kind, input.token);
    const inviteId = readGuestInviteFromUrl();
    let cancelled = false;

    const finishOk = (id: string) => {
      if (cancelled) return;
      replaceGuestSeatInUrl(id);
      setSeatId(id);
      setStatus('ok');
    };

    if (input.isLab) {
      const result = claimLocalGuestSeat(input.kind, input.token, { seatId: asked, inviteId, deviceHash: hash });
      if (!result.ok) {
        setStatus('blocked');
        return;
      }
      finishOk(result.seatId);
      return;
    }

    const claim = input.kind === 'wedding' ? claimWeddingGuestSeat : claimEventGuestSeat;
    void claim({ token: input.token, seatId: asked, inviteId, deviceHash: hash }).then((result) => {
      if (cancelled) return;
      if (result.blocked || !result.ok || typeof result.seatId !== 'string') {
        setStatus('blocked');
        return;
      }
      claimLocalGuestSeat(input.kind, input.token, { seatId: result.seatId, inviteId, deviceHash: hash });
      finishOk(result.seatId);
    });

    return () => {
      cancelled = true;
    };
  }, [input.enabled, input.token, input.isLab, input.kind]);

  return { status, seatId, deviceHash };
}
