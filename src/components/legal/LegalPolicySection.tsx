import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { renderLegalContentBlocks } from '@/lib/legalPageRender';
import { cn } from '@/lib/utils';

type Props = {
  icon: LucideIcon;
  title: string;
  content: string;
  index?: number;
  className?: string;
};

/** بطاقة قسم قانوني — تباين عالٍ داخل `platform-dark` / مسار الشركاء */
export function LegalPolicySection({ icon: Icon, title, content, index = 0, className }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className={cn(
        'partner-legal-section rounded-2xl border border-white/12 bg-[#0b1628]/95 p-6 text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]',
        className,
      )}
    >
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-teal-400/25 bg-teal-500/10">
          <Icon className="h-5 w-5 text-teal-300" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="mb-3 text-xl font-bold text-slate-50">{title}</h2>
          <div className="partner-legal-prose max-w-none space-y-1">{renderLegalContentBlocks(content)}</div>
        </div>
      </div>
    </motion.div>
  );
}
