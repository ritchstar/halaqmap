import type { JSX } from 'react';

/** تنسيق نصوص الصفحات القانونية: فقرات، عناوين **، وقوائم تبدأ بـ "- " */
export function renderLegalContentBlocks(content: string) {
  const lines = content.split('\n');
  const blocks: JSX.Element[] = [];
  let bullets: string[] = [];

  const pushBullets = (keyBase: number) => {
    if (bullets.length === 0) return;
    blocks.push(
      <ul key={`ul-${keyBase}`} className="list-disc list-inside space-y-2 pr-1 text-right">
        {bullets.map((line, i) => (
          <li key={`li-${keyBase}-${i}`} className="text-muted-foreground leading-relaxed">
            {line.split('**').map((part, idx) =>
              idx % 2 === 0 ? part : <strong key={idx} className="text-foreground">{part}</strong>
            )}
          </li>
        ))}
      </ul>
    );
    bullets = [];
  };

  lines.forEach((line, i) => {
    const paragraph = line.trim();
    if (!paragraph) {
      pushBullets(i);
      return;
    }

    if (paragraph.startsWith('- ')) {
      bullets.push(paragraph.substring(2));
      return;
    }

    pushBullets(i);
    if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
      blocks.push(
        <h3 key={`h-${i}`} className="text-lg font-semibold text-foreground mt-4 mb-2 text-right">
          {paragraph.replace(/\*\*/g, '')}
        </h3>
      );
      return;
    }

    blocks.push(
      <p key={`p-${i}`} className="text-muted-foreground leading-relaxed mb-4 text-right">
        {paragraph.split('**').map((part, idx) =>
          idx % 2 === 0 ? part : <strong key={idx} className="text-foreground">{part}</strong>
        )}
      </p>
    );
  });

  pushBullets(lines.length + 1);
  return blocks;
}
