# Streamly
Static streaming front-end for the Eporner API v2 (search, id, embed player).
Run: `node server.js [port]` (serves `public/` and proxies `/api/*` to avoid CORS; no dependencies).
Or host `public/` on any static host (uses the API directly, falls back to `/api/`).
Performers gallery is a curated list; each links to an API search by name.
