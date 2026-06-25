# telemetry

Anonymous feature-adoption telemetry for [tf2pickup.org](https://tf2pickup.org) instances. Each
instance periodically reports a small, non-PII snapshot of how it is configured (which features are
on/off, which integrations are enabled, queue type, version). The dashboard aggregates these into
adoption stats — e.g. how many instances have the experimental `games.skill_suggestions` enabled.

Unlike [atlas](https://atlas.tf2pickup.org), the ingest endpoint is **unauthenticated and
anonymous**: instances report out of the box (opt-out via `TELEMETRY_DISABLED=1`), are identified
only by a salted hash of their URL, and never send player data or operator-identifying fields. The
**dashboard**, however, is gated behind Steam login — only the Steam id64s in `ADMIN_STEAM_IDS` can
view the aggregated stats.

## Telemetry API

```
PUT /api/telemetry
Content-Type: application/json

{
  "instanceId": "5f3c…",          // sha256 of the instance url
  "version": "4.14.1",
  "queueConfig": "6v6",
  "features": {
    "games.skill_suggestions": true,
    "games.voice_server_type": "mumble",
    "players.etf2l_account_required": false
  },
  "integrations": { "discord": true, "serveme": true, "twitch": false }
}
```

Responses: `204` on success, `400` on an invalid payload, `429` when the per-IP rate limit is
exceeded. Instances are deduplicated by `instanceId`; a snapshot expires 8 days after the last
report.

## Configuration

All environment variables are listed in [sample.env](sample.env). The important ones:

- `MONGODB_URI` — MongoDB connect string
- `PUBLIC_URL` — public url of the dashboard, used as the Steam OpenID realm/return url
- `SESSION_SECRET` — secret used to sign the dashboard session cookie (≥ 32 chars)
- `ADMIN_STEAM_IDS` — comma-separated Steam id64s allowed to view the dashboard
- `RATE_LIMIT_MAX` — accepted requests per minute per client IP (default 20)
- `TRUST_PROXY` — read the client IP from `X-Forwarded-For` when behind a proxy

## Development

```sh
docker compose up -d mongo
pnpm install
pnpm dev
```

- `pnpm lint` — prettier + eslint
- `pnpm test` — unit tests
- `pnpm build` — compile to `dist/`

## CI / CD

GitHub Actions mirror the other tf2pickup services:

- `check` — prettier, eslint and the JSX xss-scan
- `tests` — unit tests
- `build` — builds the Docker image and, on pushes to `master` and on `*.*.*` tags, publishes it to
  `ghcr.io/tf2pickup-org/telemetry` (tags: `latest`, `stable`, `sha-…` and semver). Uses the
  built-in `GITHUB_TOKEN`, so no extra secrets are required.

## Deployment

The service is deployed by pulling the published image. On the host:

```sh
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

`docker-compose.prod.yml` runs the `:stable` image alongside MongoDB and listens on port 3000;
put it behind your reverse proxy (which is why `TRUST_PROXY=true`) and point
`telemetry.tf2pickup.org` at it. Provide `SESSION_SECRET` and `ADMIN_STEAM_IDS` on the host (e.g. in
a `.env` file next to the compose file) so the dashboard login works. To auto-pull new `:stable`
images, add a watchtower container or re-run the two commands above after each release.
