import { useNavigate, Link } from 'react-router-dom';
import { X, ShoppingBag, Trash2, Plus, Minus, Tag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatPrice, getEffectivePrice } from '@/lib/utils';
import { BookCover } from './BookCover';

export function CartDrawer() {
  const { items, cartOpen, setCartOpen, updateQuantity, removeItem, subtotal, itemCount, total, shippingCost, discount } = useCart();
  const { lang, currency, t } = useLanguage();
  const navigate = useNavigate();

  if (!cartOpen) return null;

  const handleCheckout = () => {
    setCartOpen(false);
    navigate('/checkout');
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-navy-900/50 animate-fade-in"
        onClick={() => setCartOpen(false)}
      />
      <div className={`fixed top-0 ${lang === 'ar' ? 'left-0' : 'right-0'} z-50 flex h-full w-full max-w-md flex-col bg-ivory-50 shadow-2xl animate-slide-in-right`}>
        <div className="flex items-center justify-between border-b border-ivory-200 bg-navy-800 px-5 py-4 text-ivory-50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            <h2 className="font-bold">{t('cart.title')} ({itemCount})</h2>
          </div>
          <button
            onClick={() => setCartOpen(false)}
            className="rounded-lg p-1.5 transition-colors hover:bg-navy-700"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
            <ShoppingBag className="h-16 w-16 text-ivory-300" />
            <p className="font-semibold text-navy-700">{t('cart.empty')}</p>
            <p className="text-sm text-navy-400">{t('cart.empty.desc')}</p>
            <button
              onClick={() => { setCartOpen(false); navigate('/catalog'); }}
              className="btn-primary mt-2"
            >
              {t('cart.continueShopping')}
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex flex-col gap-3">
                {items.map((item) => {
                  const price = getEffectivePrice(item.book!);
                  return (
                    <div key={item.id} className="card flex gap-3 p-3">
                      <Link to={`/book/${item.book?.slug}`} onClick={() => setCartOpen(false)} className="shrink-0">
                        <BookCover coverUrl={item.book?.cover_url || null} title={item.book?.title_ar || ''} className="h-20 w-16 rounded-lg" />
                      </Link>
                      <div className="flex flex-1 flex-col">
                        <h4 className="text-sm font-semibold text-navy-800 line-clamp-2">
                          {lang === 'ar' ? item.book?.title_ar : (item.book?.title_en || item.book?.title_ar)}
                        </h4>
                        <p className="mt-0.5 text-xs text-burgundy-700 font-bold">
                          {formatPrice(price, currency, lang)}
                        </p>
                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center gap-1 rounded-lg border border-ivory-300 bg-white">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-1.5 text-navy-600 hover:bg-ivory-100 rounded-r-lg"
                              aria-label="Decrease"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="px-2 text-sm font-semibold text-navy-800 min-w-[24px] text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1.5 text-navy-600 hover:bg-ivory-100 rounded-l-lg"
                              aria-label="Increase"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-error-500 hover:text-error-700 p-1"
                            aria-label={t('cart.removeItem')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-ivory-200 bg-white p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-navy-600">{t('common.subtotal')}</span>
                <span className="font-semibold text-navy-800">{formatPrice(subtotal, currency, lang)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-navy-600 flex items-center gap-1"><Tag className="h-3 w-3" />{t('cart.discount')}</span>
                  <span className="font-semibold text-success-600">-{formatPrice(discount, currency, lang)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-navy-600">{t('cart.shipping')}</span>
                <span className="font-semibold text-navy-800">{shippingCost === 0 ? (lang === 'ar' ? 'مجاني' : 'Free') : formatPrice(shippingCost, currency, lang)}</span>
              </div>
              <div className="flex justify-between border-t border-ivory-200 pt-2">
                <span className="font-bold text-navy-900">{t('common.total')}</span>
                <span className="font-bold text-burgundy-700 text-lg">{formatPrice(total, currency, lang)}</span>
              </div>
              <button
                onClick={handleCheckout}
                className="btn-accent w-full mt-2"
              >
                {t('cart.checkout')}
              </button>
              <button
                onClick={() => { setCartOpen(false); navigate('/cart'); }}
                className="btn-ghost w-full"
              >
                {t('cart.title')}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
