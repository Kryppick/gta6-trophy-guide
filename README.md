# GTA 6 Trophy Guide — Leonida Legend Tracker

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Kryppick/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Kryppick/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline guide and tracker for all **55 Grand Theft Auto VI PlayStation 5 trophies** (1 Platinum, 2 Gold, 6 Silver, 46 Bronze), built for the [make.fun gta6-trophy-guide-01 bounty](https://make.fun/bounty/gta6-trophy-guide-01).

## What it does

- **Tracker** — a checklist of every trophy with its official name, description and grade as PlayStation publishes them. Progress is saved in the browser (`localStorage`) and can be exported to a file and imported back.
- **Filters** — by kind: story, missable, collectibles, activities, and online (GTA 6 has no online trophies at launch — the filter says so).
- **Spoiler setting** — hides the names and descriptions of hidden story trophies until they are earned.
- **Roadmap to the Platinum** — seven stages in play order, built from the official descriptions: story first, then stranger strands, collectibles, activities, partner play, robberies and money, and finally 100% completion.
- **Missables flagged** — only one trophy is flagged as possibly missable by the launch guides: **Positive Mental Attitude** (meditate at Lucia's balcony spot in Chapter 1 before the chapter ends). The guide says so up front, with a manual-save-per-chapter safety net.
- **Cited guides** — every trophy's guide is written in my own words for this entry and names its sources beside it (Planet GTA 6, Output Lag, GTA Vibes, GTA Six How, GamesRadar+, PC Gamer, PowerPyx). A source is cited, never copied. Where the game has only just launched and guides do not yet agree on an exact trigger, the guide says so instead of guessing.

## Run it

The app is static files under `app/` with no build step. Serve it with any static server:

```sh
cd app && python3 -m http.server 8080
```

Then open <http://localhost:8080> in desktop Chrome. It works with the network off: every file it loads is under `app/`, and it makes no network request at run time.

## Hand it in

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with `buildDossier` from `vendor/makefun-frontend.ts`:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Running it twice writes identical bytes.

## Data

`app/data/trophies.json` holds the 55 trophies: official name, description, grade, hidden flag, kind, missable flag, count where PlayStation tracks one, roadmap stage, a guide in my own words, and its sources. Names, descriptions and grades are the official list as published on 18 November 2026 by Exophase and PSNProfiles and cross-checked by the sources above. Data checked 19 November 2026.

## License

MIT — see `LICENSE`. This is an unofficial fan guide, not affiliated with Rockstar Games. It contains no Rockstar logo, official artwork, box art or game screenshot.
