/**
 * Agent persona registry — Saudi voice identity for conversation logging & prompts.
 * Maps stable agent_id → Arabic title + gender (سعودي / سعودية).
 */

export type AgentPersonaGender = 'male' | 'female';
export type AgentDeployment = 'public' | 'admin_lab' | 'partner' | 'barber';

export type AgentPersonaId =
  | 'legal_observer'
  | 'media_spokesperson'
  | 'digital_shift_field'
  | 'b2b_sales_manager'
  | 'b2c_marketing_strategist'
  | 'b2b_marketing_strategist'
  | 'saudi_cultural_agent'
  | 'saudia_cultural_agent'
  | 'public_prosecutor'
  | 'zatca_tax_advisor'
  | 'system_crisis_advisor'
  | 'technical_consultant_engineering'
  | 'billing_treasurer'
  | 'cyber_defense_commander'
  | 'fleet_director_general'
  | 'partner_relations_liaison'
  | 'partner_assistant'
  | 'barber_support'
  | 'digital_shift_barber';

export type AgentPersona = {
  id: AgentPersonaId;
  titleAr: string;
  gender: AgentPersonaGender;
  deployment: AgentDeployment;
};

export const PLATFORM_MANAGEMENT_EMAIL = 'admin@halaqmap.com';

export const AGENT_PERSONAS: Record<AgentPersonaId, AgentPersona> = {
  legal_observer: {
    id: 'legal_observer',
    titleAr: 'الناظر القانوني',
    gender: 'male',
    deployment: 'public',
  },
  media_spokesperson: {
    id: 'media_spokesperson',
    titleAr: 'المتحدثة الإعلامية',
    gender: 'female',
    deployment: 'public',
  },
  digital_shift_field: {
    id: 'digital_shift_field',
    titleAr: 'المناوب الرقمي',
    gender: 'male',
    deployment: 'public',
  },
  b2b_sales_manager: {
    id: 'b2b_sales_manager',
    titleAr: 'مدير مبيعات B2B',
    gender: 'male',
    deployment: 'public',
  },
  b2c_marketing_strategist: {
    id: 'b2c_marketing_strategist',
    titleAr: 'استراتيجية التسويق B2C',
    gender: 'female',
    deployment: 'admin_lab',
  },
  b2b_marketing_strategist: {
    id: 'b2b_marketing_strategist',
    titleAr: 'استراتيجي التسويق B2B',
    gender: 'male',
    deployment: 'admin_lab',
  },
  saudi_cultural_agent: {
    id: 'saudi_cultural_agent',
    titleAr: 'سعودي',
    gender: 'male',
    deployment: 'public',
  },
  saudia_cultural_agent: {
    id: 'saudia_cultural_agent',
    titleAr: 'سعودية',
    gender: 'female',
    deployment: 'public',
  },
  public_prosecutor: {
    id: 'public_prosecutor',
    titleAr: 'المدعي العام',
    gender: 'male',
    deployment: 'admin_lab',
  },
  zatca_tax_advisor: {
    id: 'zatca_tax_advisor',
    titleAr: 'مستشار ZATCA',
    gender: 'male',
    deployment: 'admin_lab',
  },
  system_crisis_advisor: {
    id: 'system_crisis_advisor',
    titleAr: 'مستشار الأزمات',
    gender: 'male',
    deployment: 'admin_lab',
  },
  technical_consultant_engineering: {
    id: 'technical_consultant_engineering',
    titleAr: 'المستشار الهندسي',
    gender: 'male',
    deployment: 'admin_lab',
  },
  billing_treasurer: {
    id: 'billing_treasurer',
    titleAr: 'خازن المنصة',
    gender: 'male',
    deployment: 'admin_lab',
  },
  cyber_defense_commander: {
    id: 'cyber_defense_commander',
    titleAr: 'قائد الدفاع السيبراني',
    gender: 'male',
    deployment: 'admin_lab',
  },
  fleet_director_general: {
    id: 'fleet_director_general',
    titleAr: 'المدير العام للمناوبين',
    gender: 'male',
    deployment: 'admin_lab',
  },
  partner_relations_liaison: {
    id: 'partner_relations_liaison',
    titleAr: 'مساعد الشركاء',
    gender: 'male',
    deployment: 'admin_lab',
  },
  partner_assistant: {
    id: 'partner_assistant',
    titleAr: 'مساعد الشركاء الميداني',
    gender: 'male',
    deployment: 'partner',
  },
  barber_support: {
    id: 'barber_support',
    titleAr: 'دعم الصالون',
    gender: 'female',
    deployment: 'barber',
  },
  digital_shift_barber: {
    id: 'digital_shift_barber',
    titleAr: 'المناوب الرقمي',
    gender: 'male',
    deployment: 'barber',
  },
};

export function getAgentPersona(id: AgentPersonaId): AgentPersona {
  return AGENT_PERSONAS[id];
}

export function saudiVoiceDoctrineAr(persona: AgentPersona): string {
  if (persona.gender === 'female') {
    return `- هويتك: «${persona.titleAr}» — سعودية، تتحدثين بضمير المؤنث وأسلوب مهني سعودي واضح.`;
  }
  return `- هويتك: «${persona.titleAr}» — سعودي، تتحدث بضمير المذكر وأسلوب مهني سعودي واضح.`;
}
