/*
# Seed bookstore catalog with realistic Arabic sample data

Inserts 8 categories, 10 authors, 14 realistic Arabic books across multiple genres,
the author/category links (via INSERT...SELECT on stable slugs/names), and a sample coupon.
Safe to re-run (ON CONFLICT DO NOTHING).
*/

-- Categories
INSERT INTO public.categories (name_ar, name_en, slug, description_ar, icon, sort_order) VALUES
  ('الأدب والروايات', 'Literature & Novels', 'literature', 'روايات عربية ومترجمة، أدب كلاسيكي ومعاصر', 'BookOpen', 1),
  ('الشعر', 'Poetry', 'poetry', 'دواوين شعرية عربية وغيرها', 'Feather', 2),
  ('الفلسفة والفكر', 'Philosophy & Thought', 'philosophy', 'كتب الفلسفة والفكر الإسلامي والمعاصر', 'Brain', 3),
  ('التاريخ والتراث', 'History & Heritage', 'history', 'كتب التاريخ والسير والتراث العربي والإسلامي', 'Scroll', 4),
  ('الدين والروحانيات', 'Religion & Spirituality', 'religion', 'كتب الدين والتفسير والفقه والروحانيات', 'Sparkles', 5),
  ('علوم وتقنية', 'Science & Technology', 'science', 'كتب العلوم والتكنولوجيا والبرمجة', 'Atom', 6),
  ('كتب الأطفال', 'Children Books', 'children', 'كتب وقصص للأطفال والناشئة', 'Baby', 7),
  ('تطوير الذات', 'Self Development', 'self-help', 'كتب تطوير الذات والنجاح والإدارة', 'TrendingUp', 8)
ON CONFLICT (slug) DO NOTHING;

-- Authors
INSERT INTO public.authors (name_ar, name_en, bio_ar, country, featured) VALUES
  ('نجيب محفوظ', 'Naguib Mahfouz', 'أديب مصري حاصل على جائزة نوبل للآداب عام 1988، من أعظم روائيي العرب.', 'مصر', true),
  ('طه حسين', 'Taha Hussein', 'عميد الأدب العربي، أديب وناقد مصري رائد في التحديث والتعليم.', 'مصر', true),
  ('أحلام مستغانمي', 'Ahlem Mosteghanemi', 'روائية جزائرية من أشهر كاتبات الرواية العربية المعاصرة.', 'الجزائر', true),
  ('غسان كنفاني', 'Ghassan Kanafani', 'كاتب وروائي فلسطيني رائد في أدب المقاومة.', 'فلسطين', true),
  ('محمد حسنين هيكل', 'Mohamed Hassanein Heikal', 'صحفي وكاتب مصري بارز، محلل سياسي ومؤرخ معاصر.', 'مصر', false),
  ('جبران خليل جبران', 'Khalil Gibran', 'شاعر ورسام وفيلسوف لبناني، من أكثر الكتاب العرب انتشارًا عالميًا.', 'لبنان', true),
  ('نزار قباني', 'Nizar Qabbani', 'شاعر سوري عاشق، اشتهر بشعره عن المرأة والحب والحرية.', 'سوريا', true),
  ('أبو حيان التوحيدي', 'Abu Hayyan al-Tawhidi', 'أديب وفيلسوف مسلم من القرن الرابع الهجري، يُلقّب بـ«شيخ الأدباء».', 'العراق', false),
  ('يوسف زيدان', 'Youssef Ziedan', 'روائي وفيلسوف مصري، حائز على جائزة البوكر العربية عن «عزازيل».', 'مصر', false),
  ('محمود درويش', 'Mahmoud Darwish', 'شاعر فلسطيني وطني وإنساني، يُعد أحد أهم شعراء العربية المعاصرين.', 'فلسطين', true)
ON CONFLICT DO NOTHING;

