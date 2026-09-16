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
| `MEGAPOT_PLAY_DESTINATION` | no | Absolute play URL for `/go` |
| `MEGAPOT_REFERRER_ADDRESS` | no | Reserved; unused in v1 |
| `MEGAPOT_API_KEY` | no | Reserved; never `NEXT_PUBLIC_` |

`.env.example` lists **names only**. Set values in a gitignored `.env` or Cloudflare Pages **Variables and Secrets**.

## Checks

`pnpm privacy` scans generated `out/` for wallet-like hex, invite paths, and known secret patterns. `pnpm utms` confirms Play goes through `/go` and that dashboard/results stamp the default UTMs. `pnpm go` fails if `out/` contains static `/go` HTML and live-checks that `/go` and `/go/` HTTP 302 with hostname UTMs.
