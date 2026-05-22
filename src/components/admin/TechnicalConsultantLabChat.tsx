import { useCallback, useEffect, useRef, useState } from 'react';
import { Cog, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { chatWithTechnicalConsultantLab } from '@/lib/technicalConsultantLabRemote';

type ChatMsg = { role: 'user' | 'assistant'; content: string };

const GREETING =
  '⚙️ **Technical Consultant — Autonomous Engineering Wing**\n\n' +
  'Self-Development Protocol:\n' +
  '1. Propose Plan\n' +
  '2. Consult Public Prosecutor\n' +
  '3. Draft Branch\n' +
  '4. Unit Tests\n' +
  '5. Pending Founder Approval\n\n' +
  'Describe a refactor or cross-agent consultation.';

type Props = {
  permitted: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
};

export function TechnicalConsultantLabChat({
  permitted,
  open: openProp,
  onOpenChange: onOpenChangeProp,
  hideTrigger = false,
}: Props) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = openProp !== undefined && onOpenChangeProp !== undefined;
  const open = isControlled ? openProp : internalOpen;
  const setOpen = isControlled ? onOpenChangeProp! : setInternalOpen;

  const [messages, setMessages] = useState<ChatMsg[]>([{ role: 'assistant', content: GREETING }]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, busy]);

  const send = useCallback(async () => {
    if (!permitted || busy) return;
    const text = input.trim();
    if (!text) return;

    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    setMessages((m) => [...m, { role: 'user', content: text }]);
    setInput('');
    setBusy(true);

    try {
      const r = await chatWithTechnicalConsultantLab({
        userMessage: text,
        conversationHistory: history,
      });
      if (!r.ok) {
        toast({ title: r.error, variant: 'destructive' });
        setMessages((m) => [...m, { role: 'assistant', content: `⚠️ ${r.error}` }]);
        return;
      }
      setMessages((m) => [...m, { role: 'assistant', content: r.reply }]);
    } finally {
      setBusy(false);
    }
  }, [busy, input, messages, permitted]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {!hideTrigger ? (
        <SheetTrigger asChild>
          <Button type="button" variant="outline" size="sm" className="gap-2 border-cyan-700/40">
            <Cog className="h-4 w-4" />
            Technical Consultant
          </Button>
        </SheetTrigger>
      ) : null}
      <SheetContent
        side="left"
        className="flex w-full flex-col gap-0 border-cyan-900/40 bg-slate-950 p-0 sm:max-w-lg"
      >
        <SheetHeader className="shrink-0 border-b border-cyan-900/30 bg-slate-900 px-4 py-4 text-right">
          <SheetTitle className="flex items-center justify-end gap-2 text-slate-50">
            <Cog className="h-5 w-5 text-cyan-300" />
            Engineering Wing
          </SheetTitle>
          <SheetDescription className="text-right text-slate-300">
            <Badge variant="outline" className="border-cyan-700/40 text-[10px]">
              Self-Development Protocol · A2A Council
            </Badge>
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 px-4 py-3">
          <div className="space-y-3 pb-2">
            {messages.map((msg, i) => (
              <div
                key={i}
                dir="rtl"
                className={`chat-arabic-text whitespace-pre-wrap rounded-lg px-3 py-2 text-sm ${
                  msg.role === 'user'
                    ? 'mr-8 bg-cyan-950/30 text-slate-100'
                    : 'ml-8 border border-cyan-900/30 bg-slate-900/80 text-slate-200'
                }`}
              >
                {msg.content}
              </div>
            ))}
            {busy ? (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                استشارة المدعي العام…
              </div>
            ) : null}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        <div className="shrink-0 space-y-2 border-t border-cyan-900/30 p-4">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="صف refactor أو استشارة cross-agent…"
            className="min-h-[80px] border-slate-600 bg-slate-900 text-right"
            disabled={!permitted || busy}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
          />
          <Button
            type="button"
            className="w-full bg-cyan-700 hover:bg-cyan-600"
            disabled={!permitted || busy || !input.trim()}
            onClick={() => void send()}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            إرسال
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
