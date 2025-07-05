import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://tfwmvpvxilosiyewqjtk.supabase.co";
// แก้ไข Key ในบรรทัดนี้ให้เป็นตัวที่ถูกต้องจากเว็บ Supabase
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmd212cHZ4aWxvc2l5ZXdxanRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2OTEzNzYsImV4cCI6MjA2NzI2NzM3Nn0.TdTxG2HfylzTtEJum5DUjdSDEkiH927kE2QMAk3hMEg";

// ตรวจสอบว่ามีค่าครบถ้วนหรือไม่
if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error("Supabase URL or Anon Key is missing from .env.local file.");
}

// สร้างและ export client ที่ถูกต้อง
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)