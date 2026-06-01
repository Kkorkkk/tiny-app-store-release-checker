# Tiny App Store Release Checker

A local checklist for indie iOS App Store releases.

## Quick start

```bash
npm install
npm test
node src/index.js examples/app-release.json
node src/index.js examples/app-release.json --html > report.html
open public/index.html
```

It checks agreements, bundle ID shape, version, metadata, screenshots, privacy, build selection, IAP notes, and review assets. Screenshot checks look for 6.7-inch, 6.5-inch, and iPad coverage in the local metadata.

## Limits

This is a local readiness check. It does not log into App Store Connect or submit anything.
