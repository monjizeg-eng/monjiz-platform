#!/usr/bin/env node
/**
 * Legacy script — the web app no longer uses Supabase.
 *
 * An admin account is created automatically in the browser on first load
 * (localStorage key monjiz_local_db_v1). Default login: admin@admin.com / admin1234
 *
 * You can override defaults with Vite env vars when building or in .env:
 *   VITE_MONJIZ_ADMIN_EMAIL
 *   VITE_MONJIZ_ADMIN_PASSWORD
 *
 * To wipe all local data: clear site data for this origin (or remove localStorage keys
 * starting with monjiz_).
 */

console.log(`
Monjiz — local-only mode (no cloud database).
  • Open the app once; the seeded admin is created in this browser.
  • Default credentials: admin@admin.com / admin1234 (unless overridden by env).
  • To reset: clear localStorage for the site, then reload.
`);
