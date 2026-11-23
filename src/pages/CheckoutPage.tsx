import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, CreditCard, Banknote, AlertCircle, Loader2 } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';
import { storeApi } from '@/lib/api';
import { formatPrice, validatePhone, EGYPT_GOVERNORATES } from '@/lib/utils';
import { BookCover } from '@/components/BookCover';
import { getEffectivePrice } from '@/lib/utils';
import type { Address } from '@/types/database';

export function CheckoutPage() {
  const { items, subtotal, total, shippingCost, discount, couponCode, refreshCart } = useCart();
  const { user } = useAuth();
  const { lang, currency, t } = useLanguage();
  const { success, error: showError } = useToast();
  const navigate = useNavigate();

  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    full_name: '', phone: '', governorate: '', city: '', district: '',
    street_address: '', notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fillFromAddress = useCallback((addr: Address) => {
    setForm({
      full_name: addr.full_name, phone: addr.phone, governorate: addr.governorate,
      city: addr.city, district: addr.district || '', street_address: addr.street_address, notes: '',
    });
  }, []);

  // Load saved addresses
  useEffect(() => {
    if (!user) return;
    storeApi.addresses.list()
      .then((addresses) => {
        setSavedAddresses(addresses);
        const defaultAddress = addresses.find((address) => address.is_default);
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
          fillFromAddress(defaultAddress);
        }
      })
      .catch(() => setSavedAddresses([]));
  }, [user, fillFromAddress]);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="font-serif text-xl font-bold text-navy-800">{t('cart.empty')}</h1>
        <Link to="/catalog" className="btn-primary mt-4">{t('cart.continueShopping')}</Link>
      </div>
    );
  }

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.full_name.trim()) e.full_name = lang === 'ar' ? 'الاسم مطلوب' : 'Name is required';
    if (!form.phone.trim()) e.phone = lang === 'ar' ? 'الهاتف مطلوب' : 'Phone is required';
    else if (!validatePhone(form.phone)) e.phone = lang === 'ar' ? 'رقم هاتف غير صحيح (01XXXXXXXXX)' : 'Invalid phone (01XXXXXXXXX)';
    if (!form.governorate) e.governorate = lang === 'ar' ? 'المحافظة مطلوبة' : 'Governorate is required';
    if (!form.city.trim()) e.city = lang === 'ar' ? 'المدينة مطلوبة' : 'City is required';
    if (!form.street_address.trim()) e.street_address = lang === 'ar' ? 'العنوان مطلوب' : 'Address is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!user) { navigate('/login'); return; }
    if (!validate()) return;
    setSubmitting(true);
    try {
      const order = await storeApi.orders.place({
        ...form,
        payment_method: paymentMethod,
        coupon_code: couponCode,
        save_address: savedAddresses.length === 0,
      });
      await refreshCart();
      success(lang === 'ar' ? 'تم إنشاء طلبك بنجاح!' : 'Order placed successfully!');
      navigate(`/order-success/${order.order_number}`);
    } catch (error) {
      showError(error instanceof Error ? error.message : (lang === 'ar' ? 'تعذّر إنشاء الطلب' : 'Failed to place order'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-serif text-2xl font-bold text-navy-900 mb-6">{t('checkout.title')}</h1>

      {!user && (
        <div className="card flex items-center gap-3 p-4 mb-6 border-burgundy-200 bg-burgundy-50">
          <AlertCircle className="h-5 w-5 text-burgundy-600 shrink-0" />
          <p className="text-sm text-burgundy-700">
            {t('checkout.loginRequired')} — <Link to="/login" className="font-semibold underline">{t('nav.login')}</Link>
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Saved addresses */}
          {savedAddresses.length > 0 && (
            <div className="card p-4">
              <h2 className="font-semibold text-navy-800 mb-3">{lang === 'ar' ? 'العناوين المحفوظة' : 'Saved Addresses'}</h2>
              <div className="space-y-2">
                {savedAddresses.map((addr) => (
                  <label key={addr.id} className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${selectedAddressId === addr.id ? 'border-gold-400 bg-gold-50' : 'border-ivory-200 hover:bg-ivory-100'}`}>
                    <input type="radio" name="address" value={addr.id} checked={selectedAddressId === addr.id} onChange={() => { setSelectedAddressId(addr.id); fillFromAddress(addr); }} className="mt-1 text-burgundy-600" />
                    <div className="text-sm">
                      <p className="font-medium text-navy-800">{addr.full_name} — {addr.phone}</p>
                      <p className="text-navy-500">{addr.governorate}, {addr.city}, {addr.street_address}</p>
                    </div>
                  </label>
                ))}
                <button onClick={() => { setSelectedAddressId(''); setForm({ full_name: '', phone: '', governorate: '', city: '', district: '', street_address: '', notes: '' }); }} className="btn-ghost text-sm text-burgundy-600">
                  + {lang === 'ar' ? 'عنوان جديد' : 'New address'}
                </button>
              </div>
            </div>
          )}

          {/* Shipping form */}
          <div className="card p-5">
            <h2 className="font-semibold text-navy-800 mb-4">{t('checkout.shipping')}</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-navy-700 mb-1">{t('checkout.fullName')} *</label>
                <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="input-field" />
                {errors.full_name && <p className="mt-1 text-xs text-error-600">{errors.full_name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">{t('checkout.phone')} *</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" placeholder="01XXXXXXXXX" dir="ltr" />
                {errors.phone && <p className="mt-1 text-xs text-error-600">{errors.phone}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">{t('checkout.governorate')} *</label>
                <select value={form.governorate} onChange={(e) => setForm({ ...form, governorate: e.target.value })} className="input-field">
                  <option value="">{lang === 'ar' ? 'اختر...' : 'Select...'}</option>
                  {EGYPT_GOVERNORATES.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
                {errors.governorate && <p className="mt-1 text-xs text-error-600">{errors.governorate}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">{t('checkout.city')} *</label>
                <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="input-field" />
                {errors.city && <p className="mt-1 text-xs text-error-600">{errors.city}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">{t('checkout.district')}</label>
                <input value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} className="input-field" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-navy-700 mb-1">{t('checkout.street')} *</label>
                <input value={form.street_address} onChange={(e) => setForm({ ...form, street_address: e.target.value })} className="input-field" />
                {errors.street_address && <p className="mt-1 text-xs text-error-600">{errors.street_address}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-navy-700 mb-1">{t('checkout.notes')}</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="input-field resize-none" />
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="card p-5">
            <h2 className="font-semibold text-navy-800 mb-4">{t('checkout.payment')}</h2>
            <div className="space-y-2">
              <label className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-gold-400 bg-gold-50' : 'border-ivory-200 hover:bg-ivory-100'}`}>
                <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="text-burgundy-600" />
                <Banknote className="h-5 w-5 text-navy-600" />
                <div className="flex-1">
                  <p className="font-medium text-navy-800">{t('checkout.cod')}</p>
                  <p className="text-xs text-navy-400">{lang === 'ar' ? 'ادفع نقدًا عند استلام طلبك' : 'Pay cash when you receive your order'}</p>
                </div>
              </label>
              <label className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${paymentMethod === 'online' ? 'border-gold-400 bg-gold-50' : 'border-ivory-200 hover:bg-ivory-100'}`}>
                <input type="radio" name="payment" value="online" checked={paymentMethod === 'online'} onChange={() => setPaymentMethod('online')} className="text-burgundy-600" />
                <CreditCard className="h-5 w-5 text-navy-600" />
                <div className="flex-1">
                  <p className="font-medium text-navy-800">{t('checkout.online')} <span className="badge bg-warning-100 text-warning-600 mr-1">{t('checkout.online.demo')}</span></p>
                  <p className="text-xs text-navy-400">{lang === 'ar' ? 'دفع آمن بالبطاقة (قريبًا)' : 'Secure card payment (coming soon)'}</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="card p-5 sticky top-24 space-y-4">
            <h2 className="font-bold text-navy-900">{t('cart.summary')}</h2>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {items.map((item) => {
                const price = getEffectivePrice(item.book!);
                return (
                  <div key={item.id} className="flex gap-2">
                    <BookCover coverUrl={item.book?.cover_url || null} title={item.book?.title_ar || ''} className="h-14 w-10 rounded shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-navy-800 line-clamp-1">{lang === 'ar' ? item.book?.title_ar : (item.book?.title_en || item.book?.title_ar)}</p>
                      <p className="text-xs text-navy-400">{item.quantity} × {formatPrice(price, currency, lang)}</p>
                    </div>
                    <span className="text-xs font-semibold text-navy-700">{formatPrice(price * item.quantity, currency, lang)}</span>
                  </div>
                );
              })}
            </div>
            <div className="space-y-2 text-sm border-t border-ivory-200 pt-3">
              <div className="flex justify-between"><span className="text-navy-600">{t('common.subtotal')}</span><span className="font-medium text-navy-800">{formatPrice(subtotal, currency, lang)}</span></div>
              {discount > 0 && <div className="flex justify-between"><span className="text-navy-600">{t('cart.discount')}</span><span className="font-medium text-success-600">-{formatPrice(discount, currency, lang)}</span></div>}
              <div className="flex justify-between"><span className="text-navy-600">{t('cart.shipping')}</span><span className="font-medium text-navy-800">{shippingCost === 0 ? (lang === 'ar' ? 'مجاني' : 'Free') : formatPrice(shippingCost, currency, lang)}</span></div>
            </div>
            <div className="flex justify-between border-t border-ivory-200 pt-3">
              <span className="font-bold text-navy-900">{t('common.total')}</span>
              <span className="font-bold text-burgundy-700 text-lg">{formatPrice(total, currency, lang)}</span>
            </div>
            <button onClick={handlePlaceOrder} disabled={submitting || !user} className="btn-accent w-full">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {t('checkout.placeOrder')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
