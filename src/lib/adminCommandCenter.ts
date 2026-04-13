export type CommandLeadChannel = 'whatsapp' | 'instagram' | 'email' | 'website' | 'phone';
export type CommandLeadStatus = 'new' | 'contacted' | 'waiting' | 'won' | 'lost';

export interface CommandCenterLead {
  id: string;
  name: string;
  city: string;
  region: string;
  tierFit: 'gold' | 'diamond' | 'mixed';
  channel: CommandLeadChannel;
  phone?: string;
  email?: string;
  instagram?: string;
  website?: string;
}

export const COMMAND_CENTER_LEADS: CommandCenterLead[] = [
  {
    id: 'lead-address-riyadh',
    name: 'صالون العنوان',
    city: 'الرياض',
    region: 'الوسطى',
    tierFit: 'diamond',
    channel: 'website',
    website: 'https://theaddressbarbershop.com',
    instagram: '@theaddressbarber',
  },
  {
    id: 'lead-30degrees-ksa',
    name: 'صالون 30 ديقريز',
    city: 'فروع المملكة',
    region: 'متعدد المناطق',
    tierFit: 'mixed',
    channel: 'email',
    phone: '920035655',
    email: 'info@30degrees.sa',
    instagram: '@30degreesbarbershop',
    website: 'https://30degrees.sa',
  },
  {
    id: 'lead-249-riyadh',
    name: 'صالون 249+ Barber',
    city: 'الرياض',
    region: 'الوسطى',
    tierFit: 'gold',
    channel: 'whatsapp',
    phone: '966563137432',
    instagram: '@249_barber_riyadh',
  },
  {
    id: 'lead-fadi-jeddah',
    name: 'صالون فادي',
    city: 'جدة',
    region: 'الغربية',
    tierFit: 'diamond',
    channel: 'whatsapp',
    phone: '966506622434',
    instagram: '@fadisalon',
  },
  {
    id: 'lead-groom-jeddah',
    name: 'ذا جروم',
    city: 'جدة',
    region: 'الغربية',
    tierFit: 'diamond',
    channel: 'whatsapp',
    phone: '966556677424',
    instagram: '@thegroomsa',
  },
  {
    id: 'lead-taper-khobar',
    name: 'تايبر أند فيد',
    city: 'الخبر',
    region: 'الشرقية',
    tierFit: 'gold',
    channel: 'whatsapp',
    phone: '966533122115',
    instagram: '@taperandfadesa',
  },
  {
    id: 'lead-vaz-madinah',
    name: 'صالون فاز',
    city: 'المدينة المنورة',
    region: 'المدينة',
    tierFit: 'gold',
    channel: 'whatsapp',
    phone: '966561118161',
    instagram: '@vaz_barber',
  },
  {
    id: 'lead-piccasso-riyadh',
    name: 'صالون بيكاسو',
    city: 'الرياض',
    region: 'الوسطى',
    tierFit: 'gold',
    channel: 'phone',
    phone: '966593782389',
    instagram: '@odao_',
  },
];

export function normalizePhoneForWa(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('966')) return digits;
  if (digits.startsWith('05') && digits.length === 10) return `966${digits.slice(1)}`;
  return digits;
}

export function buildWaDeepLink(phone: string, message: string): string {
  return `https://wa.me/${normalizePhoneForWa(phone)}?text=${encodeURIComponent(message)}`;
}
