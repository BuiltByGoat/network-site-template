# Privacy

Public pages and generated `out/` must stay free of attribution secrets.

## Never ship in markup, README badges, or footers

- Referral codes
- Wallet addresses
- Invite paths
- `MEGAPOT_API_KEY` values
- Play destinations that belong in host env

## Where secrets live

| Name | Public? | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_NAME` | yes | Site label only |
| `SITE_HOSTNAME` | no | Deploy host; becomes hostname-style `utm_source` |
| `MEGAPOT_SITE_HOSTNAME` | no | Alias of `SITE_HOSTNAME` |
| `MEGAPOT_UTM_SOURCE` | no | Optional explicit `utm_source`; campaign param, not a secret |
| `MEGAPOT_UTM_MEDIUM` | no | `utm_medium` override |
| `MEGAPOT_UTM_CAMPAIGN` | no | `utm_campaign` override |
| `MEGAPOT_PLAY_DESTINATION` | no | Absolute play URL for `/go` |
| `MEGAPOT_REFERRER_ADDRESS` | no | Reserved; unused in v1 |
| `MEGAPOT_API_KEY` | no | Reserved; never `NEXT_PUBLIC_` |

`.env.example` lists **names only**. Set values in a gitignored `.env` or Cloudflare Pages **Variables and Secrets**.

## Checks

`pnpm privacy` scans generated `out/` for wallet-like hex, invite paths, and known secret patterns. `pnpm utms` confirms Play goes through `/go`, Latest results go to megapotresults.com, the footer hub goes to megapot.network, and outbound links stamp resolved campaign UTMs from `SITE_HOSTNAME`. `pnpm go` fails if `/go` would be a static 200, requires `functions/go.js` + `functions/go/index.js`, and live-checks both paths HTTP 302 with hostname-style `utm_source` from `SITE_HOSTNAME` (`curl -sI`).
