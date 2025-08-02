import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  plugins: [tailwindcss(), react(), svgr()],
  server: {
    host: "0.0.0.0",
    port: parseInt(process.env.VITE_PORT || "3000", 10),
    watch: {
      usePolling: true,
    },
  },
});
