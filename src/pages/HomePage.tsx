import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Sparkles, BookOpen, Feather, Brain, Scroll, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { storeApi } from '@/lib/api';
import { BookCard } from '@/components/BookCard';
import { BookGridSkeleton } from '@/components/Skeletons';
import { BookCover } from '@/components/BookCover';
import { AuthorAvatar } from '@/components/AuthorAvatar';
import type { Book, Author, Category } from '@/types/database';

const categoryIcons: Record<string, typeof BookOpen> = {
  literature: BookOpen,
  poetry: Feather,
  philosophy: Brain,
  history: Scroll,
  religion: Sparkles,
  science: BookOpen,
  children: BookOpen,
  'self-help': TrendingUp,
};

export function HomePage() {
  const { lang, t } = useLanguage();
  const [featured, setFeatured] = useState<Book[]>([]);
  const [bestsellers, setBestsellers] = useState<Book[]>([]);
  const [newReleases, setNewReleases] = useState<Book[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [offers, setOffers] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const home = await storeApi.home();
        setFeatured(home.featured);
        setBestsellers(home.bestsellers);
        setNewReleases(home.newReleases);
        setAuthors(home.authors);
        setOffers(home.offers);
        setCategories(home.categories);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-800 via-navy-900 to-navy-800 text-ivory-50">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, #c8962f 0%, transparent 50%), radial-gradient(circle at 80% 80%, #7d263d 0%, transparent 50%)'
        }} />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
            <div className="space-y-6 animate-slide-up">
              <span className="badge bg-gold-400/20 text-gold-400 border border-gold-400/30">
                <Sparkles className="h-3 w-3" />
                {lang === 'ar' ? 'مكتبة عربية أصيلة' : 'Authentic Arabic Library'}
              </span>
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-balance">
                {t('home.hero.title')}
              </h1>
              <p className="text-lg text-ivory-200 leading-relaxed max-w-lg">
                {t('home.hero.subtitle')}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/catalog" className="btn-accent">
                  {t('home.hero.cta')}
                  <ArrowLeft className={`h-4 w-4 ${lang === 'ar' ? '' : 'rotate-180'}`} />
                </Link>
                <Link to="/catalog?category=literature" className="btn-secondary !bg-transparent !border-ivory-300 !text-ivory-50 hover:!bg-ivory-50/10">
                  {lang === 'ar' ? 'تصفح الروايات' : 'Browse Novels'}
                </Link>
              </div>
              <div className="flex gap-6 pt-4">
                <div>
                  <p className="font-serif text-3xl font-bold text-gold-400">+5000</p>
                  <p className="text-xs text-ivory-300">{lang === 'ar' ? 'كتاب عربي' : 'Arabic Books'}</p>
                </div>
                <div className="border-r border-navy-600"></div>
                <div>
                  <p className="font-serif text-3xl font-bold text-gold-400">+200</p>
                  <p className="text-xs text-ivory-300">{lang === 'ar' ? 'كاتب ومؤلف' : 'Authors'}</p>
                </div>
                <div className="border-r border-navy-600"></div>
                <div>
                  <p className="font-serif text-3xl font-bold text-gold-400">24h</p>
                  <p className="text-xs text-ivory-300">{lang === 'ar' ? 'توصيل سريع' : 'Fast Delivery'}</p>
                </div>
              </div>
            </div>

            {/* Featured books preview */}
            <div className="relative hidden md:block">
              <div className="grid grid-cols-3 gap-3">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="aspect-[3/4] skeleton rounded-lg" style={{ transform: `translateY(${i * 20}px)` }} />
                  ))
                ) : (
                  featured.slice(0, 3).map((book, i) => (
                    <Link
                      key={book.id}
                      to={`/book/${book.slug}`}
                      className="group block aspect-[3/4] overflow-hidden rounded-lg shadow-2xl transition-transform hover:-translate-y-2"
                      style={{ transform: `translateY(${i * 20}px)` }}
                    >
                      <BookCover coverUrl={book.cover_url} title={book.title_ar} className="h-full w-full" />
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <SectionHeader title={t('home.categories.title')} subtitle={t('home.categories.subtitle')} />
        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="card h-32 skeleton" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {categories.map((cat) => {
              const Icon = categoryIcons[cat.slug] || BookOpen;
              return (
                <Link
                  key={cat.id}
                  to={`/catalog?category=${cat.slug}`}
                  className="group card flex flex-col items-center justify-center gap-3 p-6 text-center transition-all hover:shadow-lg hover:-translate-y-1 hover:border-gold-300"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-navy-800 text-gold-400 transition-colors group-hover:bg-burgundy-600">
                    <Icon className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy-800 group-hover:text-burgundy-600 transition-colors">
                      {lang === 'ar' ? cat.name_ar : (cat.name_en || cat.name_ar)}
                    </h3>
                    {cat.description_ar && (
                      <p className="mt-1 text-xs text-navy-400 line-clamp-1">
                        {lang === 'ar' ? cat.description_ar : cat.description_ar}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Bestsellers */}
      <section className="bg-ivory-100 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader title={t('home.bestsellers.title')} subtitle={t('home.bestsellers.subtitle')} link="/catalog?sort=bestseller" linkText={t('common.viewAll')} />
          {loading ? (
            <BookGridSkeleton count={5} />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {bestsellers.slice(0, 5).map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* New Releases */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <SectionHeader title={t('home.newreleases.title')} subtitle={t('home.newreleases.subtitle')} link="/catalog?sort=newest" linkText={t('common.viewAll')} />
        {loading ? (
          <BookGridSkeleton count={5} />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {newReleases.slice(0, 5).map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </section>

      {/* Featured Authors */}
      <section className="bg-navy-800 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader title={t('home.authors.title')} subtitle={t('home.authors.subtitle')} dark />
          {loading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="card h-32 skeleton" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
              {authors.map((author) => (
                <Link
                  key={author.id}
                  to={`/catalog?author=${author.id}`}
                  className="group flex flex-col items-center gap-3 rounded-xl border border-navy-600 bg-navy-700/50 p-5 text-center transition-[border-color,background-color] hover:border-gold-400 hover:bg-navy-700"
                >
                  <AuthorAvatar
                    name={lang === 'ar' ? author.name_ar : (author.name_en || author.name_ar)}
                    photoUrl={author.photo_url}
                  />
                  <div>
                    <h3 className="font-semibold text-ivory-50 group-hover:text-gold-400 transition-colors text-sm">
                      {lang === 'ar' ? author.name_ar : (author.name_en || author.name_ar)}
                    </h3>
                    {author.country && (
                      <p className="mt-0.5 text-xs text-ivory-300">{author.country}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Special Offers */}
      {offers.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <SectionHeader title={t('home.offers.title')} subtitle={t('home.offers.subtitle')} link="/catalog?sort=offers" linkText={t('common.viewAll')} />
          {loading ? (
            <BookGridSkeleton count={5} />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {offers.slice(0, 5).map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function SectionHeader({ title, subtitle, link, linkText, dark }: { title: string; subtitle?: string; link?: string; linkText?: string; dark?: boolean }) {
  const { lang } = useLanguage();
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h2 className={`font-serif text-2xl font-bold md:text-3xl ${dark ? 'text-ivory-50' : 'text-navy-900'}`}>{title}</h2>
        {subtitle && <p className={`mt-1 text-sm ${dark ? 'text-ivory-200' : 'text-navy-500'}`}>{subtitle}</p>}
      </div>
      {link && linkText && (
        <Link to={link} className={`flex items-center gap-1 text-sm font-medium ${dark ? 'text-gold-400 hover:text-gold-300' : 'text-burgundy-600 hover:text-burgundy-700'} whitespace-nowrap`}>
          {linkText}
          <ArrowLeft className={`h-4 w-4 ${lang === 'ar' ? '' : 'rotate-180'}`} />
        </Link>
      )}
    </div>
  );
}

