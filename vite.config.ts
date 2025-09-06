import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(), // ใช้เฉพาะ dev
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  build: {
    // ห้ามปล่อย source map
    sourcemap: false,

    // มินิฟายพร้อมตัดคอมเมนต์/console ในโปรดักชัน (อ่านยากขึ้น)
    minify: "terser",
    terserOptions: {
      format: { comments: false },
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },

    // บังคับชื่อไฟล์เป็น hash ล้วน
    rollupOptions: {
      output: {
        // entry และ chunk เป็นแฮชล้วน
        entryFileNames: "assets/[hash].js",
        chunkFileNames: "assets/[hash].js",

        // จัดการ asset (รวมถึง CSS) ให้เป็นแฮชล้วน
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name || "";
          if (name.endsWith(".css")) return "assets/[hash].css";
          return "assets/[hash][extname]";
        },
      },
    },
    // กัน edge case ที่บางปลั๊กอินพยายามฝัง sourceMappingURL
    cssCodeSplit: true,
  },
}));
