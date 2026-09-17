import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const ingredientRow = z.object({
  name: z.string(),
  weight: z.string(),
  percent: z.string().optional(),
  isTotal: z.boolean().optional(),
  // Per-inclusion handling note (chill until folding in, pat dry, etc.) --
  // rendered as a fourth "Notes" table column. Only meaningful for
  // inclusions; dough rows leave this unset.
  notes: z.string().optional(),
});

// "Notes on Nonstandard Ingredients" -- a per-ingredient callout list that
// sits right after Inclusions in the Recipe Card (the two belong together:
// the table says *how much*, this says *why it behaves the way it does*).
// A couple of recipes (John Dough) have nothing nonstandard at all, so
// nonstandardIngredientsNote is a plain-paragraph escape hatch for that case.
const nonstandardIngredient = z.object({
  ingredient: z.string(),
  note: z.string(),
});

const nutritionFact = z.object({
  label: z.string(),
  amount: z.string(),
});

const vitaminEntry = z.object({
  ingredient: z.string(),
  description: z.string(),
});

const playlistTrack = z.object({
  artist: z.string(),
  track: z.string(),
  album: z.string(),
  year: z.number(),
});

const playlistPhase = z.object({
  phase: z.string(),
  tracks: z.array(playlistTrack),
});

// "If You Like This Bake..." Books & Movies section -- grouped the same
// way the playlist is (a group heading like "For the craft" or "For the
// world tour" plus a list of titles), since that idiom already fits the
// recipe generator spec's grouping convention.
const bookMovieItem = z.object({
  title: z.string(),
  note: z.string(),
});

const bookMovieGroup = z.object({
  groupTitle: z.string(),
  items: z.array(bookMovieItem),
});

const recipes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/recipes' }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string(),
    heroImage: z.string(),
    // Bread-type menu structure decided August 3, 2026 (see CLAUDE.md's
    // "Recipe menu structure (categories)") -- supersedes the earlier
    // savory/sweet/discards split. Classics vs. enriched-sweet is decided
    // by butter/milk dairy enrichment, not by whether the bake tastes sweet.
    // 'discards' REMOVED Sept 17, 2026 -- see the `tags` field below for why.
    // A recipe still gets exactly one section (its real home on the menu);
    // "uses discard" is a cross-cutting property of the recipe, not a home
    // for it, and forcing it into the enum meant a discard recipe had to
    // choose between being findable as a discard recipe and living in its
    // actual best-fit section (Proffle shipped under 'discards' when it's
    // genuinely an Everyday Bake; Two Irons, One Fire is filed under
    // 'everyday-bakes' and was never discoverable as a discard recipe at
    // all). Proffle moved to 'everyday-bakes' the same day this changed.
    section: z.enum([
      'classics',
      'enriched-sweet',
      'pastry-lamination',
      'gluten-free',
      'everyday-bakes',
    ]),
    // General-purpose recipe tags, added Sept 17, 2026 -- same shape as the
    // blog collection's `tags` field below, and the mechanism the "New tags
    // (regional-southern, holiday tags)" TASKS.md line was waiting on.
    // Freeform strings on purpose (Bruce's call): a new tag is just typed
    // into a recipe's frontmatter, no schema edit required, matching how
    // blog tags already work. First real tag is 'discard' (see /discards/,
    // a hub page that lists every tagged recipe across all sections
    // regardless of `section` above) -- 'regional-southern' and holiday
    // tags (Halloween, etc.) can follow the same way once there are enough
    // recipes to justify their own hub pages, no code change needed to add
    // the tag itself.
    tags: z.array(z.string()).default([]),
    // Matches the printable-extras PDF filenames in public/cards/, e.g.
    // "Banana-rama" -> Banana-rama_Recipe_Card.pdf. Deliberately its own
    // field rather than derived from the slug -- a couple of recipes'
    // card files use a different prefix than their slug (Seed Spitters'
    // cards are Seed_Spitters_Seeded_Sourdough_*, not Seed_Spitters_*).
    cardFilePrefix: z.string(),
    dough: z.array(ingredientRow),
    // Freeform paragraph right after the Dough table (hydration/salt
    // reasoning, or "no inclusions this time" for a plain loaf). Optional
    // since not every recipe carries one.
    hydrationSaltNote: z.string().optional(),
    inclusions: z.array(ingredientRow).default([]),
    yieldNote: z.string(),
    // Ingredient flat-lay photo -- rendered right after the Inclusions
    // table/yield note, i.e. right next to the ingredients it's a photo
    // of, rather than wherever it happened to fall in the Markdown body.
    flatlayImage: z.string().optional(),
    flatlayAlt: z.string().optional(),
    ddt: z.string(),
    // Notes on Nonstandard Ingredients -- structured list (the common
    // case) or a single plain-paragraph note for a recipe with nothing
    // nonstandard to call out (John Dough). Rendered right after
    // Inclusions, before Estimated Nutrition.
    nonstandardIngredients: z.array(nonstandardIngredient).default([]),
    nonstandardIngredientsNote: z.string().optional(),
    nutritionBasis: z.string(),
    // The "not precise lab figures, actual values shift with X" caveat
    // sentence that follows nutritionBasis on the website.
    nutritionCaveat: z.string().optional(),
    nutritionFacts: z.array(nutritionFact),
    vitamins: z.array(vitaminEntry),
    nutritionNote: z.string().optional(),
    // Equipment list -- rendered immediately after Estimated Nutrition,
    // still inside the Recipe Card section.
    equipment: z.array(z.string()),
    // Baking Music Playlist (structured -- also feeds the Master Playlist
    // document) and Books & Movies (structured, same grouped shape).
    // Everything else -- any prep-ahead component, the full Step-by-Step
    // Tutorial Script, Alternatives and Improvements, Troubleshooting/FAQ
    // (as a raw HTML table -- see the recipe .md files), Ingredient
    // History Story, and Bloopers -- is plain Markdown body content below
    // the frontmatter, in that exact order, same pattern as the narrative
    // sections already were. This deliberately avoids forcing free-form
    // narrative prose (with inline <figure> images, numbered sub-steps,
    // multiple mixing methods, pH callouts, etc.) into rigid schema
    // fields, which would be brittle to maintain for content that varies
    // a lot per recipe.
    playlist: z.array(playlistPhase),
    booksMovies: z.array(bookMovieGroup),
    publishDate: z.date(),
  }),
});

