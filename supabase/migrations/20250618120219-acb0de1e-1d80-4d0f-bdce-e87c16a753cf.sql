
-- อัปเดตตาราง profiles ให้มี default role
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'user';

-- สร้าง function สำหรับจัดการ user ใหม่
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    username,
    full_name,
    phone,
    address,
    birth_date,
    role,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NULL),
    COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
    COALESCE(NEW.raw_user_meta_data->>'address', NULL),
    NULL,
    CASE 
      WHEN NEW.email = 'admin@luckyshop.com' THEN 'admin'
      ELSE 'user'
    END,
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$;

-- สร้าง trigger สำหรับเรียก function เมื่อมี user ใหม่
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
