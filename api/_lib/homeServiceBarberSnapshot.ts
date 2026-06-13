export type HomeServiceBarberSnapshot = {
  offered: boolean;
  priceSar: number | null;
  radiusKm: number | null;
  publicVisible: boolean;
  customerNote: string | null;
};

export function buildHomeServiceSnapshotFromBarberRow(row: {
  home_service_offered?: boolean | null;
  home_service_price_sar?: unknown;
  home_service_radius_km?: unknown;
  home_service_public_visible?: boolean | null;
  home_service_customer_note?: string | null;
}): HomeServiceBarberSnapshot {
  const rawPrice = row.home_service_price_sar;
  const p = rawPrice != null && rawPrice !== '' ? Number(rawPrice) : NaN;
  const rawRadius = row.home_service_radius_km;
  const r = rawRadius != null && rawRadius !== '' ? Number(rawRadius) : NaN;
  return {
    offered: row.home_service_offered === true,
    priceSar: Number.isFinite(p) && p > 0 ? Math.round(p * 100) / 100 : null,
    radiusKm: Number.isFinite(r) && r > 0 ? Math.floor(r) : null,
    publicVisible: row.home_service_public_visible !== false,
    customerNote:
      row.home_service_customer_note != null ? String(row.home_service_customer_note) : null,
  };
}
