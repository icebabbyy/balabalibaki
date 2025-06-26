// vite.config.ts (เวอร์ชันที่แก้ไขแล้ว)

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  
  // --- ✅✅✅ เพิ่มส่วนนี้เข้าไปทั้งหมด ✅✅✅ ---
  appType: 'spa', // <--- บอก Vite ว่านี่คือแอปแบบ SPA

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
