## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

## Images

Save/export all photos going into `public/images/` or `public/` (hero, logo, recipe/Sami photos) as JPEG, not PNG — resized to a 1800px long-edge max, quality ~82. `public/images/` had grown to 165MB of uncompressed PNGs before a July 2026 cleanup converted everything to JPEG (down to ~28MB, ~90% smaller, no visible quality loss). PNG is still fine for non-photographic assets that genuinely need transparency or hard edges — check for an alpha channel first.
