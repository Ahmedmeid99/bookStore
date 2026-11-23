import { Navigate, Outlet } from 'react-router-dom';
import { ExternalLink, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

const ADMIN_URL = import.meta.env.VITE_ADMIN_URL || 'http://localhost:5174';

export function AdminLayout() {
  const { user, isAdmin, loading } = useAuth();
  const { lang } = useLanguage();
  if (loading) return <div className="mx-auto max-w-5xl px-4 py-12"><div className="card h-64 skeleton" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/account" replace />;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-800 text-gold-400">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-serif text-2xl font-bold text-navy-900">{lang === 'ar' ? 'إدارة المتجر' : 'Store administration'}</h1>
          <p className="text-sm text-navy-500">{lang === 'ar' ? 'بوابة الإدارة متصلة مباشرة بواجهة ASP.NET' : 'The administration portal is connected directly to the ASP.NET API'}</p>
        </div>
      </div>
      <Outlet />
    </div>
  );
}

function AdminPortalPanel() {
  const { lang } = useLanguage();
  return (
    <section className="card overflow-hidden">
      <div className="bg-gradient-to-br from-navy-800 to-navy-900 p-8 text-ivory-50">
        <LayoutDashboard className="h-10 w-10 text-gold-400" />
        <h2 className="mt-4 font-serif text-2xl font-bold">{lang === 'ar' ? 'لوحة الإدارة الكاملة' : 'Full administration dashboard'}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ivory-200">
          {lang === 'ar'
            ? 'إدارة الكتب والمخزون والطلبات والعملاء والكوبونات من لوحة الإدارة المخصصة. جميع التغييرات تظهر فورًا في واجهة المتجر.'
            : 'Manage books, inventory, orders, customers, and coupons in the dedicated admin dashboard. Changes appear immediately in the storefront.'}
        </p>
        <a href={ADMIN_URL} className="btn-accent mt-6 inline-flex" target="_blank" rel="noreferrer">
          {lang === 'ar' ? 'فتح لوحة الإدارة' : 'Open admin dashboard'}
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
      <div className="grid gap-4 p-6 sm:grid-cols-3">
        {[
          lang === 'ar' ? 'بيانات حقيقية من SQL Server' : 'Live SQL Server data',
          lang === 'ar' ? 'صلاحيات إدارة محمية' : 'Protected admin permissions',
          lang === 'ar' ? 'إدارة شاملة للمخزون والطلبات' : 'Complete inventory and order control',
        ].map((label) => <div key={label} className="rounded-xl bg-ivory-100 p-4 text-sm font-medium text-navy-700">{label}</div>)}
      </div>
    </section>
  );
}

export const AdminDashboard = AdminPortalPanel;
export const AdminBooks = AdminPortalPanel;
export const AdminAuthors = AdminPortalPanel;
export const AdminCategories = AdminPortalPanel;
export const AdminOrders = AdminPortalPanel;
export const AdminCoupons = AdminPortalPanel;
export const AdminCustomers = AdminPortalPanel;
