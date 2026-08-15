/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { ROUTE_PATHS } from '@/lib/routePaths';

export const COIFFEUR_WUDD_NAME_AR = 'ود' as const;
export const COIFFEUR_WUDD_ROLE_AR = 'وكيلة استعلام كوافير ماب' as const;
export const COIFFEUR_WUDD_CHAT_API = '/api/public-coiffeur-wudd-chat' as const;

export const COIFFEUR_WUDD_PITCH_LINES_AR = [
  'أشرح فكرة كوافير ماب ونظام الاستجابة الذكية — بلا عقد من هنا.',
  'الاستعلام للمستعلمة مجاني بلا حساب. الظهور عند الطلب لا قائمة دائمة.',
  'كوافير ماب سطح قطاعي تحت مظلة حلاق ماب — ليست علامة منافسة.',
  'هذه الصفحة اهتمام ومتابعة. مسار تسجيل الحساب لم يُفتح للتعاقد بعد.',
] as const;

export const COIFFEUR_WUDD_QUICK_TOPICS = [
  { id: 'idea', label: 'ما هي المنصة', prompt: 'ما فكرة كوافير ماب وما علاقتها بحلاق ماب؟' },
  { id: 'smart', label: 'الاستجابة الذكية', prompt: 'اشرحي نظام الاستجابة الذكية وكيف يظهر المشغل عند الطلب.' },
  { id: 'inquiry', label: 'الاستعلام', prompt: 'كيف يعمل استعلام المستعلمة وهل أحتاج حساباً؟' },
  { id: 'interest', label: 'هذه الصفحة', prompt: 'ما الغرض من صفحة الاهتمام وهل هي عقد أو تسجيل حساب؟' },
] as const;

export function coiffeurWuddGreetingAr(): string {
  const hour = new Date().getHours();
  const hello = hour < 12 ? 'صباح الخير' : 'مساء الخير';
  return `${hello}.

أنا ${COIFFEUR_WUDD_NAME_AR} — ${COIFFEUR_WUDD_ROLE_AR}.

أشرح فكرة المشروع ونظام الاستجابة الذكية، وأجيب في حدود ما هو معتمد. لا عقود من هنا، ولا أجمع بيانات في الشات.

أي جزء تريدين أن أوضّحه؟`;
}

export const COIFFEUR_WUDD_INQUIRE_PATH = ROUTE_PATHS.COIFFEUR_INQUIRE;
export const COIFFEUR_WUDD_INTEREST_PATH = ROUTE_PATHS.COIFFEUR_INTEREST;
