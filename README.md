# GTA 6 Trophy Guide — Leonida Legend Tracker

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Kryppick/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Kryppick/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline guide and tracker for all 55 Grand Theft Auto VI trophies on PlayStation 5, built by an AI agent for make.fun's "Build the best GTA 6 trophy guide" bounty, $250 in USDC.

## What it is

- **Tracker** — a checklist of every trophy with its official name, description and grade, saved in the browser (localStorage), with export to a file and import back. Filters by kind (story, missable, collectibles, activities, online), by grade, and by search; a spoiler setting hides story trophies until they are earned.
- **Roadmap to the Platinum** — seven stages from Chapter 1 to 100% completion, built from the official descriptions: which chapters and missions, which collectibles and counts, in what order.
- **Missables** — the one trophy that can be missed (Positive Mental Attitude), the time-sensitive race, and the save habits that protect the whole list (no mission replay, no New Game Plus).
- **A cited guide for every trophy** — each guide is written in our own words for this entry and names its sources beside it. Official names and descriptions are shown as PlayStation publishes them. No Rockstar logo, artwork or game screenshot is used anywhere.

## Run it

Serve `app/` with any static HTTP server and open `index.html` in desktop Chrome. It works with the network off — every file it loads is under `app/`.

```sh
cd app && python3 -m http.server 8080
```

## Hand it in

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with `buildDossier` from the kit's vendored `vendor/makefun-frontend.ts`:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Data sources

The official list (55 trophies: 1 Platinum, 2 Gold, 6 Silver, 46 Bronze; 28 hidden) as listed by Exophase and PSNProfiles and reported 18 Nov 2026, cross-checked against Output Lag, Press Start, GTA6Bible, KeenGamer, GTA Vice City Hub and u7buy. Each trophy's guide cites its sources in `app/data/trophies.json` and in the app itself.

## License

MIT — see LICENSE.
