/*
# Bookstore RLS policies and grants (part 2)

Applies row-level security policies and minimal grants to every table created in part 1.

## Security model
- Public catalog (authors, categories, books, join tables, published reviews, active coupons):
  SELECT to anon + authenticated. World-readable so the storefront works without login.
- Customer-owned tables (profiles, addresses, carts, cart_items, wishlists, wishlist_items, orders):
  scoped to auth.uid() = user_id (directly or via parent ownership).
- Admin mutations on catalog/coupons/orders status: gated by public.is_admin() which checks
  the JWT app_metadata.role = 'admin'.
- order_items: SELECT only, scoped through the parent order's ownership.
- reviews: customers insert/update their own; admin can delete; published are public.
*/

-- is_admin: restrict to authenticated
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- =================== profiles ===================
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
DROP POLICY IF EXISTS "select_own_profile" ON public.profiles;
CREATE POLICY "select_own_profile" ON public.profiles FOR SELECT
  TO authenticated USING (auth.uid() = id OR public.is_admin());
DROP POLICY IF EXISTS "update_own_profile" ON public.profiles;
CREATE POLICY "update_own_profile" ON public.profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- =================== authors ===================
GRANT SELECT, INSERT, UPDATE, DELETE ON public.authors TO authenticated;
DROP POLICY IF EXISTS "read_authors" ON public.authors;
CREATE POLICY "read_authors" ON public.authors FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_insert_authors" ON public.authors;
CREATE POLICY "admin_insert_authors" ON public.authors FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "admin_update_authors" ON public.authors;
CREATE POLICY "admin_update_authors" ON public.authors FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "admin_delete_authors" ON public.authors;
CREATE POLICY "admin_delete_authors" ON public.authors FOR DELETE
  TO authenticated USING (public.is_admin());

-- =================== categories ===================
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
DROP POLICY IF EXISTS "read_categories" ON public.categories;
CREATE POLICY "read_categories" ON public.categories FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_insert_categories" ON public.categories;
CREATE POLICY "admin_insert_categories" ON public.categories FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "admin_update_categories" ON public.categories;
CREATE POLICY "admin_update_categories" ON public.categories FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "admin_delete_categories" ON public.categories;
CREATE POLICY "admin_delete_categories" ON public.categories FOR DELETE
  TO authenticated USING (public.is_admin());

-- =================== books ===================
GRANT SELECT, INSERT, UPDATE, DELETE ON public.books TO authenticated;
DROP POLICY IF EXISTS "read_active_books" ON public.books;
CREATE POLICY "read_active_books" ON public.books FOR SELECT
  TO anon, authenticated USING (active = true OR public.is_admin());
DROP POLICY IF EXISTS "admin_insert_books" ON public.books;
CREATE POLICY "admin_insert_books" ON public.books FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "admin_update_books" ON public.books;
CREATE POLICY "admin_update_books" ON public.books FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "admin_delete_books" ON public.books;
CREATE POLICY "admin_delete_books" ON public.books FOR DELETE
  TO authenticated USING (public.is_admin());

-- =================== book_authors ===================
GRANT SELECT, INSERT, UPDATE, DELETE ON public.book_authors TO authenticated;
DROP POLICY IF EXISTS "read_book_authors" ON public.book_authors;
CREATE POLICY "read_book_authors" ON public.book_authors FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_insert_book_authors" ON public.book_authors;
CREATE POLICY "admin_insert_book_authors" ON public.book_authors FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "admin_update_book_authors" ON public.book_authors;
CREATE POLICY "admin_update_book_authors" ON public.book_authors FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "admin_delete_book_authors" ON public.book_authors;
CREATE POLICY "admin_delete_book_authors" ON public.book_authors FOR DELETE
  TO authenticated USING (public.is_admin());

-- =================== book_categories ===================
GRANT SELECT, INSERT, UPDATE, DELETE ON public.book_categories TO authenticated;
DROP POLICY IF EXISTS "read_book_categories" ON public.book_categories;
CREATE POLICY "read_book_categories" ON public.book_categories FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_insert_book_categories" ON public.book_categories;
CREATE POLICY "admin_insert_book_categories" ON public.book_categories FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "admin_update_book_categories" ON public.book_categories;
CREATE POLICY "admin_update_book_categories" ON public.book_categories FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "admin_delete_book_categories" ON public.book_categories;
CREATE POLICY "admin_delete_book_categories" ON public.book_categories FOR DELETE
  TO authenticated USING (public.is_admin());

-- =================== addresses ===================
GRANT SELECT, INSERT, UPDATE, DELETE ON public.addresses TO authenticated;
DROP POLICY IF EXISTS "select_own_addresses" ON public.addresses;
CREATE POLICY "select_own_addresses" ON public.addresses FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_addresses" ON public.addresses;
CREATE POLICY "insert_own_addresses" ON public.addresses FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_addresses" ON public.addresses;
CREATE POLICY "update_own_addresses" ON public.addresses FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_addresses" ON public.addresses;
CREATE POLICY "delete_own_addresses" ON public.addresses FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- =================== carts ===================
GRANT SELECT, INSERT, UPDATE, DELETE ON public.carts TO authenticated;
DROP POLICY IF EXISTS "select_own_carts" ON public.carts;
CREATE POLICY "select_own_carts" ON public.carts FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_carts" ON public.carts;
CREATE POLICY "insert_own_carts" ON public.carts FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_carts" ON public.carts;
CREATE POLICY "update_own_carts" ON public.carts FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_carts" ON public.carts;
CREATE POLICY "delete_own_carts" ON public.carts FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- =================== cart_items ===================
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cart_items TO authenticated;
DROP POLICY IF EXISTS "select_own_cart_items" ON public.cart_items;
CREATE POLICY "select_own_cart_items" ON public.cart_items FOR SELECT
  TO authenticated USING (EXISTS (SELECT 1 FROM public.carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid()));
