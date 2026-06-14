export type GroomPrepBarberSnapshot = {
  offered: boolean;
  priceSar: number | null;
  publicVisible: boolean;
  customerNote: string | null;
};

export function buildGroomPrepSnapshotFromBarberRow(row: {
  groom_prep_offered?: boolean | null;
  groom_prep_price_sar?: unknown;
  groom_prep_public_visible?: boolean | null;
  groom_prep_customer_note?: string | null;
}): GroomPrepBarberSnapshot {
  const rawPrice = row.groom_prep_price_sar;
  const p = rawPrice != null && rawPrice !== '' ? Number(rawPrice) : NaN;
  return {
    offered: row.groom_prep_offered === true,
    priceSar: Number.isFinite(p) && p > 0 ? Math.round(p * 100) / 100 : null,
    publicVisible: row.groom_prep_public_visible !== false,
    customerNote:
      row.groom_prep_customer_note != null ? String(row.groom_prep_customer_note) : null,
  };
}
