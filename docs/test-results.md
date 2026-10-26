# Test results — 26 October 2026

## Verified

| Check | Result |
| --- | --- |
| API TypeScript / frontend production build (`npm run build`) | Passed |
| API unit and integration tests | 41 passed |
| Frontend regression tests | 16 passed |
| Chromium end-to-end workflows (`npm run test:e2e`) | 5 passed |
| Manual browser demonstration | Healthy route → failed R1–R2 link → restored route verified |
| One-command startup (`npm run demo`) | Frontend HTTP 200; API healthy; 8 devices and 7 links seeded |
| Responsive / reduced motion | 390 × 844 layout and reduced-motion browser check passed |

The API tests use real temporary MongoDB, not mocked database calls. Browser tests launch their own seeded API and frontend on ports 3100 and 5174. The configured persistent database was not used or cleared. Automated testing covers 62 passing tests in total; no coverage percentage is claimed.

## Browser workflows exercised

- Overview and navigation across all seven pages; eight devices and seven visible topology links.
- Animated R1 → R3 route, pause/resume, speed change, link failure, unreachable status, and recovery.
- Diagnostics status and notes saved, changed, and verified after reload.
- Report generation and successful Markdown download.
- Failure scenario creation, update, and deletion of disposable test data.
- VLSM calculation, invalid IPv4 rejection, reserved capacity, saving, and connected topology for the saved design.
- Narrow viewport navigation and simulation controls without page overflow.

## Issues corrected

- VLSM endpoint mismatch; signed integer overflow for high IPv4 addresses and /0; invalid CIDRs and host counts; incorrect leftover CIDR decomposition. Corrected two pre-existing tests whose supposedly invalid allocations actually fit their parent networks.
- Generated device IDs were not reflected in interface/link references. Seeded designs now connect correctly; rerunning the seed repairs legacy hostname references without replacing the existing starter design.
- Topology edges had no geometry and device positions were random. The view now uses deterministic positions, visible paths, animated traffic, source/destination controls, and graph-based failure recovery.
- Saving a VLSM design created disconnected placeholder devices. It now creates a core router and access switch links from the calculated allocation and preserves reserved capacity.
- VLSM requests ran on every keystroke and stale responses could overwrite new inputs. Calculations are debounced and stale responses are ignored.
- Test-list response shape did not match the frontend; scenario lists validated URL parameters instead of query parameters; Markdown downloads were parsed as JSON.
- Validated/coerced request values were discarded, PATCH bodies lacked validation, missing records returned success envelopes, and malformed JSON became an internal error.
- Connectivity matrices used older results, stopped after 100 records, mixed test types, and assumed reverse-direction success. They now use the latest directional ping observations.
- Diagnostics used fixed addresses, retained stale status, duplicated local records, and saved notes on every keystroke. The checklist now derives from the active design, updates saved records, and saves notes on blur.
- API tests could clear the configured database. Tests now use a disposable database and run database suites sequentially.
- Deleting a design left related test/scenario records behind; creating child records could reference a nonexistent design. Allocation changes now require explicit topology updates when existing links/interfaces would become stale.
- Hardcoded “Live”, “API Connected”, and “Verified” labels misrepresented recorded or illustrative data. Status and routing views now distinguish API availability, design expectations, examples, and observations.
- The shared link-button renderer crashed entire pages. Fixed its Radix slot usage and added a regression test. Also corrected the scenario dropdown's accessible label.
- Shared cards added duplicate padding; the header reserved the sidebar width twice; mobile navigation lacked accessible names. Updated the layout, spacing, neutral palette, glass panels, focus styles, page transitions, and reduced-motion behaviour.
- MongoDB connection logs exposed the full connection URI. It is no longer logged. Removed competing shutdown handlers that bypassed the server's shutdown sequence.

## Reproduce

```powershell
npm install
npm run build
npm test
npx playwright install chromium
npm run test:e2e
```

Use [Run and demonstrate CorporateNet](run-and-simulate.md) for the presentation walkthrough and persistent database setup. The first demo/test launch may download a MongoDB binary. npm is the tested installation path; the root pnpm lockfile was also synchronized.

## Limits

Browser automation ran in Chromium; Firefox, Safari, load tests, and penetration tests were not run. ESLint is not configured in the original project, so lint was not used as a validation gate. No Cisco Packet Tracer `.pkt` file or captured network evidence is present; hardware/IOS behaviour was not verified. The web simulator models reachability rather than full protocol timing. Demo data is temporary and resets when its MongoDB process stops.