-- Books: 14 realistic Arabic titles across categories
INSERT INTO public.books (slug, title_ar, title_en, description_ar, description_en, isbn_10, isbn_13, publisher, publication_year, language, page_count, cover_url, regular_price, sale_price, stock_quantity, average_rating, rating_count, featured, bestseller, active, source_name, source_id)
VALUES
('thalathyyat-alqahira', 'ثلاثية القاهرة', 'The Cairo Trilogy', 'ملحمة روائية تروي قصة عائلة السيد أحمد عبد الجواد عبر ثلاثة أجيال في القاهرة أوائل القرن العشرين، من أعظم أعمال الأدب العربي الحديث.', 'A sweeping epic following the Abd al-Jawad family across three generations in early 20th-century Cairo.', '9774246031', '9789774246032', 'دار الشروق', 1992, 'ara', 1500, 'https://covers.openlibrary.org/b/id/1234567-L.jpg', 320.00, 256.00, 25, 4.8, 120, true, true, true, 'manual', 'b1'),
('alayyam', 'الأيام', 'The Days', 'سيرة ذاتية روائية لعميد الأدب العربي طه حسين، تصف طفولته في الكُتّاب ورحلته في طلب العلم.', 'An autobiographical novel by Taha Hussein recounting his childhood and pursuit of knowledge.', '9774246007', '9789774246001', 'دار المعارف', 2010, 'ara', 350, 'https://covers.openlibrary.org/b/id/2345678-L.jpg', 180.00, 144.00, 40, 4.6, 85, false, true, true, 'manual', 'b2'),
('dhakirat-aljasad', 'ذاكرة الجسد', 'Memory of the Flesh', 'رواية عن الحب والذاكرة والوطن، تجمع بين تاريخ الجزائر وقصة حب عاطفية مؤثرة.', 'A novel intertwining love, memory, and the history of Algeria.', '9947000143', '9789947000140', 'دار الآداب', 2009, 'ara', 560, 'https://covers.openlibrary.org/b/id/3456789-L.jpg', 280.00, 224.00, 18, 4.7, 200, true, true, true, 'manual', 'b3'),
('rijal-fi-alshams', 'رجال في الشمس', 'Men in the Sun', 'رواية فلسطينية تتابع ثلاثة لاجئين يحاولون العبور إلى الكويت في خزان شاحنة، رمز لمعاناة الشعب الفلسطيني.', 'A Palestinian novel following three refugees trying to cross into Kuwait.', '9950050044', '9789950050042', 'دار العودة', 2008, 'ara', 120, 'https://covers.openlibrary.org/b/id/4567890-L.jpg', 120.00, 96.00, 30, 4.5, 65, false, false, true, 'manual', 'b4'),
('alnabi', 'النبي', 'The Prophet', 'كتاب فلسفي شعري يقدم حكمة جبران في تأملات عن الحب والزواج والعمل والموت، مترجم لعشرات اللغات.', 'A philosophical poetic book of wisdom on love, marriage, work, and death.', '9953870034', '9789953870032', 'دار الفنون', 2015, 'ara', 160, 'https://covers.openlibrary.org/b/id/5678901-L.jpg', 150.00, 120.00, 50, 4.9, 320, true, true, true, 'manual', 'b5'),
('diwan-nizar', 'ديوان نزار قباني', 'Nizar Qabbani Anthology', 'مجموعة شعرية تجمع أجمل قصائد نزار قباني في الحب والمرأة والوطن.', 'A poetry anthology collecting Nizar Qabbani''s finest poems on love, women, and homeland.', '9957870044', '9789957870040', 'منشورات نزار قباني', 2018, 'ara', 480, 'https://covers.openlibrary.org/b/id/6789012-L.jpg', 200.00, 160.00, 22, 4.7, 150, false, true, true, 'manual', 'b6'),
('azazeel', 'عزازيل', 'Azazeel', 'رواية تاريخية تدور أحداثها في القرن الخامس الميلادي، تبحث في صراع الإيمان والشك.', 'A historical novel set in the fifth century exploring faith and doubt.', '9774248212', '9789774248210', 'دار الشروق', 2012, 'ara', 380, 'https://covers.openlibrary.org/b/id/7890123-L.jpg', 240.00, 192.00, 15, 4.6, 95, true, false, true, 'manual', 'b7'),
('albasbousa-walqadi', 'العلوم الطبيعية للمرحلة الابتدائية', 'Natural Sciences for Primary School', 'كتاب تعليمي مبسّط يشرح العلوم الطبيعية للأطفال بصور توضيحية ملونة.', 'An illustrated science book introducing natural sciences to children.', '9774249999', '9789774249996', 'دار المعارف', 2020, 'ara', 96, 'https://covers.openlibrary.org/b/id/8901234-L.jpg', 95.00, 76.00, 60, 4.3, 40, false, false, true, 'manual', 'b8'),
('al-imta-wal-muwasah', 'الإمتاع والمؤانسة', 'Enjoyment and Conviviality', 'موسوعة أدبية وفلسفية لأبي حيان التوحيدي، حوارات في العلم والأدب والعقل.', 'A literary and philosophical encyclopedia of dialogues on knowledge and reason.', '9957870088', '9789957870088', 'دار الكتب العلمية', 2016, 'ara', 720, 'https://covers.openlibrary.org/b/id/9012345-L.jpg', 300.00, 240.00, 12, 4.4, 30, false, false, true, 'manual', 'b9'),
('khafaya-al-qahira', 'خفايا القاهرة', 'Cairo Secrets', 'كتاب توثيقي يكشف أسرار القاهرة التاريخية وأحيائها القديمة وقصصها المخفية.', 'A documentary book revealing the historic secrets of old Cairo.', '9774247000', '9789774247009', 'دار الشروق', 2019, 'ara', 280, 'https://covers.openlibrary.org/b/id/1122334-L.jpg', 210.00, NULL, 8, 4.2, 18, false, false, true, 'manual', 'b10'),
('fi-mithl-saif-dayeq', 'في مثل هذه الأيام', 'In Days Like These', 'مجموعة مقالات سياسية للكاتب محمد حسنين هيكل عن أحداث الشرق الأوسط المعاصر.', 'A collection of political essays on the contemporary Middle East.', '9774248110', '9789774248111', 'دار الشروق', 2017, 'ara', 340, 'https://covers.openlibrary.org/b/id/2233445-L.jpg', 180.00, 144.00, 20, 4.0, 22, false, false, true, 'manual', 'b11'),
('fann-al-tafkeer', 'فن التفكير', 'The Art of Thinking', 'كتاب في تطوير الذات يقدم أدوات عملية لتحسين التفكير واتخاذ القرارات.', 'A self-development book offering practical tools to improve thinking and decisions.', '9957870022', '9789957870026', 'دار الفارابي', 2021, 'ara', 220, 'https://covers.openlibrary.org/b/id/3344556-L.jpg', 140.00, 112.00, 45, 4.5, 60, true, true, true, 'manual', 'b12'),
('diwan-mahmoud-darwish', 'ديوان محمود درويش', 'Mahmoud Darwish Anthology', 'مجموعة شعرية تضم نخبة من قصائد محمود درويش في الحب والوطن والمنفى.', 'A poetry anthology of Mahmoud Darwish''s poems on love, homeland, and exile.', '9950050088', '9789950050080', 'رياض الريس للكتب', 2019, 'ara', 520, 'https://covers.openlibrary.org/b/id/4455667-L.jpg', 220.00, 176.00, 30, 4.9, 180, true, true, true, 'manual', 'b13'),
('barnamij-siyagh', 'أساسيات البرمجة بلغة سي', 'Programming Fundamentals in C', 'كتاب تعليمي يشرح أساسيات البرمجة بلغة C للمبتدئين مع أمثلة عملية.', 'An introductory programming book covering C fundamentals with practical examples.', '9774248888', '9789774248884', 'دار الكتب العلمية', 2022, 'ara', 420, 'https://covers.openlibrary.org/b/id/5566778-L.jpg', 260.00, 208.00, 35, 4.4, 48, false, false, true, 'manual', 'b14')
ON CONFLICT (slug) DO NOTHING;

