import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { WishlistProvider } from '@/contexts/WishlistContext';
import { Layout } from '@/components/Layout';

const HomePage = lazy(() => import('@/pages/HomePage').then((module) => ({ default: module.HomePage })));
const CatalogPage = lazy(() => import('@/pages/CatalogPage').then((module) => ({ default: module.CatalogPage })));
const BookDetailsPage = lazy(() => import('@/pages/BookDetailsPage').then((module) => ({ default: module.BookDetailsPage })));
const CartPage = lazy(() => import('@/pages/CartPage').then((module) => ({ default: module.CartPage })));
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage').then((module) => ({ default: module.CheckoutPage })));
const OrderSuccessPage = lazy(() => import('@/pages/OrderSuccessPage').then((module) => ({ default: module.OrderSuccessPage })));
const LoginPage = lazy(() => import('@/pages/LoginPage').then((module) => ({ default: module.LoginPage })));
const SignupPage = lazy(() => import('@/pages/SignupPage').then((module) => ({ default: module.SignupPage })));
const WishlistPage = lazy(() => import('@/pages/WishlistPage').then((module) => ({ default: module.WishlistPage })));
const AccountPage = lazy(() => import('@/pages/AccountPage').then((module) => ({ default: module.AccountPage })));
const ProfileTab = lazy(() => import('@/pages/AccountPage').then((module) => ({ default: module.ProfileTab })));
const OrdersTab = lazy(() => import('@/pages/AccountPage').then((module) => ({ default: module.OrdersTab })));
const AddressesTab = lazy(() => import('@/pages/AccountPage').then((module) => ({ default: module.AddressesTab })));
const WishlistTab = lazy(() => import('@/pages/AccountPage').then((module) => ({ default: module.WishlistTab })));
const AdminLayout = lazy(() => import('@/pages/AdminPage').then((module) => ({ default: module.AdminLayout })));
const AdminDashboard = lazy(() => import('@/pages/AdminPage').then((module) => ({ default: module.AdminDashboard })));
const AdminBooks = lazy(() => import('@/pages/AdminPage').then((module) => ({ default: module.AdminBooks })));
const AdminAuthors = lazy(() => import('@/pages/AdminPage').then((module) => ({ default: module.AdminAuthors })));
const AdminCategories = lazy(() => import('@/pages/AdminPage').then((module) => ({ default: module.AdminCategories })));
const AdminOrders = lazy(() => import('@/pages/AdminPage').then((module) => ({ default: module.AdminOrders })));
const AdminCoupons = lazy(() => import('@/pages/AdminPage').then((module) => ({ default: module.AdminCoupons })));
const AdminCustomers = lazy(() => import('@/pages/AdminPage').then((module) => ({ default: module.AdminCustomers })));

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <ToastProvider>
          <AuthProvider>
            <WishlistProvider>
              <CartProvider>
                <Suspense fallback={<div className="min-h-[50vh] bg-ivory-50" aria-busy="true" />}>
                  <Routes>
                  <Route element={<Layout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/catalog" element={<CatalogPage />} />
                  <Route path="/book/:slug" element={<BookDetailsPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/order-success/:orderNumber" element={<OrderSuccessPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="/wishlist" element={<WishlistPage />} />
                  <Route path="/account" element={<AccountPage />}>
                    <Route index element={<ProfileTab />} />
                    <Route path="orders" element={<OrdersTab />} />
                    <Route path="addresses" element={<AddressesTab />} />
                    <Route path="wishlist" element={<WishlistTab />} />
                  </Route>
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="books" element={<AdminBooks />} />
                    <Route path="authors" element={<AdminAuthors />} />
                    <Route path="categories" element={<AdminCategories />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="coupons" element={<AdminCoupons />} />
                    <Route path="customers" element={<AdminCustomers />} />
                  </Route>
                  </Route>
                  </Routes>
                </Suspense>
              </CartProvider>
            </WishlistProvider>
          </AuthProvider>
        </ToastProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}
