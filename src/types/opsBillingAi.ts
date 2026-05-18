export type OpsBillingAiPatch = {
  display_label?: string;
  next_renewal_at?: string | null;
  monthly_estimate_sar?: number | null;
  amount_expected?: number | null;
  amount_currency?: string;
  billing_cycle?: 'monthly' | 'annual' | 'custom' | 'unknown';
  manual_notes?: string;
  clear_gap?: boolean;
  last_sync_status?: 'ok' | 'partial';
};

export type OpsBillingAiProposal = {
  proposal_token: string;
  commitment_id: string;
  match_confidence: 'high' | 'medium' | 'low';
  detected_vendor: string | null;
  detected_provider_label: string;
  payment_status: string | null;
  before: Record<string, unknown>;
  after: Record<string, unknown>;
  patch: OpsBillingAiPatch;
};

export type OpsBillingAiAnalyzeResponse = {
  assistant_message: string;
  needs_clarification: boolean;
  proposals: OpsBillingAiProposal[];
};
