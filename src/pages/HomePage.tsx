import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, Sparkles, BookOpen, Feather, Brain, Scroll, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { storeApi } from '@/lib/api';
import { BookCard } from '@/components/BookCard';
import { BookGridSkeleton } from '@/components/Skeletons';
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

const loadCategories = () => storeApi.categories();
const loadStats = () => storeApi.stats();
const loadBestsellers = async () => (await storeApi.catalog({ sort: 'popular', pageNumber: 1, pageSize: 5 })).items;
const loadNewReleases = async () => (await storeApi.catalog({ sort: 'newest', pageNumber: 1, pageSize: 5 })).items;
const loadAuthors = () => storeApi.authors();
const loadOffers = async () => (await storeApi.catalog({ sort: 'offers', onSale: true, pageNumber: 1, pageSize: 5 })).items;

export function HomePage() {
  const { lang, t } = useLanguage();
  const statsSection = useLazySection(loadStats, { bookCount: 0, authorCount: 0 });
  const categoriesSection = useLazySection<Category[]>(loadCategories, []);
  const bestsellersSection = useLazySection<Book[]>(loadBestsellers, []);
  const newReleasesSection = useLazySection<Book[]>(loadNewReleases, []);
  const authorsSection = useLazySection<Author[]>(loadAuthors, []);
  const offersSection = useLazySection<Book[]>(loadOffers, []);

  return (
    <div>
      {/* Hero */}
      <section ref={statsSection.ref} className="relative overflow-hidden bg-gradient-to-br from-navy-800 via-navy-900  text-ivory-50">
        <img
          src="/images/bookstore-hero.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover object-center"
          width="1680"
          height="944"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-navy-950/35" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-950/85 via-navy-950/55 to-navy-950/10 rtl:bg-gradient-to-l" aria-hidden="true" />
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
                  <p className="font-serif text-3xl font-bold text-gold-400 tabular-nums">
                    {statsSection.loaded ? `+${statsSection.data.bookCount.toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US')}` : '…'}
                  </p>
                  <p className="text-xs text-ivory-300">{lang === 'ar' ? 'كتاب متاح' : 'Available Books'}</p>
                </div>
                <div className="border-r border-navy-600"></div>
                <div>
                  <p className="font-serif text-3xl font-bold text-gold-400 tabular-nums">
                    {statsSection.loaded ? `+${statsSection.data.authorCount.toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US')}` : '…'}
                  </p>
                  <p className="text-xs text-ivory-300">{lang === 'ar' ? 'كاتب ومؤلف' : 'Authors'}</p>
                </div>
                <div className="border-r border-navy-600"></div>
                <div>
                  <p className="font-serif text-3xl font-bold text-gold-400">24h</p>
                  <p className="text-xs text-ivory-300">{lang === 'ar' ? 'توصيل سريع' : 'Fast Delivery'}</p>
                </div>
              </div>
            </div>

            <div className="hidden min-h-[24rem] md:block" aria-hidden="true" />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section ref={categoriesSection.ref} className="mx-auto min-h-[16rem] max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <SectionHeader title={t('home.categories.title')} subtitle={t('home.categories.subtitle')} />
        {!categoriesSection.loaded || categoriesSection.loading ? (
          <HorizontalSlider ariaLabel={t('home.categories.title')}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card h-36 w-[160px] shrink-0 snap-start skeleton sm:w-[180px]" />
            ))}
          </HorizontalSlider>
        ) : (
          <HorizontalSlider ariaLabel={t('home.categories.title')}>
            {categoriesSection.data.map((cat) => {
              const Icon = categoryIcons[cat.slug] || BookOpen;
              return (
                <Link
                  key={cat.id}
                  to={`/catalog?category=${cat.slug}`}
                  className="group card flex min-h-36 w-[160px] shrink-0 snap-start flex-col items-center justify-center gap-3 p-6 text-center transition-[border-color,box-shadow,transform] hover:-translate-y-1 hover:border-gold-300 hover:shadow-lg active:scale-[0.96] sm:w-[180px]"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-navy-800 text-gold-400 transition-colors group-hover:bg-burgundy-600">
                    <Icon className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy-800 transition-colors group-hover:text-burgundy-600">
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
          </HorizontalSlider>
        )}
      </section>

      {/* Bestsellers */}
      <section ref={bestsellersSection.ref} className="min-h-[32rem] bg-ivory-100 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader title={t('home.bestsellers.title')} subtitle={t('home.bestsellers.subtitle')} link="/catalog?sort=bestseller" linkText={t('common.viewAll')} />
          {!bestsellersSection.loaded || bestsellersSection.loading ? (
            <BookGridSkeleton count={5} />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {bestsellersSection.data.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* New Releases */}
      <section ref={newReleasesSection.ref} className="mx-auto min-h-[32rem] max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <SectionHeader title={t('home.newreleases.title')} subtitle={t('home.newreleases.subtitle')} link="/catalog?sort=newest" linkText={t('common.viewAll')} />
        {!newReleasesSection.loaded || newReleasesSection.loading ? (
          <BookGridSkeleton count={5} />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {newReleasesSection.data.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </section>

      {/* Featured Authors */}
      <section ref={authorsSection.ref} className="min-h-[17rem] bg-navy-800 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader title={t('home.authors.title')} subtitle={t('home.authors.subtitle')} dark />
          {!authorsSection.loaded || authorsSection.loading ? (
            <HorizontalSlider ariaLabel={t('home.authors.title')} dark>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-36 w-[140px] shrink-0 snap-start rounded-xl border border-navy-600 bg-navy-700/50 skeleton sm:w-[160px]" />
              ))}
            </HorizontalSlider>
          ) : (
            <HorizontalSlider ariaLabel={t('home.authors.title')} dark>
              {authorsSection.data.map((author) => (
                <Link
                  key={author.id}
                  to={`/catalog?author=${author.id}`}
                  className="group flex min-h-40 w-[140px] shrink-0 snap-start flex-col items-center justify-center gap-3 rounded-xl border border-navy-600 bg-navy-700/50 p-5 text-center transition-[border-color,background-color,transform] hover:-translate-y-1 hover:border-gold-400 hover:bg-navy-700 active:scale-[0.96] sm:w-[160px]"
                >
                  <AuthorAvatar
                    name={lang === 'ar' ? author.name_ar : (author.name_en || author.name_ar)}
                    photoUrl={author.photo_url}
                  />
                  <div>
                    <h3 className="text-sm font-semibold text-ivory-50 transition-colors group-hover:text-gold-400">
                      {lang === 'ar' ? author.name_ar : (author.name_en || author.name_ar)}
                    </h3>
                    {author.country && (
                      <p className="mt-0.5 text-xs text-ivory-300">{author.country}</p>
                    )}
                  </div>
                </Link>
              ))}
            </HorizontalSlider>
          )}
        </div>
      </section>

      {/* Special Offers */}
      <section
        ref={offersSection.ref}
        className={`mx-auto min-h-[32rem] max-w-7xl px-4 py-12 sm:px-6 lg:px-8 ${offersSection.loaded && offersSection.data.length === 0 ? 'hidden' : ''}`}
      >
        <SectionHeader title={t('home.offers.title')} subtitle={t('home.offers.subtitle')} link="/catalog?sort=offers" linkText={t('common.viewAll')} />
        {!offersSection.loaded || offersSection.loading ? (
          <BookGridSkeleton count={5} />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {offersSection.data.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function useLazySection<T>(loader: () => Promise<T>, initialValue: T) {
  const ref = useRef<HTMLElement>(null);
  const startedRef = useRef(false);
  const [state, setState] = useState({
    data: initialValue,
    loading: false,
    loaded: false,
    error: null as string | null,
  });

  useEffect(() => {
    const element = ref.current;
    if (!element || startedRef.current) return undefined;

    const load = async () => {
      if (startedRef.current) return;
      startedRef.current = true;
      setState((current) => ({ ...current, loading: true, error: null }));
      try {
        const data = await loader();
        setState({ data, loading: false, loaded: true, error: null });
      } catch (error) {
        setState((current) => ({
          ...current,
          loading: false,
          loaded: true,
          error: error instanceof Error ? error.message : 'Failed to load section',
        }));
      }
    };

    if (!("IntersectionObserver" in window)) {
      void load();
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        void load();
      },
      { rootMargin: '120px 0px', threshold: 0.01 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [loader]);

  return { ref, ...state };
}

function HorizontalSlider({ children, ariaLabel, dark }: { children: ReactNode; ariaLabel: string; dark?: boolean }) {
  const { lang } = useLanguage();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const isRtl = lang === 'ar';

  const scrollBy = (direction: 'prev' | 'next') => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = Math.max(el.clientWidth * 0.8, 240);
    const visualDirection = direction === 'next' ? 1 : -1;
    el.scrollBy({ left: (isRtl ? -visualDirection : visualDirection) * amount, behavior: 'smooth' });
  };

  const navButtonClass = dark
    ? 'border-navy-600 bg-navy-700/90 text-ivory-50 hover:bg-navy-600'
    : 'border-ivory-200 bg-white/90 text-navy-700 hover:bg-ivory-50';

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        role="region"
        aria-label={ariaLabel}
        tabIndex={0}
        className="no-scrollbar -my-2 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-1 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-4"
      >
        {children}
      </div>
      <button
        type="button"
        aria-label={isRtl ? `${ariaLabel}: العناصر السابقة` : `${ariaLabel}: previous items`}
        onClick={() => scrollBy('prev')}
        className={`absolute start-0 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border shadow-sm transition-[border-color,background-color,color,transform] active:scale-[0.96] sm:flex ${navButtonClass}`}
      >
        {isRtl ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
      </button>
      <button
        type="button"
        aria-label={isRtl ? `${ariaLabel}: العناصر التالية` : `${ariaLabel}: next items`}
        onClick={() => scrollBy('next')}
        className={`absolute end-0 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border shadow-sm transition-[border-color,background-color,color,transform] active:scale-[0.96] sm:flex ${navButtonClass}`}
      >
        {isRtl ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
      </button>
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

