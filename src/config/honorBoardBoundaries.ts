/**
 * Honor Board (Breathing Manifesto) — B2B-only boundary enforcement.
 * Must never render on consumer map/search surfaces (Home, public search).
 */
export type HonorBoardContext = 'admin' | 'register' | 'legal';

export const HONOR_BOARD_B2B_CONTEXTS: readonly HonorBoardContext[] = ['admin', 'register', 'legal'] as const;

export const HONOR_BOARD_FORBIDDEN_ROUTE_PREFIXES = [
  '/',
  '/search',
  '/map',
] as const;

export function assertHonorBoardB2BContext(context: HonorBoardContext): void {
  if (!HONOR_BOARD_B2B_CONTEXTS.includes(context)) {
    throw new Error(
      `HonorBoard is B2B-only. Allowed contexts: ${HONOR_BOARD_B2B_CONTEXTS.join(', ')}. Received: ${context}`,
    );
  }
}
