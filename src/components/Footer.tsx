import { Link } from 'react-router-dom';
import { BookOpen, Phone, Facebook, Linkedin, Send } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';
import { useState } from 'react';

export function Footer() {
  const { lang, t } = useLanguage();
  const { success } = useToast();
  const [email, setEmail] = useState('');

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      success(lang === 'ar' ? 'شكرًا لاشتراكك في نشرتنا!' : 'Thank you for subscribing!');
      setEmail('');
    }
  };

  return (
    <footer className="bg-navy-900 text-ivory-100 mt-16">
      {/* Newsletter */}
      <div className="border-b border-navy-700">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-right">
            <div>
              <h3 className="text-xl font-bold text-gold-400">{t('home.newsletter.title')}</h3>
              <p className="mt-1 text-sm text-ivory-200">{t('home.newsletter.subtitle')}</p>
            </div>
            <form onSubmit={handleNewsletter} className="flex w-full max-w-md gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('home.newsletter.placeholder')}
                className="flex-1 rounded-lg border border-navy-600 bg-navy-800 px-4 py-2.5 text-sm text-ivory-50 placeholder:text-ivory-300 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/30 outline-none"
              />
              <button type="submit" className="btn-accent shrink-0">
                <Send className="h-4 w-4" />
                {t('home.newsletter.button')}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* About */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold-400 text-navy-900">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <span className="font-serif text-lg font-bold text-ivory-50">{lang === 'ar' ? 'متجر الكتب' : 'Book Store'}</span>
              </div>
            </div>
            <p className="text-sm text-ivory-200 leading-relaxed">{t('footer.about.desc')}</p>
            <div className="flex gap-3 pt-2">
              <a href="https://www.facebook.com/profile.php?id=61591450438439" target="_blank" rel="noopener noreferrer" className="rounded-lg bg-navy-700 p-2 text-ivory-200 transition-colors hover:bg-navy-600 hover:text-gold-400" aria-label="Facebook">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="https://www.linkedin.com/in/ahmed-eid-267543225/" target="_blank" rel="noopener noreferrer" className="rounded-lg bg-navy-700 p-2 text-ivory-200 transition-colors hover:bg-navy-600 hover:text-gold-400" aria-label="LinkedIn">
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-semibold text-gold-400 mb-3">{t('footer.links')}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="text-ivory-200 hover:text-gold-400 transition-colors">{t('nav.home')}</Link></li>
              <li><Link to="/catalog" className="text-ivory-200 hover:text-gold-400 transition-colors">{t('nav.catalog')}</Link></li>
              <li><Link to="/catalog?sort=bestseller" className="text-ivory-200 hover:text-gold-400 transition-colors">{t('home.bestsellers.title')}</Link></li>
              <li><Link to="/account" className="text-ivory-200 hover:text-gold-400 transition-colors">{t('account.title')}</Link></li>
              <li><Link to="/account/orders" className="text-ivory-200 hover:text-gold-400 transition-colors">{t('account.orders')}</Link></li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="font-semibold text-gold-400 mb-3">{t('footer.help')}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/catalog" className="text-ivory-200 hover:text-gold-400 transition-colors">{lang === 'ar' ? 'سياسة الشحن' : 'Shipping Policy'}</Link></li>
              <li><Link to="/catalog" className="text-ivory-200 hover:text-gold-400 transition-colors">{lang === 'ar' ? 'الإرجاع والاستبدال' : 'Returns & Exchange'}</Link></li>
              <li><Link to="/catalog" className="text-ivory-200 hover:text-gold-400 transition-colors">{lang === 'ar' ? 'الأسئلة الشائعة' : 'FAQ'}</Link></li>
              <li><Link to="/catalog" className="text-ivory-200 hover:text-gold-400 transition-colors">{lang === 'ar' ? 'شروط الاستخدام' : 'Terms of Use'}</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-gold-400 mb-3">{t('footer.contact')}</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gold-400 shrink-0" />
                <a href="tel:+201095814411" className="text-ivory-200 transition-colors hover:text-gold-400" dir="ltr">+20 109 581 4411</a>
              </li>
              <li className="flex items-center gap-2">
                <Linkedin className="h-4 w-4 text-gold-400 shrink-0" />
                <a href="https://www.linkedin.com/in/ahmed-eid-267543225/" target="_blank" rel="noopener noreferrer" className="text-ivory-200 transition-colors hover:text-gold-400">LinkedIn</a>
              </li>
              <li className="flex items-center gap-2">
                <Facebook className="h-4 w-4 text-gold-400 shrink-0" />
                <a href="https://www.facebook.com/profile.php?id=61591450438439" target="_blank" rel="noopener noreferrer" className="text-ivory-200 transition-colors hover:text-gold-400">Facebook</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-navy-700">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-ivory-300">
          <p>© {new Date().getFullYear()} {lang === 'ar' ? 'متجر الكتب' : 'Book Store'} — {t('footer.rights')}</p>
          <p>{lang === 'ar' ? 'صُنع بحب في مصر' : 'Made with love in Egypt'}</p>
        </div>
      </div>
    </footer>
  );
}
