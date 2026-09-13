# Invoice Ledger

A personal invoice tracker, built as an installable web app (PWA). Runs
entirely in your browser — invoices are stored locally on your device via
IndexedDB, nothing leaves your phone.

## Fields

| Field | Required |
|---|---|
| Invoice ID | Yes |
| Date | Yes |
| Dealer / Company name | Yes |
| Product name | No |
| Product type (SSD, Motherboard, RAM, etc.) | Yes |
| Cost of product | Yes |
| Selling price of product | Yes |
| Profit | Auto-calculated (selling price − cost) |

## Project structure

```
src/
  db.js                    <- ALL data access lives here (the "data layer")
  App.jsx                  <- top-level state + wiring
  components/
    InvoiceList.jsx
    InvoiceForm.jsx
  styles.css
.github/workflows/deploy.yml  <- auto-deploys to GitHub Pages on push to main
```

If you ever add a backend later, you only need to change the insides of the
functions in `db.js` (`getInvoices`, `saveInvoice`, `deleteInvoice`).
Nothing in the components needs to change, since they only call those
functions.

## Running it locally (Windows, VS Code)

1. Install [Node.js](https://nodejs.org) (LTS version) if you don't have it.
2. Open this folder in VS Code.
3. Open a terminal (`` Ctrl+` ``) and run:
   ```
   npm install
   npm run dev
   ```
4. Vite prints a local URL (e.g. `http://localhost:5173`) — open it in your
   browser to test on your PC.

## Deploying to GitHub Pages

1. **Set your repo name.** Open `vite.config.js` and change `REPO_NAME` to
   match whatever you name the GitHub repository (e.g. if your repo is
   `github.com/yourname/invoice-app`, `REPO_NAME` should be `"invoice-app"`).
   This tells the built app where to find its own files once it's hosted at
   `https://yourname.github.io/invoice-app/`.

2. **Add real icons.** Drop square PNGs into `public/` named `icon-192.png`,
   `icon-512.png`, and `apple-touch-icon.png` — these aren't included, and
   without them your home-screen icon will be blank.

3. **Create a GitHub repo** and push this project to it:
   ```
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
   git push -u origin main
   ```

4. **Turn on GitHub Pages:** on GitHub, go to your repo → **Settings** →
   **Pages** → under "Build and deployment", set **Source** to
   **GitHub Actions**.

5. That's it — the included workflow (`.github/workflows/deploy.yml`) builds
   and deploys automatically every time you push to `main`. Check the
   **Actions** tab on GitHub to watch it run; your live URL will be
   `https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/`.

## Getting it onto your iPhone

1. Open your GitHub Pages URL in **Safari** on your iPhone (must be Safari,
   not Chrome — Add to Home Screen for PWAs only works from Safari on iOS).
2. Tap the **Share** icon → **Add to Home Screen**.
3. Launch it from your home screen — it opens full-screen, no browser bar.

## Notes

- Data is stored per-browser, per-device. If you later reinstall Safari's
  data or switch phones, local invoices won't carry over on their own —
  that's the tradeoff of local-first storage, and the reason `db.js` is
  written to make backend sync a contained, future change rather than a
  rewrite.
- "Product type" suggests common PC component categories as you type
  (SSD, RAM, GPU, etc.) but accepts any free text.
- Negative profit (selling price below cost) is highlighted in the list and
  the entry form so mistakes or loss-making sales stand out.
