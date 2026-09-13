import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// IMPORTANT: replace "invoice-app" below with your actual GitHub repo name.
// GitHub Pages serves your site from https://<username>.github.io/<repo-name>/,
// so Vite needs to know that subpath to load assets (JS/CSS/icons) correctly.
const REPO_NAME = "invoice-app";

export default defineConfig({
  base: `/${REPO_NAME}/`,
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["apple-touch-icon.png"],
      manifest: {
        name: "Invoice Ledger",
        short_name: "Ledger",
        description: "Personal invoice tracker",
        theme_color: "#1F2A44",
        background_color: "#F2F0EB",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" }
        ]
      }
    })
  ]
});
