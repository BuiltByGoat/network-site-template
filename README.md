# network-site-template

First-party **Megapot Network** cloneable site template. Cribble-first. Cloudflare Pages. Private `/go`.

**Not** derived from `megapot-templates`, `megapot-build-template`, or the old starter-kit lineage. See [SPEC.md](./SPEC.md) and [PRIVACY.md](./PRIVACY.md).

## Clone → build

Requires Node 22+ and [pnpm](https://pnpm.io).

```bash
git clone https://github.com/BuiltByGoat/network-site-template.git
cd network-site-template
pnpm i
cp .env.example .env   # names only; fill locally, never commit values
pnpm build             # Next.js App Router, output: "export" → out/
pnpm check             # lint (Biome) + types + tests + privacy + UTMs
```

`pnpm check` builds `out/` then runs the privacy scan and UTM check against it.

Local preview with the `/go` Function:

```bash
pnpm build
pnpm preview           # wrangler pages dev out
```

## Cloudflare Pages deploy

1. Create a Pages project from this repo (Git integration, not a lone `out/` upload — Functions live in `functions/`).
2. **Framework preset:** Next.js (or None).
3. **Build command:** `pnpm build`
4. **Build output directory:** `out`
5. **Node version:** `22` (see `.nvmrc`)
6. Under **Settings → Variables and Secrets**, set env **names** from the table below. Keep private vars out of `NEXT_PUBLIC_*`.

Pages serves static files from `out/`. The play hop is a **plain JS** Pages Function:

- `functions/go.js` — `onRequest` / `onRequestGet` 302 with Location UTMs
- `functions/go/index.js` — same file for trailing-slash `/go/`
- `out/_routes.json` — `include: ["/*"]`, exclude only real static assets (`/`, `/index.html`, `/_next/*`, `/icon.svg`, 404s). Never exclude `/go`.

Do not add `functions/go.ts` or `account_id` in `wrangler.toml`. Empty `MEGAPOT_PLAY_DESTINATION` 302s to the public Megapot origin only.

Never add a Next.js `src/app/go` page. If `next build` emits `out/go/` or `out/go.html`, the build strips them and **fails** so they cannot win a static 200.

Smoke after deploy (or `pnpm preview`):

```bash
curl -sI https://YOUR_DOMAIN/go
curl -sI https://YOUR_DOMAIN/go/
# Both must be HTTP 302 with Location containing
# utm_source=network-site-template&utm_medium=template&utm_campaign=network-v1
```

## Env

| Name | Public? | Role |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_NAME` | yes | Site label |
| `MEGAPOT_PLAY_DESTINATION` | no | Absolute play URL for `/go` |
| `MEGAPOT_REFERRER_ADDRESS` | no | Reserved; unused in v1 |
| `MEGAPOT_API_KEY` | no | Reserved; never `NEXT_PUBLIC_` |

Documented names only. Do not put real values in git.

## Default UTMs (v1)

Outbound Megapot links (dashboard, results, and the `/go` hop) stamp:

- `utm_source=network-site-template`
- `utm_medium=template`
- `utm_campaign=network-v1`

Play CTAs are local `/go`. Dashboard and results point at the public Megapot origin with those UTMs already in the href.

## Scripts

| Script | What it does |
| --- | --- |
| `pnpm lint` | Biome |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm test` | Redirect + UTM + privacy unit tests |
| `pnpm privacy` | Scan generated `out/` |
| `pnpm utms` | Assert Play/dashboard/results + `/go` stamp agreed UTMs |
| `pnpm go` | Fail if `/go` would be a static 200; live-check Function 302 + UTMs |
| `pnpm check` | All of the above, including a build |

## Stack

TypeScript, Next.js App Router (`output: "export"`), pnpm, Biome, Cloudflare Pages Functions. Design tokens from cribble SoT: background `#000`, green `#02fe01`, ember `#ff6a1a`, ice `#9bdcf5`.
