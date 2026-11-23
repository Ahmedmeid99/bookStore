import type { Language, Currency } from '@/types/database';

export function formatPrice(amount: number, currency: Currency = 'EGP', lang: Language = 'ar'): string {
  const symbols: Record<Currency, string> = {
    EGP: lang === 'ar' ? 'ج.م' : 'EGP',
    USD: '$',
    EUR: '€',
    SAR: lang === 'ar' ? 'ر.س' : 'SAR',
  };
  const formatted = new Intl.NumberFormat(lang === 'ar' ? 'ar-EG' : 'en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
  return lang === 'ar' ? `${formatted} ${symbols[currency]}` : `${symbols[currency]} ${formatted}`;
}

export function slugify(text: string): string {
  return text
    .toString()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\u0600-\u06FFa-zA-Z0-9-]/g, '')
    .toLowerCase();
}

export function generateSlug(title: string): string {
  // For Arabic text, create a readable transliteration-free slug
  const cleaned = title
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\u0600-\u06FFa-zA-Z0-9-]/g, '')
    .toLowerCase();
  // If it's all Arabic, add a timestamp-based suffix to ensure uniqueness
  if (/^[\u0600-\u06FF-]+$/.test(cleaned)) {
    return `${cleaned.slice(0, 40)}-${Date.now().toString(36)}`;
  }
  return cleaned;
}

export function getEffectivePrice(book: { regular_price: number; sale_price: number | null }): number {
  return book.sale_price != null ? book.sale_price : book.regular_price;
}

export function getDiscountPercent(book: { regular_price: number; sale_price: number | null }): number {
  if (!book.sale_price || book.sale_price >= book.regular_price) return 0;
  return Math.round(((book.regular_price - book.sale_price) / book.regular_price) * 100);
}

export function validatePhone(phone: string): boolean {
  const clean = phone.replace(/[\s-]/g, '');
  return /^01[0-9]{9}$/.test(clean);
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function buildCoverUrl(book: { cover_url: string | null; title_ar: string }): string {
  if (book.cover_url) return book.cover_url;
  return ''; // Empty string triggers the placeholder component
}

export const EGYPT_GOVERNORATES = [
  'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'البحر الأحمر',
  'البحيرة', 'الفيوم', 'الغربية', 'الإسماعيلية', 'المنوفية',
  'المنيا', 'القليوبية', 'الوادي الجديد', 'السويس', 'أسوان',
  'أسيوط', 'بني سويف', 'بورسعيد', 'دمياط', 'الشرقية',
  'جنوب سيناء', 'كفر الشيخ', 'مطروح', 'الأقصر', 'قنا',
  'شمال سيناء', 'سوهاج',
];
