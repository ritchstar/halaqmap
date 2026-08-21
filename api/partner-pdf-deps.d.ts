/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/** تعريفات بيئية — تُكمّل @types/pdfkit عند الحاجة */
declare module 'arabic-persian-reshaper' {
  const reshaper: {
    ArabicShaper: { convertArabic(text: string): string };
    PersianShaper: { convertArabic(text: string): string };
  };
  export default reshaper;
}

declare module 'fontkit' {
  type FontkitPosition = {
    xAdvance: number;
    yAdvance: number;
    xOffset: number;
    yOffset: number;
  };
  type FontkitGlyph = {
    path: { toSVG(): string };
  };
  type FontkitFont = {
    unitsPerEm: number;
    layout(text: string): {
      glyphs: FontkitGlyph[];
      positions: FontkitPosition[];
    };
  };
  const fontkit: {
    create(buffer: Buffer | Uint8Array): FontkitFont;
  };
  export default fontkit;
}

declare module 'bidi-js' {
  interface GetEmbeddingLevelsResult {
    levels: Uint8Array;
    paragraphs: unknown;
  }
  interface BidiApi {
    getEmbeddingLevels(string: string, baseDirection: 'ltr' | 'rtl'): GetEmbeddingLevelsResult;
    getReorderedString(
      string: string,
      embedLevelsResult: GetEmbeddingLevelsResult,
      start?: number,
      end?: number
    ): string;
  }
  function bidiFactory(): BidiApi;
  export default bidiFactory;
}
