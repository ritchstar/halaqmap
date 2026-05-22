/**
 * Shared primitives for all admin "lab chat" sheets so the conversation
 * surface stays the priority — header collapses to one line, attachment
 * input is a single inline icon, and every assistant reply has a one-tap
 * copy affordance at the top corner.
 *
 * Goals (founder feedback 2026-05-22):
 *  1. Maximize vertical conversation area.
 *  2. Minimize the file-upload UI to bare minimum.
 *  3. One-tap copy for any reply — applied uniformly across all agents.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, ChevronUp, Copy, FileImage, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

/* ─── Collapsible Header ───────────────────────────────────────────── */

type CollapsibleHeaderProps = {
  /** Compact title row — always visible. */
  title: React.ReactNode;
  /** Compact badge next to the title (one badge max). */
  badge?: React.ReactNode;
  /** Hidden content when collapsed (description, model label, links). */
  children?: React.ReactNode;
  /** Color of the toggle (theme accent). */
  toneClass?: string;
  /** Auto-collapse trigger — e.g. messages.length > 1 collapses after first user message. */
  autoCollapseSignal?: unknown;
  /** Container className overrides. */
  className?: string;
};

/**
 * Header that starts expanded then collapses to one line after the first
 * interaction. The whole strip is clickable to toggle.
 */
export function CollapsibleLabHeader({
  title,
  badge,
  children,
  toneClass,
  autoCollapseSignal,
  className,
}: CollapsibleHeaderProps) {
  const [collapsed, setCollapsed] = useState(false);
  const lastSignalRef = useRef(autoCollapseSignal);

  useEffect(() => {
    if (lastSignalRef.current !== autoCollapseSignal) {
      lastSignalRef.current = autoCollapseSignal;
      setCollapsed(true);
    }
  }, [autoCollapseSignal]);

  return (
    <div className={cn('shrink-0', className)}>
      <button
        type="button"
        onClick={() => setCollapsed((p) => !p)}
        className={cn(
          'flex w-full items-center justify-between gap-2 px-4 py-2.5 text-right transition-colors hover:bg-foreground/[0.03]',
          toneClass,
        )}
        aria-label={collapsed ? 'عرض تفاصيل الوكيل' : 'إخفاء تفاصيل الوكيل'}
      >
        <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
          {badge ? <div className="shrink-0">{badge}</div> : null}
          <div className="min-w-0 truncate text-right text-sm font-semibold md:text-base">
            {title}
          </div>
        </div>
        {collapsed ? (
          <ChevronDown className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
        ) : (
          <ChevronUp className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
        )}
      </button>
      {collapsed ? null : (
        <div className="border-b border-border/40 px-4 pb-3 pt-1 text-right text-xs leading-relaxed text-muted-foreground">
          {children}
        </div>
      )}
    </div>
  );
}

/* ─── Copyable Message Bubble ──────────────────────────────────────── */

type CopyableMessageProps = {
  role: 'user' | 'assistant';
  content: string;
  /** Theme-specific class for the assistant bubble. */
  assistantClass?: string;
  /** Theme-specific class for the user bubble. */
  userClass?: string;
};

/**
 * Renders a single chat bubble with a one-tap copy affordance at the
 * top-leading corner. Visible on hover (desktop) and always on touch.
 */
export function CopyableMessage({
  role,
  content,
  assistantClass,
  userClass,
}: CopyableMessageProps) {
  const [copied, setCopied] = useState(false);

  const onCopy = useCallback(async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(content);
      } else {
        const ta = document.createElement('textarea');
        ta.value = content;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch (err) {
      toast({ title: 'تعذّر النسخ — حاول يدوياً', variant: 'destructive' });
    }
  }, [content]);

  return (
    <div
      dir="rtl"
      className={cn(
        'group relative rounded-lg px-3 py-2 pt-7 text-sm leading-relaxed text-foreground',
        'chat-arabic-text whitespace-pre-wrap',
        role === 'user'
          ? cn('mr-8 ml-0 bg-primary/10', userClass)
          : cn('ml-8 mr-0 border', assistantClass),
      )}
    >
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onCopy}
        aria-label="نسخ الرد"
        title="نسخ"
        className={cn(
          'absolute right-1.5 top-1 h-6 gap-1 px-2 py-0 text-[10px] font-medium opacity-60 transition-opacity',
          'hover:opacity-100 focus:opacity-100 group-hover:opacity-100',
        )}
      >
        {copied ? (
          <>
            <Check className="h-3 w-3" aria-hidden />
            <span>نُسخ</span>
          </>
        ) : (
          <>
            <Copy className="h-3 w-3" aria-hidden />
            <span>نسخ</span>
          </>
        )}
      </Button>
      <div>{content}</div>
    </div>
  );
}

/* ─── Compact Attachment Control ───────────────────────────────────── */

type CompactAttachmentProps = {
  accept: string;
  /** Maximum file size in MB (default 4). */
  maxMb?: number;
  /** Called with the selected File or null on clear. */
  onChange: (file: File | null) => void;
  /** Current preview URL (caller still owns objectURL lifecycle). */
  previewUrl?: string | null;
  /** Display name for accessibility. */
  hint?: string;
  /** Disabled state — used while busy. */
  disabled?: boolean;
};

/**
 * Replaces the giant dashed drag-zone with a compact icon + tiny preview
 * chip. Total height when collapsed: ~28px. When a file is selected we
 * show a single line chip with thumbnail + ✕ button.
 */
export function CompactAttachmentControl({
  accept,
  maxMb = 4,
  onChange,
  previewUrl,
  hint = 'إرفاق صورة (اختياري)',
  disabled,
}: CompactAttachmentProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handle = useCallback(
    (f: File | null) => {
      if (!f) {
        onChange(null);
        return;
      }
      if (!accept.split(',').includes(f.type)) {
        toast({ title: 'نوع الملف غير مدعوم', variant: 'destructive' });
        return;
      }
      if (f.size > maxMb * 1024 * 1024) {
        toast({ title: `حجم الصورة يتجاوز ${maxMb} ميغابايت`, variant: 'destructive' });
        return;
      }
      onChange(f);
    },
    [accept, maxMb, onChange],
  );

  return (
    <div className="flex items-center justify-between gap-2 text-right">
      <input
        ref={fileRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => handle(e.target.files?.[0] ?? null)}
        disabled={disabled}
      />
      {previewUrl ? (
        <div className="flex flex-1 items-center gap-2 rounded-md border border-border bg-muted/40 px-2 py-1">
          <img
            src={previewUrl}
            alt="معاينة المرفق"
            className="h-7 w-7 rounded object-cover"
          />
          <span className="flex-1 truncate text-xs text-muted-foreground">{hint}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => {
              if (fileRef.current) fileRef.current.value = '';
              onChange(null);
            }}
            className="h-6 w-6 shrink-0"
            aria-label="إزالة المرفق"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => fileRef.current?.click()}
          className="h-7 gap-1.5 px-2 text-[11px] text-muted-foreground hover:text-foreground"
        >
          <FileImage className="h-3.5 w-3.5" />
          <span>{hint}</span>
        </Button>
      )}
    </div>
  );
}
