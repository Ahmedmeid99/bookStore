/*
# Add helper RPCs for order placement

- decrement_stock(book_id_input uuid, qty int): atomically reduces book stock by qty, never below 0.
- increment_coupon_usage(code_input text): increments used_count for a coupon.
Both are SECURITY DEFINER so the authenticated user placing an order can call them
without needing direct UPDATE privileges on books/coupons rows they don't own.
*/

CREATE OR REPLACE FUNCTION public.decrement_stock(book_id_input uuid, qty int)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.books
  SET stock_quantity = GREATEST(0, stock_quantity - qty),
      updated_at = now()
  WHERE id = book_id_input;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.decrement_stock(uuid, int) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.decrement_stock(uuid, int) TO authenticated;

CREATE OR REPLACE FUNCTION public.increment_coupon_usage(code_input text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.coupons
  SET used_count = used_count + 1,
      updated_at = now()
  WHERE UPPER(code) = UPPER(code_input);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.increment_coupon_usage(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.increment_coupon_usage(text) TO authenticated;

-- Storage bucket for book covers
INSERT INTO storage.buckets (id, name, public)
VALUES ('book-covers', 'book-covers', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: public read, admin write
DROP POLICY IF EXISTS "public_read_covers" ON storage.objects;
CREATE POLICY "public_read_covers" ON storage.objects FOR SELECT
  TO public USING (bucket_id = 'book-covers');

DROP POLICY IF EXISTS "admin_upload_covers" ON storage.objects;
CREATE POLICY "admin_upload_covers" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (bucket_id = 'book-covers' AND public.is_admin());

DROP POLICY IF EXISTS "admin_update_covers" ON storage.objects;
CREATE POLICY "admin_update_covers" ON storage.objects FOR UPDATE
  TO authenticated USING (bucket_id = 'book-covers' AND public.is_admin())
  WITH CHECK (bucket_id = 'book-covers' AND public.is_admin());

DROP POLICY IF EXISTS "admin_delete_covers" ON storage.objects;
CREATE POLICY "admin_delete_covers" ON storage.objects FOR DELETE
  TO authenticated USING (bucket_id = 'book-covers' AND public.is_admin());
