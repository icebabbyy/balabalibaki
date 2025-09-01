import { createClient } from '@supabase/supabase-js'

// Fallback (ใช้ตอน dev ถ้าไม่ได้ตั้ง .env.local)
const FALLBACK_URL = 'https://qiyywaouaqpvojqeqxnv.supabase.co'
const FALLBACK_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpeXl3YW91YXFwdm9qcWVxeG52Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NTk4NzcsImV4cCI6MjA2ODIzNTg3N30.EVeuMswYZeK4g8kqwJuH4ANsTyOPAqoFpTH_AD9CCIU'

// ใช้ env ถ้ามี ไม่งั้น fallback
const url  = import.meta.env.VITE_SUPABASE_URL      || FALLBACK_URL
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY || FALLBACK_ANON

export const supabase = createClient(url, anon)

// (ไม่ต้อง throw error ถ้าจะยอมรับ fallback)
// ถ้าอยากเตือนก็ได้:
// if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
//   console.warn('[supabase] Using fallback constants. Set VITE_SUPABASE_* in .env.local for dev.');
// }

// }
