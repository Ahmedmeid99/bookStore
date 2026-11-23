// Edge function: place-order
// Securely calculates order totals server-side and creates an order from the user's cart.
// Never trusts prices/totals sent from the browser — recomputes everything from the database.

import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const EGYPT_TAX_RATE = 0.0; // Books are tax-exempt in Egypt; adjustable
const FLAT_SHIPPING = 50; // EGP flat shipping inside Egypt
const FREE_SHIPPING_THRESHOLD = 500; // Free shipping over 500 EGP

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return json({ error: "Unauthorized" }, 401);
    }

    const body = await req.json();
    const {
      shipping,
      payment_method = "cod",
      coupon_code = null,
      notes = null,
    } = body || {};

    if (!shipping || !shipping.full_name || !shipping.phone || !shipping.governorate || !shipping.city || !shipping.street_address) {
      return json({ error: "بيانات الشحن غير مكتملة" }, 400);
    }

    // Egyptian phone validation: 01XXXXXXXXX (11 digits)
    const phoneClean = String(shipping.phone).replace(/[\s\-]/g, "");
    if (!/^01[0-9]{9}$/.test(phoneClean)) {
      return json({ error: "رقم الهاتف غير صحيح. يجب أن يبدأ بـ 01 ويتكون من 11 رقمًا" }, 400);
    }

    if (!["cod", "online"].includes(payment_method)) {
      return json({ error: "طريقة دفع غير مدعومة" }, 400);
    }

    // Load the user's cart + active items with book prices
    const { data: cart } = await supabase
      .from("carts")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!cart) {
      return json({ error: "السلة فارغة" }, 400);
    }

    const { data: items, error: itemsError } = await supabase
      .from("cart_items")
      .select("id, quantity, book_id, books(id, title_ar, title_en, cover_url, regular_price, sale_price, stock_quantity, active)")
      .eq("cart_id", cart.id)
      .order("created_at", { ascending: true });

    if (itemsError) throw itemsError;
    if (!items || items.length === 0) {
      return json({ error: "السلة فارغة" }, 400);
    }

    // Validate stock and compute subtotal from DB prices
    let subtotal = 0;
    const lineItems: Array<{
      book_id: string;
      title_ar: string;
      title_en: string | null;
      cover_url: string | null;
      price: number;
      quantity: number;
    }> = [];

    for (const item of items) {
      const book = item.book_id as any;
      if (!book || !book.active) {
        return json({ error: `أحد الكتب في سلتك لم يعد متاحًا` }, 400);
      }
      if (item.quantity > book.stock_quantity) {
        return json({ error: `الكمية المطلوبة من «${book.title_ar}» أكبر من المخزون المتاح (${book.stock_quantity})` }, 400);
      }
      const unitPrice = book.sale_price != null ? Number(book.sale_price) : Number(book.regular_price);
      subtotal += unitPrice * item.quantity;
      lineItems.push({
        book_id: book.id,
        title_ar: book.title_ar,
        title_en: book.title_en,
        cover_url: book.cover_url,
        price: unitPrice,
        quantity: item.quantity,
      });
    }

    // Coupon validation
    let discount = 0;
    let appliedCoupon: string | null = null;
    if (coupon_code) {
      const code = String(coupon_code).toUpperCase().trim();
      const { data: coupon } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", code)
        .eq("active", true)
        .maybeSingle();

      if (coupon) {
        const now = new Date();
        const expired = coupon.expires_at && new Date(coupon.expires_at) < now;
        const notStarted = coupon.starts_at && new Date(coupon.starts_at) > now;
        const maxReached = coupon.max_uses != null && coupon.used_count >= coupon.max_uses;
        const belowMin = subtotal < Number(coupon.min_order_amount);
        if (!expired && !notStarted && !maxReached && !belowMin) {
          if (coupon.discount_type === "percentage") {
            discount = (subtotal * Number(coupon.discount_value)) / 100;
          } else {
            discount = Math.min(Number(coupon.discount_value), subtotal);
          }
          appliedCoupon = code;
        }
      }
    }

    const afterDiscount = Math.max(0, subtotal - discount);
    const shippingCost = afterDiscount >= FREE_SHIPPING_THRESHOLD || afterDiscount === 0 ? 0 : FLAT_SHIPPING;
    const tax = afterDiscount * EGYPT_TAX_RATE;
    const total = afterDiscount + shippingCost + tax;

    // Generate a unique order number
    const orderNumber = `AFQ-${Date.now().toString().slice(-8)}-${Math.floor(Math.random() * 1000).toString().padStart(3, "0")}`;

    // Create the order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        user_id: user.id,
        status: "pending",
        subtotal: subtotal.toFixed(2),
        discount: discount.toFixed(2),
        shipping_cost: shippingCost.toFixed(2),
        tax: tax.toFixed(2),
        total: total.toFixed(2),
        coupon_code: appliedCoupon,
        payment_method,
        payment_status: payment_method === "online" ? "unpaid" : "unpaid",
        shipping_full_name: shipping.full_name,
        shipping_phone: phoneClean,
        shipping_governorate: shipping.governorate,
        shipping_city: shipping.city,
        shipping_district: shipping.district || null,
        shipping_street_address: shipping.street_address,
        shipping_notes: shipping.notes || null,
        notes: notes || null,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Insert order items
    const orderItemsRows = lineItems.map((li) => ({
      order_id: order.id,
      book_id: li.book_id,
      title_ar: li.title_ar,
      title_en: li.title_en,
      cover_url: li.cover_url,
      price: li.price.toFixed(2),
      quantity: li.quantity,
    }));

    const { error: oiError } = await supabase.from("order_items").insert(orderItemsRows);
    if (oiError) throw oiError;

    // Decrement stock
    for (const li of lineItems) {
      await supabase.rpc("decrement_stock", {
        book_id_input: li.book_id,
        qty: li.quantity,
      }).then(() => {});
    }

    // Increment coupon usage
    if (appliedCoupon) {
      await supabase.rpc("increment_coupon_usage", { code_input: appliedCoupon }).then(() => {});
    }

    // Clear the cart
    await supabase.from("cart_items").delete().eq("cart_id", cart.id);
    if (appliedCoupon) {
      await supabase.from("carts").update({ coupon_code: null }).eq("id", cart.id);
    }

    return json({ order_number: orderNumber, order_id: order.id, total: total.toFixed(2) });
  } catch (err) {
    return json({ error: (err as Error).message || "حدث خطأ أثناء إنشاء الطلب" }, 500);
  }
});
