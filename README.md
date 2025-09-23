React + Vite + Tailwind ERP Frontend Starter
============================================

Steps to run:

1) Extract the ZIP and open a terminal in the project folder.

2) Install dependencies:
   npm install

3) Start dev server:
   npm run dev
   # opens at http://localhost:5173 by default

4) Tailwind is already configured (tailwind.config.js). If you edit it, restart the dev server.

5) To connect with your backend API, call endpoints like http://localhost:3000/api/... from the React app (use axios or fetch).
   You may choose to run a proxy (Vite supports proxy config in vite.config.js).

Files added:
- src/components: Sidebar.jsx, InvoiceForm.jsx, InvoicePreview.jsx
- src/icons.js: path map for assets
- assets/icons: SVG icons
- tailwind.config.js, postcss.config.cjs, styles.css

Need help wiring API calls or building more pages? Tell me which screens to convert next.
