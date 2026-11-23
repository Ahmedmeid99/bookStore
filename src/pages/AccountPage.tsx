import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { User, ShoppingBag, MapPin, Heart, LogOut, Plus, Trash2, Check, Package } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';
import { storeApi } from '@/lib/api';
import { formatPrice, getEffectivePrice, EGYPT_GOVERNORATES } from '@/lib/utils';
import { BookCover } from '@/components/BookCover';
import type { Order, Address, Book } from '@/types/database';

export function AccountPage() {
  const { user, profile, isAdmin, signOut } = useAuth();
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) {
    navigate('/login');
    return null;
  }

  const isMainAccount = location.pathname === '/account' || location.pathname === '/account/';
  const getHeaderTitle = () => {
    if (isMainAccount) return t('account.title'); // Only show "حسابي" on the main account page
    if (location.pathname.includes('/wishlist')) return lang === 'ar' ? 'المفضلة' : 'Wishlist';
    if (location.pathname.includes('/orders')) return t('account.orders');
    if (location.pathname.includes('/addresses')) return t('account.addresses');
    return t('account.title');
  };

  const navItems = [
    { to: '/account', icon: User, label: t('account.profile'), end: true },
    { to: '/account/orders', icon: ShoppingBag, label: t('account.orders') },
    { to: '/account/addresses', icon: MapPin, label: t('account.addresses') },
    { to: '/account/wishlist', icon: Heart, label: lang === 'ar' ? 'المفضلة' : 'Wishlist' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-serif text-2xl font-bold text-navy-900 mb-6">{getHeaderTitle()}</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        {/* Sidebar */}
        <aside className="md:col-span-1">
          <div className="card p-4 space-y-1 sticky top-24">
            <div className="px-3 py-2 border-b border-ivory-200 mb-2">
              <p className="font-semibold text-navy-800">{profile?.display_name || user.email}</p>
              <p className="text-xs text-navy-400">{user.email}</p>
              {isAdmin && <span className="badge bg-burgundy-100 text-burgundy-700 mt-1">{t('nav.admin')}</span>}
            </div>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'bg-navy-800 text-ivory-50' : 'text-navy-700 hover:bg-ivory-100'}`
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
            {isAdmin && (
              <Link to="/admin" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-burgundy-700 hover:bg-burgundy-50">
                {t('nav.admin')}
              </Link>
            )}
            <button
              onClick={() => { signOut(); navigate('/'); }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-error-600 hover:bg-error-50"
            >
              <LogOut className="h-4 w-4" />
              {t('nav.logout')}
            </button>
          </div>
        </aside>

        {/* Content */}
        <div className="md:col-span-3">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export function ProfileTab() {
  const { user, profile, updateProfile } = useAuth();
  const { lang, t } = useLanguage();
  const { success, error: showError } = useToast();
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      await updateProfile(displayName, phone);
      success(lang === 'ar' ? 'تم حفظ التغييرات' : 'Changes saved');
    } catch (error) {
      showError(error instanceof Error ? error.message : (lang === 'ar' ? 'تعذّر الحفظ' : 'Failed to save'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card p-6">
      <h2 className="font-bold text-navy-900 mb-4">{t('account.profile')}</h2>
      <form onSubmit={handleSave} className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-medium text-navy-700 mb-1">{t('auth.email')}</label>
          <input value={user?.email || ''} disabled className="input-field opacity-60" />
        </div>
        <div>
          <label className="block text-sm font-medium text-navy-700 mb-1">{t('auth.displayName')}</label>
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-navy-700 mb-1">{lang === 'ar' ? 'رقم الهاتف' : 'Phone'}</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field" dir="ltr" placeholder="01XXXXXXXXX" />
        </div>
        <button type="submit" disabled={saving} className="btn-primary">{saving ? t('common.loading') : t('common.save')}</button>
      </form>
    </div>
  );
}

export function OrdersTab() {
  const { user } = useAuth();
  const { lang, currency, t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    storeApi.orders.list()
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <div className="card h-48 skeleton" />;
  if (orders.length === 0) {
    return (
      <div className="card p-8 text-center">
        <Package className="mx-auto h-12 w-12 text-navy-300" />
        <p className="mt-3 font-medium text-navy-700">{t('account.noOrders')}</p>
        <Link to="/catalog" className="btn-primary mt-4">{t('cart.continueShopping')}</Link>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-warning-100 text-warning-600',
    confirmed: 'bg-navy-100 text-navy-700',
    processing: 'bg-navy-100 text-navy-700',
    shipped: 'bg-gold-100 text-gold-700',
    delivered: 'bg-success-50 text-success-700',
    cancelled: 'bg-error-50 text-error-600',
  };
  const statusLabels: Record<string, { ar: string; en: string }> = {
    pending: { ar: 'قيد الانتظار', en: 'Pending' },
    confirmed: { ar: 'مؤكد', en: 'Confirmed' },
    processing: { ar: 'قيد المعالجة', en: 'Processing' },
    shipped: { ar: 'تم الشحن', en: 'Shipped' },
    delivered: { ar: 'تم التوصيل', en: 'Delivered' },
    cancelled: { ar: 'ملغي', en: 'Cancelled' },
  };

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <div key={order.id} className="card overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="font-semibold text-navy-800" dir="ltr">{order.order_number}</p>
              <p className="text-xs text-navy-400">{new Date(order.created_at).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')}</p>
            </div>
            <span className={`badge ${statusColors[order.status]}`}>{statusLabels[order.status][lang]}</span>
            <span className="font-bold text-burgundy-700">{formatPrice(Number(order.total), currency, lang)}</span>
            <button onClick={() => setExpandedId(expandedId === order.id ? null : order.id)} className="btn-ghost text-sm">
              {expandedId === order.id ? (lang === 'ar' ? 'إخفاء' : 'Hide') : (lang === 'ar' ? 'التفاصيل' : 'Details')}
            </button>
          </div>
          {expandedId === order.id && (
            <div className="border-t border-ivory-200 p-4 space-y-2">
              {order.order_items?.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <BookCover coverUrl={item.cover_url} title={item.title_ar} className="h-14 w-10 rounded shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-navy-800">{lang === 'ar' ? item.title_ar : (item.title_en || item.title_ar)}</p>
                    <p className="text-xs text-navy-400">{item.quantity} × {formatPrice(Number(item.price), currency, lang)}</p>
                  </div>
                  <span className="text-sm font-semibold text-navy-700">{formatPrice(Number(item.price) * item.quantity, currency, lang)}</span>
                </div>
              ))}
              <Link to={`/order-success/${order.order_number}`} className="btn-ghost text-sm text-burgundy-600 mt-2">
                {lang === 'ar' ? 'عرض الطلب' : 'View Order'}
              </Link>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function AddressesTab() {
  const { user } = useAuth();
  const { lang, t } = useLanguage();
  const { success, error: showError } = useToast();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);
  const [form, setForm] = useState({ full_name: '', phone: '', governorate: '', city: '', district: '', street_address: '', building_no: '', floor: '', apartment: '', label: '', is_default: false });

  useEffect(() => {
    if (!user) return;
    storeApi.addresses.list()
      .then(setAddresses)
      .catch(() => setAddresses([]))
      .finally(() => setLoading(false));
  }, [user]);

  const resetForm = () => {
    setForm({ full_name: '', phone: '', governorate: '', city: '', district: '', street_address: '', building_no: '', floor: '', apartment: '', label: '', is_default: false });
    setEditing(null);
    setShowForm(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      if (editing) await storeApi.addresses.update(editing.id, form);
      else await storeApi.addresses.create(form);
      success(lang === 'ar' ? 'تم الحفظ' : 'Saved');
      resetForm();
      setAddresses(await storeApi.addresses.list());
    } catch (error) {
      showError(error instanceof Error ? error.message : (lang === 'ar' ? 'تعذّر الحفظ' : 'Failed to save'));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await storeApi.addresses.remove(id);
      setAddresses((previous) => previous.filter((address) => address.id !== id));
      success(lang === 'ar' ? 'تم الحذف' : 'Deleted');
    } catch (error) {
      showError(error instanceof Error ? error.message : (lang === 'ar' ? 'تعذّر الحذف' : 'Failed to delete'));
    }
  };

  if (loading) return <div className="card h-48 skeleton" />;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-bold text-navy-900">{t('account.addresses')}</h2>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary !py-2">
          <Plus className="h-4 w-4" />
          {lang === 'ar' ? 'عنوان جديد' : 'Add Address'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="card p-5 space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input placeholder={t('checkout.fullName')} required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="input-field" />
            <input placeholder={t('checkout.phone')} required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" dir="ltr" />
            <select required value={form.governorate} onChange={(e) => setForm({ ...form, governorate: e.target.value })} className="input-field">
              <option value="">{t('checkout.governorate')}</option>
              {EGYPT_GOVERNORATES.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
            <input placeholder={t('checkout.city')} required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="input-field" />
            <input placeholder={t('checkout.district')} value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} className="input-field" />
            <input placeholder={t('checkout.street')} required value={form.street_address} onChange={(e) => setForm({ ...form, street_address: e.target.value })} className="input-field" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_default} onChange={(e) => setForm({ ...form, is_default: e.target.checked })} className="rounded text-burgundy-600" />
            <span className="text-sm text-navy-700">{lang === 'ar' ? 'العنوان الافتراضي' : 'Default address'}</span>
          </label>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary">{t('common.save')}</button>
            <button type="button" onClick={resetForm} className="btn-secondary">{t('common.cancel')}</button>
          </div>
        </form>
      )}

      {addresses.length === 0 && !showForm ? (
        <div className="card p-6 text-center text-navy-400">
          <MapPin className="mx-auto h-10 w-10 text-navy-300 mb-2" />
          {lang === 'ar' ? 'لا توجد عناوين محفوظة' : 'No saved addresses'}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {addresses.map((addr) => (
            <div key={addr.id} className="card p-4">
              <div className="flex items-start justify-between">
                <div className="text-sm space-y-1">
                  <p className="font-semibold text-navy-800 flex items-center gap-2">
                    {addr.full_name}
                    {addr.is_default && <span className="badge bg-gold-100 text-gold-700"><Check className="h-3 w-3" />{lang === 'ar' ? 'افتراضي' : 'Default'}</span>}
                  </p>
                  <p dir="ltr">{addr.phone}</p>
                  <p className="text-navy-600">{addr.governorate}, {addr.city}</p>
                  <p className="text-navy-600">{addr.street_address}</p>
                  {addr.district && <p className="text-navy-400 text-xs">{addr.district}</p>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditing(addr); setForm({ full_name: addr.full_name, phone: addr.phone, governorate: addr.governorate, city: addr.city, district: addr.district || '', street_address: addr.street_address, building_no: addr.building_no || '', floor: addr.floor || '', apartment: addr.apartment || '', label: addr.label || '', is_default: addr.is_default }); setShowForm(true); }} className="btn-ghost !p-1.5" aria-label={t('common.edit')}>
                    <User className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(addr.id)} className="btn-ghost !p-1.5 text-error-600" aria-label={t('common.delete')}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function WishlistTab() {
  const { user } = useAuth();
  const { lang, t } = useLanguage();
  const [items, setItems] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    storeApi.wishlist.list()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <div className="card h-48 skeleton" />;

  if (items.length === 0) {
    return (
      <div className="card p-8 text-center">
        <Heart className="mx-auto h-12 w-12 text-navy-300" />
        <p className="mt-3 font-medium text-navy-700">{lang === 'ar' ? 'قائمة رغباتك فارغة' : 'Your wishlist is empty'}</p>
        <Link to="/catalog" className="btn-primary mt-4">{t('cart.continueShopping')}</Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-bold text-navy-900 mb-4">{t('account.wishlist')}</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {items.map((book) => (
          <Link key={book.id} to={`/book/${book.slug}`} className="card group overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
            <div className="aspect-[3/4] overflow-hidden">
              <BookCover coverUrl={book.cover_url} title={book.title_ar} className="h-full w-full" />
            </div>
            <div className="p-3">
              <h3 className="text-sm font-semibold text-navy-800 line-clamp-2 group-hover:text-burgundy-600">{lang === 'ar' ? book.title_ar : (book.title_en || book.title_ar)}</h3>
              <p className="mt-1 font-bold text-burgundy-700 text-sm">{formatPrice(getEffectivePrice(book), undefined, lang)}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