DROP POLICY IF EXISTS "insert_own_cart_items" ON public.cart_items;
CREATE POLICY "insert_own_cart_items" ON public.cart_items FOR INSERT
  TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid()));
DROP POLICY IF EXISTS "update_own_cart_items" ON public.cart_items;
CREATE POLICY "update_own_cart_items" ON public.cart_items FOR UPDATE
  TO authenticated USING (EXISTS (SELECT 1 FROM public.carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid()));
DROP POLICY IF EXISTS "delete_own_cart_items" ON public.cart_items;
CREATE POLICY "delete_own_cart_items" ON public.cart_items FOR DELETE
  TO authenticated USING (EXISTS (SELECT 1 FROM public.carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid()));

-- =================== wishlists ===================
GRANT SELECT, INSERT, DELETE ON public.wishlists TO authenticated;
DROP POLICY IF EXISTS "select_own_wishlists" ON public.wishlists;
CREATE POLICY "select_own_wishlists" ON public.wishlists FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_wishlists" ON public.wishlists;
CREATE POLICY "insert_own_wishlists" ON public.wishlists FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_wishlists" ON public.wishlists;
CREATE POLICY "delete_own_wishlists" ON public.wishlists FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- =================== wishlist_items ===================
GRANT SELECT, INSERT, DELETE ON public.wishlist_items TO authenticated;
DROP POLICY IF EXISTS "select_own_wishlist_items" ON public.wishlist_items;
CREATE POLICY "select_own_wishlist_items" ON public.wishlist_items FOR SELECT
  TO authenticated USING (EXISTS (SELECT 1 FROM public.wishlists WHERE wishlists.id = wishlist_items.wishlist_id AND wishlists.user_id = auth.uid()));
DROP POLICY IF EXISTS "insert_own_wishlist_items" ON public.wishlist_items;
CREATE POLICY "insert_own_wishlist_items" ON public.wishlist_items FOR INSERT
  TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.wishlists WHERE wishlists.id = wishlist_items.wishlist_id AND wishlists.user_id = auth.uid()));
DROP POLICY IF EXISTS "delete_own_wishlist_items" ON public.wishlist_items;
CREATE POLICY "delete_own_wishlist_items" ON public.wishlist_items FOR DELETE
  TO authenticated USING (EXISTS (SELECT 1 FROM public.wishlists WHERE wishlists.id = wishlist_items.wishlist_id AND wishlists.user_id = auth.uid()));

-- =================== coupons ===================
GRANT SELECT, INSERT, UPDATE, DELETE ON public.coupons TO authenticated;
DROP POLICY IF EXISTS "read_active_coupons" ON public.coupons;
CREATE POLICY "read_active_coupons" ON public.coupons FOR SELECT
  TO anon, authenticated USING (active = true);
DROP POLICY IF EXISTS "admin_insert_coupons" ON public.coupons;
CREATE POLICY "admin_insert_coupons" ON public.coupons FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "admin_update_coupons" ON public.coupons;
CREATE POLICY "admin_update_coupons" ON public.coupons FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "admin_delete_coupons" ON public.coupons;
CREATE POLICY "admin_delete_coupons" ON public.coupons FOR DELETE
  TO authenticated USING (public.is_admin());

-- =================== orders ===================
GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated;
DROP POLICY IF EXISTS "select_own_orders" ON public.orders;
CREATE POLICY "select_own_orders" ON public.orders FOR SELECT
  TO authenticated USING (auth.uid() = user_id OR public.is_admin());
DROP POLICY IF EXISTS "insert_own_orders" ON public.orders;
CREATE POLICY "insert_own_orders" ON public.orders FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "admin_update_orders" ON public.orders;
CREATE POLICY "admin_update_orders" ON public.orders FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- =================== order_items ===================
GRANT SELECT ON public.order_items TO authenticated;
DROP POLICY IF EXISTS "select_own_order_items" ON public.order_items;
CREATE POLICY "select_own_order_items" ON public.order_items FOR SELECT
  TO authenticated USING (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND (orders.user_id = auth.uid() OR public.is_admin())));

-- =================== reviews ===================
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
DROP POLICY IF EXISTS "read_published_reviews" ON public.reviews;
CREATE POLICY "read_published_reviews" ON public.reviews FOR SELECT
  TO anon, authenticated USING (status = 'published' OR public.is_admin());
DROP POLICY IF EXISTS "insert_own_reviews" ON public.reviews;
CREATE POLICY "insert_own_reviews" ON public.reviews FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_reviews" ON public.reviews;
CREATE POLICY "update_own_reviews" ON public.reviews FOR UPDATE
  TO authenticated USING (auth.uid() = user_id OR public.is_admin()) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "admin_delete_reviews" ON public.reviews;
CREATE POLICY "admin_delete_reviews" ON public.reviews FOR DELETE
  TO authenticated USING (public.is_admin());
