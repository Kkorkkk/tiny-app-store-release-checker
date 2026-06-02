# Tiny App Store Release Checker

[![CI](https://github.com/Kkorkkk/tiny-app-store-release-checker/actions/workflows/ci.yml/badge.svg)](https://github.com/Kkorkkk/tiny-app-store-release-checker/actions/workflows/ci.yml)

## Overview / 项目说明

English: Tiny App Store Release Checker is a local readiness checklist for small iOS App Store submissions. It reviews metadata fields, bundle ID shape, version format, screenshots, privacy answers, build selection, IAP notes, and review materials without logging into App Store Connect.

中文：Tiny App Store Release Checker 是一个面向小型 iOS App Store 提交的本地准备度检查清单。它会检查元数据、Bundle ID 格式、版本号、截图、隐私回答、构建选择、IAP 说明和审核材料，但不会登录 App Store Connect 或提交任何内容。

A local checklist for indie iOS App Store releases.

## Install

```bash
npx tiny-app-store-release-checker examples/app-release.json
npm install -g tiny-app-store-release-checker
app-store-release-checker examples/app-release.json
```

## Quick start

```bash
npm install
npm test
node src/index.js examples/app-release.json
node src/index.js examples/app-release.json --html > report.html
open public/index.html
```

It checks agreements, bundle ID shape, version, metadata, screenshots, privacy, build selection, IAP notes, and review assets. Screenshot checks look for 6.7-inch, 6.5-inch, and iPad coverage in the local metadata by default, or only the required groups when `supportedDevices` is `iphone` or `ipad`.

The CLI rejects common falsey strings such as `false`, `no`, and `0`, and the browser demo mirrors the same stricter bundle ID, version, and screenshot checks.

## Limits

This is a local readiness check. It does not log into App Store Connect or submit anything.

## Status

Experimental 0.1 CLI. The tool is small on purpose, with no runtime dependencies. Review generated commands, code, and reports before using them in production workflows.
