import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://qiyywaouaqpvojqeqxnv.supabase.co";
// แก้ไข Key ในบรรทัดนี้ให้เป็นตัวที่ถูกต้องจากเว็บ Supabase
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpeXl3YW91YXFwdm9qcWVxeG52Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NTk4NzcsImV4cCI6MjA2ODIzNTg3N30.EVeuMswYZeK4g8kqwJuH4ANsTyOPAqoFpTH_AD9CCIU";

// ตรวจสอบว่ามีค่าครบถ้วนหรือไม่
if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error("Supabase URL or Anon Key is missing from .env.local file.");
}

// สร้างและ export client ที่ถูกต้อง
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)