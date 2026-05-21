import { useCallback, useEffect, useState } from 'react';
import { Cog, Loader2, MessageSquare, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SELF_DEVELOPMENT_PROTOCOL_LABELS_AR } from '@/config/engineeringCouncil';
import {
  SUPER_INTELLIGENCE_PROTOCOL_LABELS_AR,
} from '@/config/superIntelligenceFeed';
import {
  fetchEngineeringCouncil,
  proposeEngineeringTask,
  proposeProsecutorDrivenRefactor,
} from '@/lib/engineeringCouncilRemote';
import type { AgentCouncilMessage } from '@/modules/ai-staff/types';
import { toast } from '@/components/ui/sonner';

type Props = {
  onOpenLab?: () => void;
};

export function EngineeringCouncilPanel({ onOpenLab }: Props) {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<AgentCouncilMessage[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    const result = await fetchEngineeringCouncil();
    setLoading(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setMessages(result.messages);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handlePropose = async () => {
    if (title.trim().length < 4 || description.trim().length < 12) {
      toast.error('أدخل عنواناً ووصفاً للمهمة.');
      return;
    }
    setBusy(true);
    const result = await proposeEngineeringTask({
      title: title.trim(),
      taskDescription: description.trim(),
    });
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(
      result.execution?.status === 'gate_blocked'
        ? 'Prosecutor Gate BLOCKED — راجع Performance Delta.'
        : 'Super-Intelligence Protocol — Pending Founder Approval.',
    );
    setTitle('');
    setDescription('');
    void refresh();
  };

  const handleProsecutorRefactor = async () => {
    setBusy(true);
    const result = await proposeProsecutorDrivenRefactor();
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.message(result.execution ? 'Refactor من feedback المدعي العام — Pending Approval.' : result.suggestion);
    void refresh();
  };

  return (
    <div className="space-y-5 text-right">
      <div className="flex flex-wrap items-center justify-end gap-2">
        {Object.values(SUPER_INTELLIGENCE_PROTOCOL_LABELS_AR).map((label) => (
          <Badge key={label} variant="outline" className="border-violet-800/40 text-[10px] text-violet-200">
            {label}
          </Badge>
        ))}
        {Object.values(SELF_DEVELOPMENT_PROTOCOL_LABELS_AR).map((label) => (
          <Badge key={label} variant="outline" className="border-cyan-800/40 text-[10px] text-cyan-200">
            {label}
          </Badge>
        ))}
      </div>

      <div className="grid gap-3 rounded-lg border border-slate-700 bg-slate-900/60 p-4">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="عنوان المهمة الهندسية"
          className="border-slate-600 bg-slate-950 text-slate-100"
        />
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="صف refactor المطلوب — سيُستشار المدعي العام تلقائياً"
          className="min-h-[88px] border-slate-600 bg-slate-950 text-slate-100"
        />
        <div className="flex flex-wrap gap-2 justify-end">
          {onOpenLab ? (
            <Button type="button" variant="outline" size="sm" onClick={onOpenLab}>
              <MessageSquare className="ml-2 h-4 w-4" />
              محادثة Consultant
            </Button>
          ) : null}
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => void handleProsecutorRefactor()}
          >
            <Sparkles className="ml-2 h-4 w-4" />
            Refactor من المدعي العام
          </Button>
          <Button
            type="button"
            size="sm"
            className="bg-cyan-700 hover:bg-cyan-600 text-white"
            disabled={busy}
            onClick={() => void handlePropose()}
          >
            {busy ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Cog className="ml-2 h-4 w-4" />}
            تشغيل Protocol
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-slate-200">Agent-to-Agent Council Bus</h4>
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-6 text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">جاري تحميل الرسائل…</span>
          </div>
        ) : messages.length === 0 ? (
          <p className="text-sm text-slate-500">لا رسائل بعد — ابدأ مهمة لتفعيل الاستشارة.</p>
        ) : (
          <div className="max-h-72 space-y-2 overflow-y-auto">
            {messages.map((msg) => (
              <article
                key={msg.id}
                className="rounded-lg border border-slate-700/80 bg-slate-950/50 px-3 py-2 text-sm"
              >
                <div className="mb-1 flex flex-wrap items-center justify-end gap-2 text-[10px] text-slate-500">
                  <span>{msg.fromAgent} → {msg.toAgent}</span>
                  <Badge variant="outline" className="text-[10px]">
                    {msg.messageType}
                  </Badge>
                </div>
                <p className="font-medium text-slate-100">{msg.title}</p>
                <p className="mt-1 whitespace-pre-wrap text-slate-400">{msg.body.slice(0, 400)}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
