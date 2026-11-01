import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// TinaCMS is deliberately *not* wired in here as an integration. Bruce's
// Breads uses Tina in plain admin-form mode only (see tina/config.ts) --
// editing recipe/Sami frontmatter through the form at /admin/index.html, no
// click-to-edit on the live page. That admin UI is a self-contained static
// SPA that `tinacms build` writes into public/admin/, so Astro just serves
// it like any other static asset -- no @tinacms/astro integration, no SSR
// adapter, no output: 'server' needed. (An earlier pass at this scaffolded
// the full contextual-editing plumbing -- @tinacms/astro, a Node adapter,
// the tina-island endpoint -- before settling on the simpler form-only
// approach; that scaffold was moved to _tina-scaffold-removed/ for Bruce to
// delete once he's confirmed he doesn't want it.)
//
// Tina is local-editing-only (confirmed August 2026, no Tina Cloud account) --
// Bruce edits via `npm run dev` on his Mac and commits/pushes the result
// himself; the deployed site never needs a working /admin backend. Because of
// that, `npm run build` (what Cloudflare runs) is just `astro build` --
// running `tinacms build` there fails with "Client not configured properly"
// since there's no clientId/token to give it. If tina/config.ts's schema
// changes and the static /admin bundle needs refreshing, run
// `npm run build:admin` locally and commit the updated public/admin/ output;
// it's inert on the live site either way (no backend for it to talk to), so
// letting it go stale between schema changes is harmless, just cosmetic.
export default defineConfig({
  // 1. Add your domain here (without trailing slash)
  site: 'https://www.bruces-breads.com', 
  integrations: [sitemap()],
  output: 'static',
});