-- Book-author links via INSERT...SELECT on stable slugs/names
INSERT INTO public.book_authors (book_id, author_id)
SELECT b.id, a.id FROM public.books b, public.authors a
WHERE (b.slug='thalathyyat-alqahira' AND a.name_ar='نجيب محفوظ')
   OR (b.slug='alayyam' AND a.name_ar='طه حسين')
   OR (b.slug='dhakirat-aljasad' AND a.name_ar='أحلام مستغانمي')
   OR (b.slug='rijal-fi-alshams' AND a.name_ar='غسان كنفاني')
   OR (b.slug='alnabi' AND a.name_ar='جبران خليل جبران')
   OR (b.slug='diwan-nizar' AND a.name_ar='نزار قباني')
   OR (b.slug='azazeel' AND a.name_ar='يوسف زيدان')
   OR (b.slug='al-imta-wal-muwasah' AND a.name_ar='أبو حيان التوحيدي')
   OR (b.slug='khafaya-al-qahira' AND a.name_ar='محمد حسنين هيكل')
   OR (b.slug='fi-mithl-saif-dayeq' AND a.name_ar='محمد حسنين هيكل')
   OR (b.slug='fann-al-tafkeer' AND a.name_ar='يوسف زيدان')
   OR (b.slug='diwan-mahmoud-darwish' AND a.name_ar='محمود درويش')
   OR (b.slug='barnamij-siyagh' AND a.name_ar='يوسف زيدان')
ON CONFLICT DO NOTHING;

-- Book-category links via INSERT...SELECT on stable slugs
INSERT INTO public.book_categories (book_id, category_id)
SELECT b.id, c.id FROM public.books b, public.categories c
WHERE (b.slug='thalathyyat-alqahira' AND c.slug='literature')
   OR (b.slug='alayyam' AND c.slug='literature')
   OR (b.slug='dhakirat-aljasad' AND c.slug='literature')
   OR (b.slug='rijal-fi-alshams' AND c.slug='literature')
   OR (b.slug='alnabi' AND c.slug='philosophy')
   OR (b.slug='alnabi' AND c.slug='poetry')
   OR (b.slug='diwan-nizar' AND c.slug='poetry')
   OR (b.slug='azazeel' AND c.slug='literature')
   OR (b.slug='azazeel' AND c.slug='philosophy')
   OR (b.slug='albasbousa-walqadi' AND c.slug='children')
   OR (b.slug='albasbousa-walqadi' AND c.slug='science')
   OR (b.slug='al-imta-wal-muwasah' AND c.slug='philosophy')
   OR (b.slug='khafaya-al-qahira' AND c.slug='history')
   OR (b.slug='fi-mithl-saif-dayeq' AND c.slug='history')
   OR (b.slug='fann-al-tafkeer' AND c.slug='self-help')
   OR (b.slug='diwan-mahmoud-darwish' AND c.slug='poetry')
   OR (b.slug='barnamij-siyagh' AND c.slug='science')
ON CONFLICT DO NOTHING;

-- Coupon
INSERT INTO public.coupons (code, description_ar, discount_type, discount_value, min_order_amount, active, starts_at, expires_at)
VALUES ('AFQ10', 'خصم 10٪ على كل الطلبات', 'percentage', 10, 0, true, now(), now() + interval '1 year')
ON CONFLICT (code) DO NOTHING;
