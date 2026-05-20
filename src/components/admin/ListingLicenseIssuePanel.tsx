import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { adminIssueListingLicenseVoucherRemote } from '@/lib/adminListingLicenseRemote';

const SKU_OPTIONS = [
  { value: 'bronze_30', label: 'برونزي — 30 يوم' },
  { value: 'gold_30', label: 'ذهبي — 30 يوم' },
  { value: 'diamond_30', label: 'ماسي — 30 يوم' },
] as const;

type Props = {
  accessToken: string;
  defaultBarberId?: string;
  defaultEmail?: string;
  defaultBarberName?: string;
};

export function ListingLicenseIssuePanel({
  accessToken,
  defaultBarberId = '',
  defaultEmail = '',
  defaultBarberName = '',
}: Props) {
  const [skuCode, setSkuCode] = useState<string>('bronze_30');
  const [barberId, setBarberId] = useState(defaultBarberId);
  const [buyerEmail, setBuyerEmail] = useState(defaultEmail);
  const [barberName, setBarberName] = useState(defaultBarberName);
  const [autoRedeem, setAutoRedeem] = useState(Boolean(defaultBarberId));
  const [sendEmail, setSendEmail] = useState(true);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastCode, setLastCode] = useState<string | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>إصدار رمز حزمة إدراج برمجية (يدوي)</CardTitle>
        <CardDescription>
          إصدار كود تفعيل للحزم البرمجية الحالية (30 يوماً). يمكن التفعيل التلقائي إن وُجد معرّف حلاق.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>منتج الحزمة البرمجية (SKU)</Label>
            <Select value={skuCode} onValueChange={setSkuCode}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SKU_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="issue-barber-id">معرّف الحلاق (UUID)</Label>
            <Input
              id="issue-barber-id"
              value={barberId}
              onChange={(e) => setBarberId(e.target.value)}
              dir="ltr"
              placeholder="اختياري للتفعيل التلقائي"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="issue-email">بريد المستلم</Label>
            <Input
              id="issue-email"
              type="email"
              value={buyerEmail}
              onChange={(e) => setBuyerEmail(e.target.value)}
              dir="ltr"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="issue-name">اسم الشريك</Label>
            <Input id="issue-name" value={barberName} onChange={(e) => setBarberName(e.target.value)} />
          </div>
        </div>
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-2">
            <Switch checked={autoRedeem} onCheckedChange={setAutoRedeem} id="auto-redeem" />
            <Label htmlFor="auto-redeem">تفعيل تلقائي على الحلاق</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={sendEmail} onCheckedChange={setSendEmail} id="send-email" />
            <Label htmlFor="send-email">إرسال الرمز بالبريد</Label>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="issue-notes">ملاحظات إدارية</Label>
          <Textarea id="issue-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
        </div>
        {lastCode ? (
          <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm font-mono" dir="ltr">
            آخر رمز (عرض لمرة واحدة): {lastCode}
          </p>
        ) : null}
        <Button
          type="button"
          disabled={loading}
          onClick={async () => {
            setLoading(true);
            const res = await adminIssueListingLicenseVoucherRemote({
              accessToken,
              skuCode,
              barberId: barberId.trim() || undefined,
              buyerEmail: buyerEmail.trim() || undefined,
              barberName: barberName.trim() || undefined,
              autoRedeem,
              sendEmail,
              adminNotes: notes.trim() || undefined,
            });
            setLoading(false);
            if (!res.ok) {
              toast.error(`تعذّر الإصدار: ${res.error}`);
              return;
            }
            if (res.voucherCode) setLastCode(res.voucherCode);
            toast.success(
              res.emailSent
                ? `تم الإصدار وإرسال البريد — ${res.listingDaysGranted} يوم.`
                : `تم الإصدار — ${res.listingDaysGranted} يوم.`,
            );
          }}
        >
          إصدار الرمز
        </Button>
      </CardContent>
    </Card>
  );
}
