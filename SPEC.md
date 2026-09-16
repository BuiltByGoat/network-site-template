# network-site-template

First-party **Megapot Network** cloneable site template.

## Why this exists

`BuiltByGoat/megapot-templates` and the old `megapot-build-template` lineage are deprecated for new work.
Those kits were slapped together. This repo is the clean replacement: cribble-first, Cloudflare Pages, private attribution.

## Product goals

1. Developers clone this repo (or use it via megapot.build factory later) and ship a marketing site or light product shell that drives Megapot player/developer signups.
2. Public pages never show referral codes, wallet addresses, or other attribution secrets (see PRIVACY).
3. Play CTAs go through a private `/go` hop; destination URL + any referral params live only in host env.
4. All outbound Megapot links stamp hostname UTMs (campaign params, not secrets).

## Non-goals

- Do not copy HTML/CSS from megapot-templates (daily/degen/formal/fun).
- Do not embed Megapot’s old starter-kit wizard UI.
- Do not put ELOTTO, wallet addresses, or invite paths in public markup, README badges, or footers.

## Stack (locked)

- TypeScript + Next.js App Router (static `output: "export"` → `out/`)
- Cloudflare Pages deploy from `out/`
- Pages Function at `functions/go.ts` (or equivalent) for `/go` 302
- Biome for lint/format
- pnpm
- Design tokens from cribble SoT: `#000` background, `#02fe01` green, `#ff6a1a` ember, `#9bdcf5` ice — dark-first UI

## Ship in v1

1. **Marketing shell** at `/` — hero, value props, Play CTA → `/go`, dashboard + megapotresults.com links with UTMs, document title `Play on Megapot | {SITE_NAME}`, footer hub → megapot.network.
2. **`/go` Function** — reads `MEGAPOT_PLAY_DESTINATION` (private); appends `utm_source`, `utm_medium`, `utm_campaign` from config; 302. Empty env → public Megapot origin only (no secrets).
3. **Privacy scan script** — fails CI if wallet-like hex, invite paths, or known secret patterns appear in `out/` / public sources.
4. **UTM check script** — Play/dashboard/results and `/go` stamp agreed UTMs.
5. **`.env.example`** — names only, no values.
6. **README** — clone, `pnpm i`, `pnpm build`, Pages deploy notes; privacy rules; env table.
7. **`pnpm check`** — lint + types + privacy + utm + redirect unit tests.

## Env names (document only)

| Name | Public? | Role |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_NAME` | yes | Site label; title is `Play on Megapot \| {SITE_NAME}` |
| `SITE_HOSTNAME` | no | Deploy host; hostname-style `utm_source` |
| `MEGAPOT_SITE_HOSTNAME` | no | Alias of `SITE_HOSTNAME` |
| `MEGAPOT_UTM_SOURCE` | no | Optional explicit `utm_source` if hostname envs are unset |
| `MEGAPOT_UTM_MEDIUM` | no | `utm_medium` override (default `template`) |
| `MEGAPOT_UTM_CAMPAIGN` | no | `utm_campaign` override (default `network-v1`) |
| `MEGAPOT_PLAY_DESTINATION` | no | Absolute play URL for `/go` |
| `MEGAPOT_REFERRER_ADDRESS` | no | Reserved; unused in marketing shell |
| `MEGAPOT_API_KEY` | no | Reserved; never `NEXT_PUBLIC_` |

## UTMs (v1)

`utm_source` comes from `SITE_HOSTNAME` (hostname-style), not the literal `network-site-template`.

- `utm_source` ← hostname from `SITE_HOSTNAME`, else `MEGAPOT_SITE_HOSTNAME`, else `MEGAPOT_UTM_SOURCE`, else Pages `CF_PAGES_URL`
- `utm_medium` ← `MEGAPOT_UTM_MEDIUM`, else `template`
- `utm_campaign` ← `MEGAPOT_UTM_CAMPAIGN`, else `network-v1`

Latest results CTA → `https://megapotresults.com` (cohort SoT), not drawingresults as primary. Footer hub → `https://megapot.network`. Both stamp the same campaign UTMs.

## Done when

- `pnpm check` and `pnpm build` pass
- Privacy + UTM scripts pass on generated `out/`
- No dependency on or copy from megapot-templates
- PR describes how to deploy to Cloudflare Pages
