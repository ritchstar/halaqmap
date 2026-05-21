import { useState, type ReactNode } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type ComplianceCheckboxProps = {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  modalTitle: string;
  modalContent: ReactNode;
  disabled?: boolean;
};

export function ComplianceCheckbox({
  id,
  label,
  checked,
  onCheckedChange,
  modalTitle,
  modalContent,
  disabled = false,
}: ComplianceCheckboxProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="flex items-start gap-3 rounded-lg border border-slate-600/80 bg-slate-800/40 px-4 py-3">
        <Checkbox
          id={id}
          checked={checked}
          onCheckedChange={(value) => onCheckedChange(value === true)}
          disabled={disabled}
          className="mt-0.5 border-slate-500 data-[state=checked]:bg-slate-200 data-[state=checked]:text-slate-900"
        />
        <div className="min-w-0 flex-1 text-right">
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="text-sm leading-relaxed text-slate-200 underline-offset-4 transition-colors hover:text-white hover:underline focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            {label}
          </button>
        </div>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent
          dir="rtl"
          className="max-h-[85vh] overflow-y-auto border-slate-600 bg-slate-900 text-slate-100 sm:max-w-lg"
        >
          <DialogHeader className="text-right">
            <DialogTitle className="text-lg font-bold text-white">{modalTitle}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm leading-relaxed text-slate-300">{modalContent}</div>
        </DialogContent>
      </Dialog>
    </>
  );
}
