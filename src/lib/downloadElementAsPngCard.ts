/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import html2canvas from 'html2canvas';

/**
 * يلتقط عنصر HTML (شهادة/كرت) ويُنزّله كصورة PNG عالية الدقة للاحتفاظ بها.
 */
export async function downloadElementAsPngCard(
  element: HTMLElement,
  fileName: string,
): Promise<void> {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: false,
    backgroundColor: '#0a4f4a',
    logging: false,
    windowWidth: element.scrollWidth,
  });

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((b) => resolve(b), 'image/png');
  });
  if (!blob) throw new Error('png_blob_failed');

  const url = URL.createObjectURL(blob);
  try {
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.endsWith('.png') ? fileName : `${fileName}.png`;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
  } finally {
    URL.revokeObjectURL(url);
  }
}
