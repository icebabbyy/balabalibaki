
-- แก้ไข Storage Bucket Policies ให้ถูกต้อง (รุ่นที่แก้ไขแล้ว)

-- 1. ทำให้ payment-slips bucket เป็น public (สำหรับลูกค้าอัปโหลดสลิป)
UPDATE storage.buckets SET public = true WHERE id = 'payment-slips';

-- 2. ทำให้ product-images bucket เป็น private (เฉพาะแอดมิน) 
UPDATE storage.buckets SET public = false WHERE id = 'product-images';

-- 3. ลบ storage policies เก่าก่อน แล้วสร้างใหม่
DROP POLICY IF EXISTS "Allow public upload to payment-slips" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read from payment-slips" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin upload to product-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read from product-images" ON storage.objects;

-- 4. สร้าง storage policies ใหม่สำหรับ payment-slips bucket
CREATE POLICY "Allow public upload to payment-slips"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'payment-slips');

CREATE POLICY "Allow public read from payment-slips"
ON storage.objects FOR SELECT
USING (bucket_id = 'payment-slips');

-- 5. สร้าง storage policies ใหม่สำหรับ product-images bucket
CREATE POLICY "Allow admin upload to product-images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Allow public read from product-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- 6. แก้ไข RLS policies สำหรับ orders table
DROP POLICY IF EXISTS "Allow insert orders" ON public.orders;
DROP POLICY IF EXISTS "Allow select orders" ON public.orders;
CREATE POLICY "Allow insert orders" ON public.orders 
FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow select orders" ON public.orders 
FOR SELECT USING (true);

-- 7. แก้ไข RLS policies สำหรับ product_images table
DROP POLICY IF EXISTS "Allow insert product images" ON public.product_images;
DROP POLICY IF EXISTS "Allow select product images" ON public.product_images;
DROP POLICY IF EXISTS "Allow delete product images" ON public.product_images;
CREATE POLICY "Allow insert product images" ON public.product_images
FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow select product images" ON public.product_images
FOR SELECT USING (true);
CREATE POLICY "Allow delete product images" ON public.product_images
FOR DELETE USING (true);

-- 8. เปิดใช้งาน RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
