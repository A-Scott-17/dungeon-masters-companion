# Optional campaign API

This Cloudflare Worker is **not deployed**. The GitHub Pages site works without it. Do not add real campaign data to this repository.

## Set up

1. Create a Cloudflare D1 database. Copy `wrangler.toml.example` to `wrangler.toml` and replace the database ID. Keep that local configuration out of Git if it contains account details.
2. Apply `schema.sql` to the D1 database with Wrangler. Create a Cloudflare Access application for the Worker and an access policy for your group. Configure the Access application to pass a JWT to the Worker. Allow browser preflight OPTIONS requests through Access if needed for the cross-origin frontend.
3. Set Worker variables: `ACCESS_TEAM_DOMAIN` (for example `team.cloudflareaccess.com`), `ACCESS_AUD` (the Access application audience), `ALLOWED_ORIGIN` (the exact GitHub Pages origin), `DM_EMAILS` (comma-separated allowed DM email addresses), `OPENAI_MODEL`, `ASSISTANT_INSTRUCTIONS`, and `MAX_DAILY_REQUESTS` (default 30, maximum 100). Add `OPENAI_API_KEY` as a Worker secret, never a plain repository variable.
4. Deploy the Worker. Test sign-in, denied access, DM-only writes, rate limits, and streaming before setting `VITE_ORACLE_API_URL` in the frontend build. Use an OpenAI project with a spending limit.

The Worker offers `POST /oracle`, `GET /records/{campaign|characters|sessions|house_rules|rules}`, and DM-only `PUT /records/{...}`. It verifies the Access JWT signature and audience, uses D1 for persistent records and daily request counts, and streams OpenAI response events. Records must be loaded through the authenticated API, with the applicable edition included in your rules JSON.

The current frontend editors still use local demo storage. Connect them to these records endpoints and add per-user roles and migration before using real campaign information across devices. Protect the Worker with Access before exposing its URL. The prepared Worker has not been tested against a live Cloudflare or OpenAI account.
