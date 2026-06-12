const CHILDREN_LABELS = new Set(['حلاقة أطفال', 'أطفال', 'حلاق أطفال', 'صالون أطفال']);

function acceptsChildrenFromSpecialties(raw: unknown): boolean {
  if (!Array.isArray(raw)) return false;
  return raw.some((item) => CHILDREN_LABELS.has(String(item ?? '').trim()));
}

export type ChildrenServicesBarberSnapshot = {
  acceptsChildren: boolean;
  childrenSpecialist: boolean;
};

export function buildChildrenServicesSnapshotFromBarberRow(row: {
  specialties?: unknown;
  children_specialist?: boolean | null;
}): ChildrenServicesBarberSnapshot {
  const acceptsChildren = acceptsChildrenFromSpecialties(row.specialties);
  const childrenSpecialist = row.children_specialist === true && acceptsChildren;
  return {
    acceptsChildren,
    childrenSpecialist,
  };
}
