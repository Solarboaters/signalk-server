# Signal K admin UI checks — issues 2933 and 2814

Baseline: `0e2440c1ac794acf87aa2233640f90b347e21a22`.

These Chromium checks render the real `Full` admin layout, plugin configuration component, router, state store and SCSS. HTTP responses are intercepted with 77 synthetic plugins and a webapp manifest; no real installed plugins, authentication or boat connections are exercised. The synthetic webapp has no executable bundle: the title test covers the admin wrapper, not operation of an external app.

| Viewport | Original list height | Fixed list height |
|---|---:|---:|
| 1366 × 430 | 148 px | 298 px |
| 1366 × 768 | 486 px | 486 px |
| 1199 × 430 | 2354 px | 2354 px |

All 77 entries remain present. Scrolling to and selecting the last entry succeeds. Filtering to one entry reduces the panel to 61px, rather than forcing an empty 300px panel. The embedded app's browser title changes from `Test Vessel` to `Logbook`.

`before.png` and `after.png` show the same wide, short window. JSON files contain the measured results. The layout fix imposes a 300px maximum-height floor; normal content sizing still applies when there are fewer rows.

## Repeat

1. Install the server's normal dependencies in an isolated checkout. Have Playwright and Chromium available separately.
2. Copy `repro.html` and `repro.tsx` into `packages/server-admin-ui/` temporarily.
3. From that directory run the repository's Vite executable with `--host 127.0.0.1 --port 4173 --strictPort`.
4. Run `node ui-check.cjs before` on the baseline, then `node ui-check.cjs after` with both UI fixes applied. `PLAYWRIGHT_MODULE` can point at a separately installed Playwright module and `CHROMIUM_PATH` at an existing Chromium executable. The `after` run includes assertions for layout, navigation title and controls.
5. Stop Vite and remove the temporary fixture files before normal formatting/testing.

No device or native Safari/iPad testing is claimed. Automated component tests additionally cover switching apps, returning to the dashboard, delayed manifests and vessel-information refreshes.
