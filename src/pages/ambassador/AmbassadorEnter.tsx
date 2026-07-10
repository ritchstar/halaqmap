import { useEffect, useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Handshake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AMBASSADOR_PROGRAM_NAME_AR,
  AMBASSADOR_RULES_VERSION,
} from '@/config/ambassadorFieldRulesPolicy';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ROUTE_PATHS } from '@/lib';
import {
  readAmbassadorPortal,
  registerAmbassador,
} from '@/lib/ambassadorPortalStore';
import { toast } from '@/components/ui/sonner';

export default function AmbassadorEnter() {
  useDocumentTitle('دخول السفير · حلاق ماب');
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [existing, setExisting] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [acceptedRules, setAcceptedRules] = useState(false);

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'robots');
    meta.setAttribute('content', 'noindex, nofollow');
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  useEffect(() => {
    const portal = readAmbassadorPortal();
    setExisting(!!portal);
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#07070a] text-sm text-slate-400" dir="rtl">
        جاري التحميل…
      </div>
    );
  }

  if (existing) {
    return <Navigate to={ROUTE_PATHS.AMBASSADOR_DASHBOARD} replace />;
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || displayName.trim().length < 2) {
      toast.error('أدخل الاسم الظاهر (حرفان على الأقل).');
      return;
    }
    if (!phone.trim() || phone.trim().length < 9) {
      toast.error('أدخل رقم جوال صالحاً.');
      return;
    }
    if (!acceptedRules) {
      toast.error('يجب الموافقة على وثيقة قواعد السفراء.');
      return;
    }
    registerAmbassador({ displayName, phone });
    toast.success('تم إنشاء ملف السفير — مرحباً بك.');
    navigate(ROUTE_PATHS.AMBASSADOR_DASHBOARD);
  };

  return (
    <div className="min-h-screen bg-[#07070a] text-slate-100" dir="rtl">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_70%_45%_at_50%_0%,rgba(20,184,166,0.14),transparent_55%)]" />

      <header className="relative z-10 border-b border-white/8 bg-black/40 backdrop-blur-md">
        <div className="container mx-auto flex max-w-lg items-center justify-between px-4 py-4">
          <Link
            to={ROUTE_PATHS.HOME}
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-teal-200"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            حلاق ماب
          </Link>
          <Link to={ROUTE_PATHS.AMBASSADOR_RULES} className="text-xs text-teal-300/80 hover:underline">
            وثيقة القواعد
          </Link>
        </div>
      </header>

      <main className="relative z-10 container mx-auto max-w-lg px-4 py-10">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-teal-400/30 bg-teal-500/10">
              <Handshake className="h-7 w-7 text-teal-300" aria-hidden />
            </div>
            <h1 className="mb-2 text-3xl font-black text-white">لوحة السفير</h1>
            <p className="text-sm leading-relaxed text-slate-400">{AMBASSADOR_PROGRAM_NAME_AR}</p>
            <p className="mt-2 text-xs text-slate-500">نسخة القواعد: {AMBASSADOR_RULES_VERSION}</p>
          </div>

          <form
            onSubmit={onSubmit}
            className="space-y-5 rounded-2xl border border-white/10 bg-[#0f0f14]/95 p-6"
          >
            <div className="space-y-2">
              <Label htmlFor="amb-name" className="text-slate-200">
                الاسم الظاهر
              </Label>
              <Input
                id="amb-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={80}
                placeholder="مثال: أحمد"
                className="border-white/15 bg-black/30 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amb-phone" className="text-slate-200">
                الجوال
              </Label>
              <Input
                id="amb-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={20}
                placeholder="05xxxxxxxx"
                inputMode="tel"
                className="border-white/15 bg-black/30 text-white"
                dir="ltr"
              />
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-teal-400/25 bg-teal-500/5 p-4">
              <Checkbox
                id="amb-rules"
                checked={acceptedRules}
                onCheckedChange={(v) => setAcceptedRules(v === true)}
                className="mt-0.5 border-teal-400/40 data-[state=checked]:bg-teal-500"
              />
              <Label htmlFor="amb-rules" className="cursor-pointer text-sm leading-relaxed text-slate-200">
                قرأت وأوافق على{' '}
                <Link to={ROUTE_PATHS.AMBASSADOR_RULES} className="font-semibold text-teal-300 underline">
                  وثيقة قواعد السفراء
                </Link>
                ، بما فيها أول تفعيل فقط، 50م، نافذة 14→30 يوماً، وحد الصرف 300 ر.س.
              </Label>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full rounded-xl bg-teal-500 font-bold text-black hover:bg-teal-400"
            >
              ابدأ كسفير
            </Button>
            <p className="text-center text-[11px] leading-relaxed text-slate-500">
              المرحلة الحالية تحفظ ملفك على هذا الجهاز. مزامنة الخادم تُفعَّل بعد تطبيق migration{' '}
              <code className="text-slate-400">138</code>.
            </p>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
