declare module 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/+esm';

declare global {
  interface Object {
    error?: string;
    detail?: string;
    hint?: string;
    message?: string;
    reason?: string;
    code?: string;
    pending?: boolean;
    deletedPartial?: number;
    coverageNoteAr?: string;
    coverageNoteEn?: string;
    display_label?: string;
  }
}

export {};
