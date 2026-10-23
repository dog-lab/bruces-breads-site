// Sätteri HAST plugin: make every internal link in rendered markdown end in a slash.
// (Filename keeps "rehype" for continuity, but this is a Sätteri plugin -- Astro 7's
// default Markdown processor -- not a unified/rehype one.)
//
// Why: the site's canonicals, sitemap, nav and Cloudflare Pages all use the
// trailing-slash form (/guides/braiding/). Markdown bodies were linking to the
// slashless form (/guides/braiding), which Cloudflare 308-redirects. Googlebot
// followed those links, saw the slashless URL referenced all over the site, and
// picked it over the declared canonical -> Search Console's "Duplicate, Google
// chose different canonical than user". Normalizing links at render time fixes
// every existing link and any written in the future.
//
// Rules: only touches root-relative links ("/foo") and absolute links to the
// site's own host. Leaves alone: "//" protocol-relative, anchors-only, mailto,
// links whose last path segment has a file extension (/downloads/x.pdf), and
// anything already ending in "/". Query strings and #fragments are preserved.

const SITE_HOSTS = new Set(['www.bruces-breads.com', 'bruces-breads.com']);

export function normalizeHref(href) {
  if (typeof href !== 'string' || href === '') return href;

  let prefix = '';
  let rest = href;

  if (/^https?:\/\//i.test(href)) {
    let url;
    try {
      url = new URL(href);
    } catch {
      return href;
    }
    if (!SITE_HOSTS.has(url.hostname)) return href;
    prefix = url.origin;
    rest = url.pathname + url.search + url.hash;
  } else if (!rest.startsWith('/') || rest.startsWith('//')) {
    return href;
  }

  const m = rest.match(/^([^?#]*)([?#].*)?$/);
  const path = m[1];
  const tail = m[2] || '';

  if (path === '' || path.endsWith('/')) return prefix + rest;
  const lastSegment = path.slice(path.lastIndexOf('/') + 1);
  if (/\.[A-Za-z0-9]+$/.test(lastSegment)) return prefix + rest;

  return prefix + path + '/' + tail;
}

// Factory (called once per document, per Sätteri's plugin model). The object it
// returns is exactly what defineHastPlugin() would return, so no import from
// 'satteri' is needed.
export default function internalTrailingSlash() {
  return {
    name: 'internal-trailing-slash',
    element: {
      filter: ['a'],
      visit(node, ctx) {
        const href = node.properties?.href;
        if (typeof href !== 'string') return;
        const fixed = normalizeHref(href);
        if (fixed !== href) ctx.setProperty(node, 'href', fixed);
      },
    },
  };
}
