import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart, Heart, Share2, Minus, Plus, Check, Star,
  BookOpen, Calendar, Building2, Globe, Hash, FileText, Package, Truck, ShieldCheck,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { storeApi } from '@/lib/api';
import { formatPrice, getEffectivePrice, getDiscountPercent } from '@/lib/utils';
import { BookCover } from '@/components/BookCover';
import { StarRating } from '@/components/StarRating';
import { BookCard } from '@/components/BookCard';
import { AuthorAvatar } from '@/components/AuthorAvatar';
import type { Book, Review } from '@/types/database';

export function BookDetailsPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { lang, currency, t } = useLanguage();
  const { addItem } = useCart();
  const { user } = useAuth();
  const { success, warning, error: showError } = useToast();
  const { addToWishlist, removeFromWishlist } = useWishlist();

  const [book, setBook] = useState<Book | null>(null);
  const [related, setRelated] = useState<Book[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [inWishlist, setInWishlist] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', body: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [userReview, setUserReview] = useState<Review | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    (async () => {
      try {
        const details = await storeApi.book(slug);
        setBook(details.book);
        setRelated(details.related);
        setReviews(details.reviews);
        setUserReview(details.userReview);
        setInWishlist(details.inWishlist);
      } catch {
        setBook(null);
        setRelated([]);
        setReviews([]);
        setUserReview(null);
        setInWishlist(false);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug, user]);

  // JSON-LD structured data
  useEffect(() => {
    if (!book) return;
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Book',
      name: book.title_ar,
      author: book.authors?.map((a) => ({ '@type': 'Person', name: a.name_ar })),
      isbn: book.isbn_13 || book.isbn_10,
      publisher: { '@type': 'Organization', name: book.publisher },
      datePublished: book.publication_year,
      numberOfPages: book.page_count,
      inLanguage: book.language,
      offers: { '@type': 'Offer', price: getEffectivePrice(book), priceCurrency: 'EGP', availability: book.stock_quantity > 0 ? 'InStock' : 'OutOfStock' },
      aggregateRating: { '@type': 'AggregateRating', ratingValue: book.average_rating, reviewCount: book.rating_count },
    });
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, [book]);

  const handleAddToCart = async () => {
    if (!user) { navigate('/login'); return; }
    if (book && book.stock_quantity > 0) {
      await addItem(book.id, quantity);
    }
  };

  const handleBuyNow = async () => {
    if (!user) { navigate('/login'); return; }
    if (book && book.stock_quantity > 0) {
      await addItem(book.id, quantity);
      navigate('/checkout');
    }
  };

  const handleWishlist = async () => {
    if (!user) { navigate('/login'); return; }
    if (!book) return;

    try {
      if (inWishlist) {
        setInWishlist(false);
        await removeFromWishlist(book.id);
        success(lang === 'ar' ? 'تمت الإزالة من المفضلة' : 'Removed from wishlist');
      } else {
        setInWishlist(true);
        await addToWishlist(book.id);
        success(lang === 'ar' ? 'تمت الإضافة إلى المفضلة' : 'Added to wishlist');
      }
    } catch (error) {
      setInWishlist((current) => !current);
      showError(error instanceof Error ? error.message : (lang === 'ar' ? 'تعذّر تحديث المفضلة' : 'Failed to update wishlist'));
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: book?.title_ar, url });
      } else {
        await navigator.clipboard.writeText(url);
        success(lang === 'ar' ? 'تم نسخ الرابط' : 'Link copied');
      }
    } catch {
      // Sharing can be cancelled by the user.
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !book) return;
    if (userReview) {
      warning(lang === 'ar' ? 'لقد قمت بتقييم هذا الكتاب بالفعل' : 'You have already reviewed this book');
      return;
    }
    setSubmittingReview(true);
    try {
      const review = await storeApi.reviews.create(book.id, reviewForm.rating, reviewForm.title, reviewForm.body);
      setReviews((previous) => [review, ...previous]);
      setUserReview(review);
      setReviewForm({ rating: 5, title: '', body: '' });
      success(lang === 'ar' ? 'تم نشر تقييمك' : 'Your review has been published');
    } catch (error) {
      showError(error instanceof Error ? error.message : (lang === 'ar' ? 'تعذّر إرسال التقييم' : 'Failed to submit review'));
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="aspect-[3/4] max-w-sm skeleton rounded-xl" />
          <div className="space-y-4">
            <div className="h-8 w-3/4 skeleton" />
            <div className="h-4 w-1/2 skeleton" />
            <div className="h-20 w-full skeleton" />
            <div className="h-10 w-1/3 skeleton" />
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <BookOpen className="mx-auto h-16 w-16 text-navy-300" />
        <h1 className="mt-4 text-xl font-semibold text-navy-700">{lang === 'ar' ? 'الكتاب غير موجود' : 'Book not found'}</h1>
        <Link to="/catalog" className="btn-primary mt-4">{t('nav.catalog')}</Link>
      </div>
    );
  }

  const price = getEffectivePrice(book);
  const discount = getDiscountPercent(book);
  const authorName = book.authors?.[0] ? (lang === 'ar' ? book.authors[0].name_ar : (book.authors[0].name_en || book.authors[0].name_ar)) : '';

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-navy-500">
        <Link to="/" className="hover:text-navy-700">{t('nav.home')}</Link>
        <span>/</span>
        <Link to="/catalog" className="hover:text-navy-700">{t('nav.catalog')}</Link>
        {book.categories?.[0] && (
          <>
            <span>/</span>
            <Link to={`/catalog?category=${book.categories[0].slug}`} className="hover:text-navy-700">
              {lang === 'ar' ? book.categories[0].name_ar : (book.categories[0].name_en || book.categories[0].name_ar)}
            </Link>
          </>
        )}
      </nav>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
        {/* Cover */}
        <div className="md:col-span-4 lg:col-span-3">
          <div className="sticky top-24 space-y-4">
            <div className="aspect-[3/4] overflow-hidden rounded-xl shadow-lg">
              <BookCover coverUrl={book.cover_url} title={book.title_ar} className="h-full w-full" />
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="card p-2">
                <Truck className="mx-auto h-4 w-4 text-navy-600 mb-1" />
                <span className="text-navy-600">{lang === 'ar' ? 'شحن سريع' : 'Fast Shipping'}</span>
              </div>
              <div className="card p-2">
                <ShieldCheck className="mx-auto h-4 w-4 text-navy-600 mb-1" />
                <span className="text-navy-600">{lang === 'ar' ? 'دفع آمن' : 'Secure Payment'}</span>
              </div>
              <div className="card p-2">
                <Package className="mx-auto h-4 w-4 text-navy-600 mb-1" />
                <span className="text-navy-600">{lang === 'ar' ? 'تغليف مميز' : 'Quality Packaging'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="md:col-span-8 lg:col-span-9 space-y-6">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              {book.bestseller && <span className="badge bg-gold-100 text-gold-700">{lang === 'ar' ? 'الأكثر مبيعًا' : 'Bestseller'}</span>}
              {book.featured && <span className="badge bg-burgundy-100 text-burgundy-700">{lang === 'ar' ? 'مميز' : 'Featured'}</span>}
              {discount > 0 && <span className="badge bg-burgundy-600 text-ivory-50">-{discount}%</span>}
            </div>
            <h1 className="font-serif text-2xl font-bold text-navy-900 md:text-3xl">
              {lang === 'ar' ? book.title_ar : (book.title_en || book.title_ar)}
            </h1>
            {book.title_en && lang === 'ar' && (
              <p className="mt-1 text-sm text-navy-400" dir="ltr">{book.title_en}</p>
            )}
            {authorName && (
              <Link to={`/catalog?author=${book.authors![0].id}`} className="mt-3 inline-flex items-center gap-2 text-burgundy-600 transition-colors hover:text-burgundy-700 font-medium">
                <AuthorAvatar name={authorName} photoUrl={book.authors![0].photo_url} className="h-10 w-10 text-sm" />
                <span>
                  {authorName}
                  {book.authors && book.authors.length > 1 && ` +${book.authors.length - 1}`}
                </span>
              </Link>
            )}
            <div className="mt-3 flex items-center gap-3">
              <StarRating rating={book.average_rating} size="md" showNumber count={book.rating_count} />
            </div>
          </div>

          {/* Price */}
          <div className="card p-4">
            <div className="flex items-baseline gap-3">
              <span className="font-serif text-3xl font-bold text-burgundy-700">{formatPrice(price, currency, lang)}</span>
              {discount > 0 && (
                <span className="text-lg text-navy-400 line-through">{formatPrice(book.regular_price, currency, lang)}</span>
              )}
              {discount > 0 && (
                <span className="badge bg-success-50 text-success-700">
                  {lang === 'ar' ? `وفّر ${formatPrice(book.regular_price - price, currency, lang)}` : `Save ${formatPrice(book.regular_price - price, currency, lang)}`}
                </span>
              )}
            </div>
            <div className="mt-2 flex items-center gap-2">
              {book.stock_quantity > 0 ? (
                <>
                  <Check className="h-4 w-4 text-success-600" />
                  <span className="text-sm font-medium text-success-700">
                    {book.stock_quantity <= 5 ? t('common.lowStock') : t('common.inStock')}
                  </span>
                </>
              ) : (
                <span className="text-sm font-medium text-error-600">{t('common.outOfStock')}</span>
              )}
            </div>
          </div>

          {/* Quantity + Actions */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-navy-700">{t('common.quantity')}</label>
              <div className="flex items-center rounded-lg border border-ivory-300 bg-white">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 text-navy-600 hover:bg-ivory-100 rounded-r-lg" aria-label="Decrease">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-4 py-2 font-semibold text-navy-800 min-w-[48px] text-center">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(book.stock_quantity, quantity + 1))} className="p-2 text-navy-600 hover:bg-ivory-100 rounded-l-lg" aria-label="Increase">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={handleAddToCart} disabled={book.stock_quantity <= 0} className="btn-primary flex-1">
                <ShoppingCart className="h-4 w-4" />
                {t('common.addToCart')}
              </button>
              <button onClick={handleBuyNow} disabled={book.stock_quantity <= 0} className="btn-accent flex-1">
                {t('common.buyNow')}
              </button>
              <button onClick={handleWishlist} className={`btn-secondary !px-3 ${inWishlist ? 'text-burgundy-600' : ''}`} aria-label={t('nav.wishlist')}>
                <Heart className={`h-4 w-4 ${inWishlist ? 'fill-burgundy-600' : ''}`} />
              </button>
              <button onClick={handleShare} className="btn-secondary !px-3" aria-label={t('common.share')}>
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Description */}
          {book.description_ar && (
            <div>
              <h2 className="font-semibold text-navy-800 mb-2">{lang === 'ar' ? 'نبذة عن الكتاب' : 'Description'}</h2>
              <p className="text-navy-600 leading-relaxed whitespace-pre-line">
                {lang === 'ar' ? book.description_ar : (book.description_en || book.description_ar)}
              </p>
            </div>
          )}

          {/* Details */}
          <div className="card p-4">
            <h2 className="font-semibold text-navy-800 mb-3">{lang === 'ar' ? 'تفاصيل الكتاب' : 'Book Details'}</h2>
            <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {book.publisher && <DetailRow icon={Building2} label={lang === 'ar' ? 'الناشر' : 'Publisher'} value={book.publisher} />}
              {book.publication_year && <DetailRow icon={Calendar} label={lang === 'ar' ? 'سنة النشر' : 'Published'} value={String(book.publication_year)} />}
              {book.language && <DetailRow icon={Globe} label={lang === 'ar' ? 'اللغة' : 'Language'} value={book.language === 'ara' ? (lang === 'ar' ? 'العربية' : 'Arabic') : book.language} />}
              {book.page_count && <DetailRow icon={FileText} label={lang === 'ar' ? 'عدد الصفحات' : 'Pages'} value={String(book.page_count)} />}
              {book.isbn_10 && <DetailRow icon={Hash} label="ISBN-10" value={book.isbn_10} />}
              {book.isbn_13 && <DetailRow icon={Hash} label="ISBN-13" value={book.isbn_13} />}
            </dl>
          </div>

          {/* Reviews */}
          <div>
            <h2 className="font-semibold text-navy-800 mb-4">{t('common.reviews')} ({reviews.length})</h2>

            {/* Review form */}
            {user && !userReview && (
              <form onSubmit={handleSubmitReview} className="card p-4 mb-4 space-y-3">
                <h3 className="font-medium text-navy-800">{lang === 'ar' ? 'اكتب تقييمك' : 'Write a Review'}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-navy-600">{lang === 'ar' ? 'التقييم:' : 'Rating:'}</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" onClick={() => setReviewForm({ ...reviewForm, rating: star })}>
                      <Star className={`h-6 w-6 ${star <= reviewForm.rating ? 'fill-gold-400 text-gold-400' : 'text-ivory-300'}`} />
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder={lang === 'ar' ? 'عنوان التقييم' : 'Review title'}
                  value={reviewForm.title}
                  onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                  className="input-field"
                />
                <textarea
                  placeholder={lang === 'ar' ? 'اكتب رأيك في الكتاب...' : 'Write your review...'}
                  value={reviewForm.body}
                  onChange={(e) => setReviewForm({ ...reviewForm, body: e.target.value })}
                  rows={4}
                  className="input-field resize-none"
                />
                <button type="submit" disabled={submittingReview} className="btn-primary">
                  {submittingReview ? t('common.loading') : (lang === 'ar' ? 'نشر التقييم' : 'Submit Review')}
                </button>
              </form>
            )}
            {!user && (
              <div className="card p-4 mb-4 text-center text-sm text-navy-500">
                <Link to="/login" className="text-burgundy-600 font-medium">{t('nav.login')}</Link>
                {' '}{lang === 'ar' ? 'لكتابة تقييم' : 'to write a review'}
              </div>
            )}

            {/* Review list */}
            {reviews.length === 0 ? (
              <div className="card p-6 text-center text-navy-400 text-sm">
                {lang === 'ar' ? 'لا توجد تقييمات بعد. كن أول من يقيّم هذا الكتاب!' : 'No reviews yet. Be the first to review!'}
              </div>
            ) : (
              <div className="space-y-3">
                {reviews.map((rev) => (
                  <div key={rev.id} className="card p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-200 text-navy-700 text-xs font-bold">
                          {(rev.profiles?.display_name || 'U').charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-navy-800">{rev.profiles?.display_name || lang === 'ar' ? 'مستخدم' : 'User'}</p>
                          <StarRating rating={rev.rating} size="sm" />
                        </div>
                      </div>
                      <span className="text-xs text-navy-400">{new Date(rev.created_at).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')}</span>
                    </div>
                    {rev.title && <h4 className="font-medium text-navy-800 text-sm">{rev.title}</h4>}
                    {rev.body && <p className="text-sm text-navy-600 mt-1">{rev.body}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related books */}
      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="font-serif text-xl font-bold text-navy-900 mb-4">{t('common.related')}</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {related.map((b) => <BookCard key={b.id} book={b} />)}
          </div>
        </section>
      )}
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }: { icon: typeof BookOpen; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className="h-4 w-4 text-navy-400 shrink-0" />
      <dt className="text-navy-500">{label}:</dt>
      <dd className="font-medium text-navy-800">{value}</dd>
    </div>
  );
}
