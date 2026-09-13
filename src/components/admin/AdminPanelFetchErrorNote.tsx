/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
export function AdminPanelFetchErrorNote({ message }: { message: string | null | undefined }) {
  if (!message) return null;
  return (
    <p className="rounded-lg border border-amber-700/40 bg-amber-950/30 px-3 py-2 text-sm text-amber-100">
      {message}
    </p>
  );
}
