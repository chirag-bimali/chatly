import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import process from 'node:process'

export default defineConfig({
  plugins: [tailwindcss(), react(), svgr()],
  server: {
    host: "0.0.0.0",
    allowedHosts: ["chatly.chiragbimali.dev", "chatly.chiragbimali.com.np"], // 👈 add your custom domain here
    port: parseInt(process.env.VITE_PORT || "3000", 10),
    watch: {
      usePolling: true,
    },
  },
});
