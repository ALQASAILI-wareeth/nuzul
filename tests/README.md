# NUZUL tests

Headless-browser checks for the static site. This folder is not published (see `_config.yml`).

## Run

```
npm ci --prefix tests           # once: installs the pinned puppeteer-core into tests/node_modules
PUPPETEER=$PWD/tests/node_modules/puppeteer-core tests/run-all.sh    # every suite, with a summary and exit codes
```

(Any other copy of puppeteer-core also works: set `PUPPETEER=/path/to/puppeteer-core`.)

## Automatic runs (GitHub Actions)

`.github/workflows/tests.yml` runs the nine suites on every pull request to `main` or `dev`, on every push to `dev`, and on demand (Actions tab → tests → Run workflow). Each suite runs as its own job, `suite (<name>)`; the job named **`tests`** passes only when all nine pass, so `tests` is the one check to require before merging into `main`. The full output of each suite is printed in the job log and kept for 14 days as an artifact (`output-<suite>`). The workflow only reads the repository (`permissions: contents: read`); it does not build or deploy the site. `.github/` and `tests/` are not part of the published site.

Or one suite at a time:

```
python3 -m http.server 8765 &   # from the repository root
BASE=http://localhost:8765 node tests/functional.js
BASE=http://localhost:8765 node tests/destinations.js
BASE=http://localhost:8765 node tests/security.js
```

Optional: `CHROME=/path/to/chrome`, `OUT=results.txt`. Each script exits with code 1 if any check fails.

| Script | Checks | Covers |
|---|---|---|
| `functional.js` | 60 | Photos under 8 network conditions, filters, tabs, compare sheet, tracking parameters, favourites, language switch, edit search, home search, links and images, pull-to-refresh, desktop layout |
| `destinations.js` | 164 | Every home-page and deal destination shows a hotel list (English name, typed Arabic name, English UI) |
| `security.js` | 21 | Script injection through every URL parameter and the edit-search field, hidden-character and length handling, hostile Wikipedia responses, poisoned localStorage, `rel=noopener` on new-tab links, Content-Security-Policy |
| `probes.js` | 36 | Numbered injection probes (R01–R20 results page, E01–E04 edit field, H01–H12 home page) from the 24 Nov 2026 closure review: encoded and split payloads, attribute break-outs, saved data, typed search, company request box |
| `timezones.js` | 135 | Dates in 15 time zones: default dates, check-out auto-fill for every day of a leap year, correction of a check-out that is not after check-in, the "continue" box |
| `unicode.js` | 34 | Destination text cut at 80 characters next to emoji, flags, skin tones, combining marks and half characters: no script error, cards rendered, name ends on a whole character |
| `storage.js` | 19 | Damaged or tampered saved data (last search, favourites, visit counter, language) on the home and results pages, and blocked or full storage |

Requests to Wikipedia and Cloudflare are simulated or blocked, so results do not depend on the network. The scripts do not test a real phone, Safari, the real Wikipedia API, or a real booking.

## search.js
Types 48 real-world destination spellings on the home page (Arabic/English variants, countries, hotel names, typos, nonsense) and checks what the results page shows, plus the suggestion list and the Enter key. 51 checks.

## wording.js
Static check, no browser. NUZUL shows no prices, so the pages must not promise a best price, a price comparison done by NUZUL itself, or free cancellation it cannot verify. Fails if a retired phrase comes back or an approved phrase goes missing (home page, results page, app manifest, share image present), and that customer contact is by email only (no WhatsApp chat link or phone number). Since 24 Nov 2026 it also bans the "24/7 support" line and, where the `studio/` folder exists, checks the video texts and the launch-image and cover templates. 103 checks in the repository, 78 on a copy of the published site (which has no `studio/` folder). Run: `node tests/wording.js` (optionally pass a folder to check another copy).

## Added on 24 Nov 2026 (closure findings F-1 to F-4)

- `security.js` gained two checks. The display name `n` is now tested with an Arabic letter in front of each payload, because the page only ever trusted `n` in that form. The saved-search check now also poisons the adults, rooms and date fields.
- `timezones.js` is the regression test for F-1 (check-out filled with the check-in day in zones behind UTC). The five zones named in the finding are marked with `*` in its output.
- `unicode.js` is the regression test for F-3 (a cut inside an emoji broke the results page).
- `storage.js` is the regression test for F-2 and F-4 (saved values written without checking their type).
- `probes.js` keeps the numbered cases used in the review reports, so a case number means the same thing in every report.
