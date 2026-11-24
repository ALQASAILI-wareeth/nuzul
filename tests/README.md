# NUZUL tests

Headless-browser checks for the static site. This folder is not published (see `_config.yml`).

## Run

```
npm i puppeteer-core            # once, anywhere; or set PUPPETEER=/path/to/puppeteer-core
python3 -m http.server 8765 &   # from the repository root
BASE=http://localhost:8765 node tests/functional.js
BASE=http://localhost:8765 node tests/destinations.js
BASE=http://localhost:8765 node tests/security.js
```

Optional: `CHROME=/path/to/chrome`, `OUT=results.txt`. Each script exits with code 1 if any check fails.

| Script | Checks | Covers |
|---|---|---|
| `functional.js` | 58 | Photos under 8 network conditions, filters, tabs, compare sheet, tracking parameters, favourites, language switch, edit search, home search, links and images, pull-to-refresh, desktop layout |
| `destinations.js` | 164 | Every home-page and deal destination shows a hotel list (English name, typed Arabic name, English UI) |
| `security.js` | 19 | Script injection through every URL parameter and the edit-search field, hidden-character and length handling, hostile Wikipedia responses, poisoned localStorage, `rel=noopener` on new-tab links |

Requests to Wikipedia and Cloudflare are simulated or blocked, so results do not depend on the network. The scripts do not test a real phone, Safari, the real Wikipedia API, or a real booking.

## search.js
Types 48 real-world destination spellings on the home page (Arabic/English variants, countries, hotel names, typos, nonsense) and checks what the results page shows, plus the suggestion list and the Enter key. 51 checks.

## wording.js
Static check, no browser. NUZUL shows no prices, so the pages must not promise a best price or a price comparison done by NUZUL itself. Fails if a retired phrase comes back or an approved phrase goes missing. 23 checks. Run: `node tests/wording.js`.
