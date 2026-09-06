/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * معرّف بكسل سناب شات — يُضبط عبر `VITE_SNAP_PIXEL_ID` في Vercel أو يُستخدم الافتراضي المعتمد.
 */
export const SNAP_PIXEL_ID = String(
  import.meta.env.VITE_SNAP_PIXEL_ID || '6f9bc677-f2c2-44a4-b7ba-7a4117b8c534',
).trim();

export const SNAP_PIXEL_SCRIPT_SRC = 'https://sc-static.net/scevent.min.js';

export const SNAP_PIXEL_LABEL_AR = 'تتبع حملة Snapchat — خريطة الحل';
