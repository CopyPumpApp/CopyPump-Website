# CopyPump — Clean Public Site (RS44)

This release is the simplified public website for CopyPump.

Removed from this publication build:
- CP earning, balances and reward flows
- quests/tasks and social verification
- CopyCube and its game/reward layer
- community account / Phantom sign-in used only for rewards
- Rewards legal pages and reward/auth/task APIs

Kept:
- premium EN/RU project website
- product explanation and interactive decision example
- public architecture, risk boundaries, roadmap and project status
- X, Discord, GitHub and project email links
- Privacy, Terms, Security and Contact pages
- minimal public status/health API for the website itself

## Run locally

```bash
npm install
npm run dev:api
npm run dev:web
```

## Production build

```bash
npm install
npm run check
npm start
```

`npm run check:clean` fails if CP Rewards, CopyCube or removed reward/task routes reappear in the public source.

## One-click Windows start

Unzip the project and double-click `START_COPY_PUMP.bat`. The launcher installs dependencies on first use, runs the release checks and a real Vite production build, serves the generated dist through the bundled Node server, waits for the exact release marker, and opens the browser automatically. Use `STOP_COPY_PUMP.bat` to stop the local processes. Requires Node.js 22+.

## Static-hosting resilience (44.2)
The progress surface first reads `/api/public/system`. If the API runtime is not present (for example on a static host), it falls back to `/public-status.json`. This keeps the public project status truthful without presenting a false OFFLINE state.
