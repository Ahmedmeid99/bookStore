import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, Tag, X, ArrowLeft, ShoppingBag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatPrice, getEffectivePrice } from '@/lib/utils';
import { BookCover } from '@/components/BookCover';

export function CartPage() {
  const { items, updateQuantity, removeItem, subtotal, total, shippingCost, discount, couponCode, applyCoupon, removeCoupon, clearCart } = useCart();
  const { lang, currency, t } = useLanguage();
  const navigate = useNavigate();
  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const handleCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const result = await applyCoupon(couponInput);
    setCouponMsg({ ok: result.success, text: result.message });
    if (result.success) setCouponInput('');
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <ShoppingBag className="mx-auto h-20 w-20 text-ivory-300" />
        <h1 className="mt-4 font-serif text-2xl font-bold text-navy-800">{t('cart.empty')}</h1>
        <p className="mt-2 text-navy-400">{t('cart.empty.desc')}</p>
        <Link to="/catalog" className="btn-primary mt-6">
          {t('cart.continueShopping')}
          <ArrowLeft className={`h-4 w-4 ${lang === 'ar' ? '' : 'rotate-180'}`} />
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-serif text-2xl font-bold text-navy-900 mb-6">{t('cart.title')}</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => {
            const price = getEffectivePrice(item.book!);
            return (
              <div key={item.id} className="card flex gap-4 p-4">
                <Link to={`/book/${item.book?.slug}`} className="shrink-0">
                  <BookCover coverUrl={item.book?.cover_url || null} title={item.book?.title_ar || ''} className="h-28 w-20 rounded-lg" />
                </Link>
                <div className="flex flex-1 flex-col">
                  <Link to={`/book/${item.book?.slug}`}>
                    <h3 className="font-semibold text-navy-800 hover:text-burgundy-600 transition-colors">
                      {lang === 'ar' ? item.book?.title_ar : (item.book?.title_en || item.book?.title_ar)}
                    </h3>
                  </Link>
                  {item.book?.authors?.[0] && (
                    <p className="mt-0.5 text-sm text-navy-500">
                      {lang === 'ar' ? item.book.authors[0].name_ar : (item.book.authors[0].name_en || item.book.authors[0].name_ar)}
                    </p>
                  )}
                  <p className="mt-1 font-bold text-burgundy-700">{formatPrice(price, currency, lang)}</p>
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <div className="flex items-center rounded-lg border border-ivory-300 bg-white">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-2 text-navy-600 hover:bg-ivory-100 rounded-r-lg" aria-label="Decrease">
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="px-3 py-1.5 text-sm font-semibold text-navy-800 min-w-[40px] text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-2 text-navy-600 hover:bg-ivory-100 rounded-l-lg" aria-label="Increase">
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-navy-800">{formatPrice(price * item.quantity, currency, lang)}</span>
                      <button onClick={() => removeItem(item.id)} className="text-error-500 hover:text-error-700 p-1" aria-label={t('cart.removeItem')}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div className="flex justify-between">
            <Link to="/catalog" className="btn-ghost text-burgundy-600">
              <ArrowLeft className={`h-4 w-4 ${lang === 'ar' ? '' : 'rotate-180'}`} />
              {t('cart.continueShopping')}
            </Link>
            <button onClick={clearCart} className="btn-ghost text-error-600">
              <Trash2 className="h-4 w-4" />
              {lang === 'ar' ? 'تفريغ السلة' : 'Clear Cart'}
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="card p-5 sticky top-24 space-y-4">
            <h2 className="font-bold text-navy-900">{t('cart.summary')}</h2>

            {/* Coupon */}
            {couponCode ? (
              <div className="flex items-center justify-between rounded-lg bg-success-50 px-3 py-2">
                <span className="flex items-center gap-1.5 text-sm font-medium text-success-700">
                  <Tag className="h-3.5 w-3.5" />
                  {couponCode}
                </span>
                <button onClick={() => { removeCoupon(); setCouponMsg(null); }} className="text-success-700 hover:text-success-900">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleCoupon} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder={t('cart.coupon')}
                    className="input-field !py-2 text-sm"
                  />
                  <button type="submit" className="btn-secondary !px-4 shrink-0">{t('cart.coupon.apply')}</button>
                </div>
                {couponMsg && (
                  <p className={`text-xs ${couponMsg.ok ? 'text-success-600' : 'text-error-600'}`}>{couponMsg.text}</p>
                )}
              </form>
            )}

            <div className="space-y-2 text-sm border-t border-ivory-200 pt-3">
              <div className="flex justify-between">
                <span className="text-navy-600">{t('common.subtotal')}</span>
                <span className="font-medium text-navy-800">{formatPrice(subtotal, currency, lang)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-navy-600">{t('cart.discount')}</span>
                  <span className="font-medium text-success-600">-{formatPrice(discount, currency, lang)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-navy-600">{t('cart.shipping')}</span>
                <span className="font-medium text-navy-800">{shippingCost === 0 ? (lang === 'ar' ? 'مجاني' : 'Free') : formatPrice(shippingCost, currency, lang)}</span>
              </div>
            </div>

            <div className="flex justify-between border-t border-ivory-200 pt-3">
              <span className="font-bold text-navy-900">{t('common.total')}</span>
              <span className="font-bold text-burgundy-700 text-lg">{formatPrice(total, currency, lang)}</span>
            </div>

            <button onClick={() => navigate('/checkout')} className="btn-accent w-full">
              {t('cart.checkout')}
              <ArrowLeft className={`h-4 w-4 ${lang === 'ar' ? '' : 'rotate-180'}`} />
            </button>

            {shippingCost > 0 && (
              <p className="text-xs text-navy-400 text-center">
                {lang === 'ar' ? `أضف ${formatPrice(500 - (subtotal - discount), currency, lang)} للحصول على شحن مجاني` : `Add ${formatPrice(500 - (subtotal - discount), currency, lang)} for free shipping`}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
