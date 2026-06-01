#!/usr/bin/env node
import { readFileSync } from "node:fs";

const gates = [
  ["agreements", "Apple agreements, tax, and banking are active"],
  ["bundleId", "Bundle ID is final"],
  ["version", "Version and build number are set"],
  ["screenshots", "Screenshots exist for required device sizes"],
  ["privacy", "Privacy answers and privacy manifest are complete"],
  ["metadata", "Name, subtitle, keywords, description, support URL are ready"],
  ["build", "A reviewable build is selected"],
  ["reviewNotes", "Review notes and demo account are ready when needed"],
  ["iap", "IAP or subscription products are configured, if used"]
];

export function checkRelease(meta) {
  return gates.map(([key, label]) => {
    const value = meta[key];
    let ok = Boolean(value);
    if (key === "bundleId") ok = /^[A-Za-z0-9]+(\.[A-Za-z0-9-]+)+$/.test(String(value || ""));
    if (key === "version") ok = /\d+\.\d+/.test(String(value || ""));
    if (key === "screenshots" && Array.isArray(value)) ok = value.length >= 3;
    return { key, label, ok, detail: value || "missing" };
  });
}

export function renderChecklist(results) {
  const done = results.filter((result) => result.ok).length;
  return [
    `# App Store Release Check (${done}/${results.length})`,
    "",
    ...results.map((result) => `- [${result.ok ? "x" : " "}] ${result.label}: ${result.detail}`)
  ].join("\n") + "\n";
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const file = process.argv[2];
  if (!file) {
    console.error("Usage: app-store-release-checker app-release.json");
    process.exit(1);
  }
  const results = checkRelease(JSON.parse(readFileSync(file, "utf8")));
  console.log(renderChecklist(results));
  process.exit(results.every((result) => result.ok) ? 0 : 2);
}
