/** متخصص أطفال — ماسي فقط (مرآة لـ src/config/childrenSpecialistPolicy.ts). */

export function canEnableChildrenSpecialistTier(tier: string | null | undefined): boolean {
  return String(tier ?? '').trim().toLowerCase() === 'diamond';
}

export function resolveChildrenSpecialistFlag(input: {
  requested: boolean;
  acceptsChildren: boolean;
  tier: string | null | undefined;
}): boolean {
  if (!input.requested || !input.acceptsChildren) return false;
  return canEnableChildrenSpecialistTier(input.tier);
}
