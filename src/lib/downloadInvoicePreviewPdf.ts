import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * يلتقط عنصر HTML (فاتورة RTL) ويُصدِر PDF صفحة A4 واحدة — للمعاينة والإرفاق اليدوي.
 */
export async function downloadElementAsPdf(element: HTMLElement, fileName: string): Promise<void> {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
    windowWidth: element.scrollWidth,
  });

  const imgData = canvas.toDataURL('image/png', 1.0);
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const imgWidthPx = canvas.width;
  const imgHeightPx = canvas.height;
  const ratio = imgWidthPx / imgHeightPx;

  let drawW = pageWidth;
  let drawH = pageWidth / ratio;
  if (drawH > pageHeight) {
    drawH = pageHeight;
    drawW = pageHeight * ratio;
  }
  const x = (pageWidth - drawW) / 2;
  const y = (pageHeight - drawH) / 2;

  pdf.addImage(imgData, 'PNG', x, y, drawW, drawH, undefined, 'FAST');
  pdf.save(fileName);
}
