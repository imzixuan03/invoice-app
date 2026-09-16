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
      includeAssets: ["invoice.png"],
      manifest: {
        name: "Invoice Tracker",
        short_name: "Tracker",
        description: "Personal invoice tracker",
        theme_color: "#152C3E",
        background_color: "#EEF1F6",
        display: "standalone",
        start_url: "/invoice-app/",
        icons: [
          { src: "invoice.png", sizes: "192x192", type: "image/png" },
          { src: "invoice.png", sizes: "512x512", type: "image/png" }
        ]
      }
    })
  ]
});
