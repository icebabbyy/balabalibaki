import { defineConfig } from "vite";
import react from "@vitejs/plugin-react"; // แนะนำให้ใช้ตัวนี้แทน @vitejs/plugin-react-swc เพื่อความเสถียรของ Path Alias
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
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // --- ส่วนนี้ถูกต้องแล้ว ---
  build: {
    sourcemap: false,
  },
}));