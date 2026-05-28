import { useEffect, useRef, type RefObject } from 'react';

/** Scroll a chat messages container (plain div or Radix ScrollArea root) to the bottom. */
export function scrollAgentChatToEnd(container: HTMLElement | null) {
  if (!container) return;
  const viewport = container.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement | null;
  const target = viewport ?? container;
  target.scrollTop = target.scrollHeight;
}

/**
 * Keep chat transcript pinned to bottom without scrollIntoView (avoids page jump).
 */
export function useAgentChatScroll(messagesRef: RefObject<HTMLElement | null>, deps: unknown[]) {
  useEffect(() => {
    scrollAgentChatToEnd(messagesRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/**
 * After a loading/busy cycle completes, restore focus to the textarea without scrolling the page.
 */
export function useAgentChatInputFocus(
  loading: boolean,
  inputRef: RefObject<HTMLTextAreaElement | null>,
  enabled = true,
) {
  const wasLoadingRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    if (loading) {
      wasLoadingRef.current = true;
      return;
    }
    if (!wasLoadingRef.current) return;
    wasLoadingRef.current = false;
    const id = window.setTimeout(() => {
      const el = inputRef.current;
      if (!el || el.disabled) return;
      el.focus({ preventScroll: true });
      const end = el.value.length;
      try {
        el.setSelectionRange(end, end);
      } catch {
        /* read-only textarea */
      }
    }, 50);
    return () => window.clearTimeout(id);
  }, [loading, enabled, inputRef]);
}

/** Focus the input when a chat panel opens, without scrolling the page. */
export function useAgentChatOpenFocus(open: boolean, inputRef: RefObject<HTMLTextAreaElement | null>) {
  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => {
      inputRef.current?.focus({ preventScroll: true });
    }, 150);
    return () => window.clearTimeout(id);
  }, [open, inputRef]);
}
