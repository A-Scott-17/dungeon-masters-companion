# The Dungeon Master's Companion

A small fantasy companion for a tabletop campaign. The public site runs in **demo mode** with fictional characters and campaign notes. The Oracle uses local example responses; it does not call OpenAI.

## Run locally

Install Node.js 22 and pnpm 11, then run:

```sh
pnpm install
pnpm dev
```

Run `pnpm build` to check the production build. The Vite base path is set for the `dungeon-masters-companion` GitHub Pages repository.

## Demo data and real campaigns

Fictional starter data lives in `src/data.ts`. In DM Mode, you can edit the demo campaign, characters, and session recaps. Those edits are saved **only in the current browser's localStorage**. They are not private or shared across devices. Do not enter actual secret campaign notes, character details, or API keys into the public demo.

For a real campaign, deploy a private backend with account authentication and server-side authorization, then move campaign records and approved recap updates into a persistent database. Keep DM notes behind a server-enforced DM role. The current recap analyzer extracts matching sentences from the entered summary; the DM chooses which suggestions become campaign notes.

## OpenAI connection

The frontend's `src/services/oracle.ts` is the mock provider. Replace its use in `src/App.tsx` with a streaming request to your authenticated backend when that backend is deployed. The backend should retrieve rules and campaign records from server-side storage, apply house rules first, and call the OpenAI API with a configurable model and editable instructions. Keep `OPENAI_API_KEY` and any private campaign data only in the backend environment.

Before enabling real requests, enforce server-side authentication and DM roles, per-user rate limits, a daily usage or spending ceiling, input size limits, and logging that excludes private note contents. GitHub Pages cannot run this backend. No OpenAI integration or cross-device sync is active in the demo.

## Deploy

The GitHub Actions workflow in `.github/workflows/deploy.yml` builds the frontend on pushes to `main` and deploys `dist` to GitHub Pages. In repository Settings → Pages, choose **GitHub Actions** as the build and deployment source.

## Rules sources

Quick Rules are original beginner summaries with links to the [official SRD](https://www.dndbeyond.com/srd). The selector distinguishes 2014 SRD 5.1 and 2024 SRD 5.2.1. Check the full SRD and your DM's house rules for precise wording. SRD content is available under CC BY 4.0; the summaries here are not a substitute for the full text.