// Sami the Sourdough Sandwich story collection. Each story is one page:
// a short narrative (the markdown body, with inline <figure> images) plus
// a handful of structured frontmatter fields used to drive the title
// block, hero image, and the map/card metadata on story-map.html.
const sami = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/sami' }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string(),
    location: z.string(),
    // See Sami_the_Sourdough_Sandwich_Voice_Guide.md — pick per story
    // based on destination, not templated across all five.
    voiceMode: z.enum(['Wanderer', 'Field Notes', 'Mischief', 'Cozy', 'Postcard']),
    heroImage: z.string(),
    heroAlt: z.string(),
    // The bold closing pun line, styled distinctly from body copy.
    closingLine: z.string(),
    // Map pin metadata for story-map.html's "Real Map" — kept here so a
    // new story's coordinates travel with the story instead of living
    // only inside the hand-edited SVG.
    mapPin: z.object({
      emoji: z.string(),
      lat: z.number(),
      lon: z.number(),
    }),
    publishDate: z.date(),
  }),
});

// Guides collection -- the site's baking-technique reference library
// (pH/Flour/Hydration, Proofing & Shaping, Braiding, Flour Types &
// Blending, Salt, plus the 4-part Starter Guide), ported into the live
// site Aug 15, 2026 once Bruce signed off after several review passes.
// `group`/`order` drive the guides/index.astro hub grouping -- the four
// Starter Guide parts share group "Starter Guide" and order 1-4 (listed
// first, since the standing starter is the conceptual prerequisite for
// everything else); the five standalone guides are ungrouped, order 5-9.
const guides = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/guides' }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    group: z.string().optional(),
    order: z.number().default(0),
  }),
});

// Blog collection -- standalone story/history pieces (decided Aug 16, 2026:
// these go to the blog, not Guides and not Resources). Founding post is
// "Sourdough and the San Francisco Influence". Date-ordered on the hub;
// `tags` are displayed now and will drive filtering once there are enough
// posts to make filtering meaningful (the site is zero-JS by convention,
// so that will likely be per-tag static pages rather than client-side).
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    heroImage: z.string().optional(),
    heroAlt: z.string().optional(),
    tags: z.array(z.string()).default([]),
    publishDate: z.date(),
  }),
});

export const collections = { recipes, sami, guides, blog };
