// Edge function: openlibrary-search
// Proxies Open Library search by ISBN or title so the admin "Import book" form
// can fetch metadata without exposing the browser to CORS or rate limits.

import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

interface OLDoc {
  key: string;
  title?: string;
  author_name?: string[];
  cover_i?: number;
  isbn?: string[];
  lccn?: string[];
  first_publish_year?: number;
  publisher?: string[];
  language?: string[];
  number_of_pages_median?: number;
  id_goodreads?: string[];
  id_librarything?: string[];
  cover_edition_key?: string;
  edition_key?: string;
  seed?: string[];
}

interface OLBook {
  key: string;
  title: string;
  authors: string[];
  coverId: number | null;
  coverUrl: string | null;
  isbn10: string | null;
  isbn13: string | null;
  publicationYear: number | null;
  publisher: string | null;
  language: string;
  pageCount: number | null;
  sourceId: string;
}

function extractIsbn(docs: OLDoc): { isbn10: string | null; isbn13: string | null } {
  const isbns = docs.isbn || [];
  let isbn13: string | null = null;
  let isbn10: string | null = null;
  for (const raw of isbns) {
    const clean = raw.replace(/[^0-9Xx]/g, "");
    if (clean.length === 13) isbn13 = isbn13 || clean;
    else if (clean.length === 10) isbn10 = isbn10 || clean;
  }
  return { isbn10, isbn13 };
}

function coverUrlFromId(id: number | null): string | null {
  if (!id) return null;
  return `https://covers.openlibrary.org/b/id/${id}-L.jpg`;
}

function normalizeDoc(doc: OLDoc): OLBook {
  const { isbn10, isbn13 } = extractIsbn(doc);
  const langs = doc.language || [];
  const isArabic = langs.includes("ara");
  return {
    key: doc.key,
    title: doc.title || "",
    authors: doc.author_name || [],
    coverId: doc.cover_i || null,
    coverUrl: coverUrlFromId(doc.cover_i || null),
    isbn10,
    isbn13,
    publicationYear: doc.first_publish_year || null,
    publisher: doc.publisher?.[0] || null,
    language: isArabic ? "ara" : (langs[0] || "eng"),
    pageCount: doc.number_of_pages_median || null,
    sourceId: doc.key?.replace("/works/", "") || doc.cover_edition_key || doc.edition_key?.[0] || "",
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    // Require auth — only admins should import books
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

    // Verify admin role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if (!profile || profile.role !== "admin") {
      return json({ error: "Forbidden — admin only" }, 403);
    }

    const body = await req.json();
    const { query, type = "title" } = body || {};
    if (!query || typeof query !== "string") {
      return json({ error: "Query is required" }, 400);
    }

    const cleanQuery = query.trim();
    let url: string;
    if (type === "isbn") {
      const isbn = cleanQuery.replace(/[^0-9Xx]/g, "");
      url = `https://openlibrary.org/search.json?isbn=${encodeURIComponent(isbn)}&limit=10`;
    } else {
      url = `https://openlibrary.org/search.json?q=${encodeURIComponent(cleanQuery)}&limit=10&language=ara`;
    }

    const resp = await fetch(url, {
      headers: { "User-Agent": "MoqtafaBookstore/1.0" },
    });
    if (!resp.ok) {
      return json({ error: `Open Library returned ${resp.status}` }, 502);
    }

    const data = await resp.json();
    const docs: OLDoc[] = data.docs || [];
    const books: OLBook[] = docs.map(normalizeDoc);

    // Deduplicate by ISBN-13, then by normalized title+author
    const seen = new Set<string>();
    const deduped: OLBook[] = [];
    for (const b of books) {
      let key: string;
      if (b.isbn13) {
        key = `isbn13:${b.isbn13}`;
      } else {
        const normTitle = b.title.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]/g, "");
        const normAuthor = (b.authors[0] || "").toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]/g, "");
        key = `t:${normTitle}|a:${normAuthor}`;
      }
      if (!seen.has(key)) {
        seen.add(key);
        deduped.push(b);
      }
    }

    return json({ results: deduped, count: deduped.length });
  } catch (err) {
    return json({ error: (err as Error).message || "Search failed" }, 500);
  }
});
