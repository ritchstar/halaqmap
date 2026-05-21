import {
  HONOR_BOARD_CORE_VALUES,
  HONOR_BOARD_MANIFESTO_PARAGRAPHS,
  HONOR_BOARD_MANIFESTO_TITLE,
  HONOR_BOARD_PROFESSIONAL_COMMITMENT_LEAD,
  REGISTRATION_LEGAL_DISCLAIMER_AR,
} from '@/config/honorBoardManifesto';

function CoreValuesList({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={
        compact
          ? 'divide-y divide-slate-700/60 rounded-lg border border-slate-600/40 bg-slate-950/50'
          : 'divide-y divide-slate-700/60 rounded-lg border border-slate-600/40 bg-slate-950/50'
      }
    >
      {HONOR_BOARD_CORE_VALUES.map((section) => (
        <div key={section.id} className="px-4 py-3">
          <p className="mb-1 text-xs font-semibold tracking-wide text-slate-400">{section.label}</p>
          <p className="text-sm leading-relaxed text-slate-300">{section.body}</p>
        </div>
      ))}
    </div>
  );
}

export function LegalPledgeModalContent() {
  return (
    <>
      <p className="text-pretty font-medium text-slate-200">{REGISTRATION_LEGAL_DISCLAIMER_AR}</p>
      <p className="text-pretty text-slate-400">
        بموجب هذا التعهد تُقرّ منشأتك ممتثلة لاشتراطات الجهات المذكورة، وتتحمّل أنت المسؤولية القانونية
        كاملة دون المطالبة بمنصة حلاق ماب عن التبعات الناشئة عن صحة ذلك الامتثال أو غيابه.
      </p>
      <CoreValuesList compact />
    </>
  );
}

export function ProfessionalCommitmentModalContent() {
  return (
    <>
      <p className="text-pretty font-medium text-slate-200">{HONOR_BOARD_PROFESSIONAL_COMMITMENT_LEAD}</p>
      <p className="text-pretty text-slate-400">{HONOR_BOARD_MANIFESTO_TITLE}</p>
      <div className="space-y-3">
        {HONOR_BOARD_MANIFESTO_PARAGRAPHS.map((paragraph, index) => (
          <p key={index} className="text-pretty">
            {paragraph}
          </p>
        ))}
      </div>
      <CoreValuesList />
    </>
  );
}
