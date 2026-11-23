import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Package, Truck, MapPin, ArrowLeft, Copy } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';
import { storeApi } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { BookCover } from '@/components/BookCover';
import type { Order } from '@/types/database';

export function OrderSuccessPage() {
  const { orderNumber } = useParams();
  const { lang, currency, t } = useLanguage();
  const { success } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderNumber) return;
    storeApi.orders.get(orderNumber)
      .then(setOrder)
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [orderNumber]);

  const copyOrderNumber = () => {
    navigator.clipboard.writeText(orderNumber || '');
    success(lang === 'ar' ? 'تم نسخ رقم الطلب' : 'Order number copied');
  };

  if (loading) {
    return <div className="mx-auto max-w-2xl px-4 py-16"><div className="card h-96 skeleton" /></div>;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Success header */}
      <div className="text-center mb-8 animate-slide-up">
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-success-50 text-success-600 mb-4">
          <CheckCircle2 className="h-12 w-12" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-navy-900">
          {lang === 'ar' ? 'تم تأكيد طلبك!' : 'Order Confirmed!'}
        </h1>
        <p className="mt-2 text-navy-500">
          {lang === 'ar' ? 'شكرًا لك. سيصلك تأكيد عبر البريد الإلكتروني قريبًا.' : 'Thank you. You will receive an email confirmation soon.'}
        </p>
      </div>

      {/* Order number */}
      <div className="card p-5 mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-navy-500">{lang === 'ar' ? 'رقم الطلب' : 'Order Number'}</p>
          <p className="font-serif text-xl font-bold text-navy-900" dir="ltr">{orderNumber}</p>
        </div>
        <button onClick={copyOrderNumber} className="btn-ghost" aria-label="Copy">
          <Copy className="h-4 w-4" />
        </button>
      </div>

      {order && (
        <>
          {/* Order details */}
          <div className="card p-5 mb-6">
            <h2 className="font-bold text-navy-900 mb-4">{lang === 'ar' ? 'تفاصيل الطلب' : 'Order Details'}</h2>
            <div className="space-y-3">
              {order.order_items?.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <BookCover coverUrl={item.cover_url} title={item.title_ar} className="h-16 w-12 rounded shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-navy-800">{lang === 'ar' ? item.title_ar : (item.title_en || item.title_ar)}</p>
                    <p className="text-xs text-navy-400">{item.quantity} × {formatPrice(Number(item.price), currency, lang)}</p>
                  </div>
                  <span className="text-sm font-semibold text-navy-700">{formatPrice(Number(item.price) * item.quantity, currency, lang)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2 text-sm border-t border-ivory-200 pt-3">
              <div className="flex justify-between"><span className="text-navy-600">{t('common.subtotal')}</span><span className="font-medium text-navy-800">{formatPrice(Number(order.subtotal), currency, lang)}</span></div>
              {Number(order.discount) > 0 && <div className="flex justify-between"><span className="text-navy-600">{t('cart.discount')}</span><span className="font-medium text-success-600">-{formatPrice(Number(order.discount), currency, lang)}</span></div>}
              <div className="flex justify-between"><span className="text-navy-600">{t('cart.shipping')}</span><span className="font-medium text-navy-800">{formatPrice(Number(order.shipping_cost), currency, lang)}</span></div>
              <div className="flex justify-between border-t border-ivory-200 pt-2"><span className="font-bold text-navy-900">{t('common.total')}</span><span className="font-bold text-burgundy-700">{formatPrice(Number(order.total), currency, lang)}</span></div>
            </div>
          </div>

          {/* Shipping info */}
          <div className="card p-5 mb-6">
            <h2 className="font-bold text-navy-900 mb-3 flex items-center gap-2"><MapPin className="h-4 w-4 text-navy-500" />{t('checkout.shipping')}</h2>
            <div className="text-sm text-navy-600 space-y-1">
              <p className="font-medium text-navy-800">{order.shipping_full_name}</p>
              <p dir="ltr">{order.shipping_phone}</p>
              <p>{order.shipping_governorate}, {order.shipping_city}</p>
              <p>{order.shipping_street_address}</p>
              {order.shipping_district && <p>{order.shipping_district}</p>}
            </div>
          </div>

          {/* Status tracker */}
          <div className="card p-5 mb-6">
            <h2 className="font-bold text-navy-900 mb-4">{lang === 'ar' ? 'حالة الطلب' : 'Order Status'}</h2>
            <div className="flex items-center justify-between">
              {[
                { key: 'pending', label: lang === 'ar' ? 'قيد الانتظار' : 'Pending', icon: Package },
                { key: 'confirmed', label: lang === 'ar' ? 'مؤكد' : 'Confirmed', icon: CheckCircle2 },
                { key: 'shipped', label: lang === 'ar' ? 'تم الشحن' : 'Shipped', icon: Truck },
                { key: 'delivered', label: lang === 'ar' ? 'تم التوصيل' : 'Delivered', icon: MapPin },
              ].map((step) => {
                const active = order.status === step.key;
                return (
                  <div key={step.key} className="flex flex-1 flex-col items-center gap-1 text-center">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${active ? 'bg-burgundy-600 text-ivory-50' : 'bg-ivory-200 text-navy-400'}`}>
                      <step.icon className="h-5 w-5" />
                    </div>
                    <span className={`text-xs ${active ? 'font-semibold text-navy-800' : 'text-navy-400'}`}>{step.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      <div className="flex justify-center gap-3">
        <Link to="/catalog" className="btn-primary">
          {t('cart.continueShopping')}
          <ArrowLeft className={`h-4 w-4 ${lang === 'ar' ? '' : 'rotate-180'}`} />
        </Link>
        <Link to="/account/orders" className="btn-secondary">{t('account.orders')}</Link>
      </div>
    </div>
  );
}
