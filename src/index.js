#!/usr/bin/env node
import { readFileSync } from "node:fs";

const requiredScreenshotGroups = ["6.7", "6.5", "iPad"];

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
    if (key === "screenshots") ok = screenshotGroups(value).length >= 3;
    return { key, label, ok, detail: formatDetail(key === "screenshots" ? screenshotGroups(value) : value) };
  });
}

export function screenshotGroups(value) {
  if (typeof value === "string") return requiredScreenshotGroups.filter((group) => value.toLowerCase().includes(group.toLowerCase()));
  if (!Array.isArray(value)) return [];
  const text = value.map((item) => typeof item === "string" ? item : `${item.device || ""} ${item.width || ""}x${item.height || ""}`).join(" ").toLowerCase();
  return requiredScreenshotGroups.filter((group) => text.includes(group.toLowerCase()));
}

function formatDetail(value) {
  if (Array.isArray(value)) return value.length ? value.join(", ") : "missing";
  return value || "missing";
}

export function renderChecklist(results) {
  const done = results.filter((result) => result.ok).length;
  return [
    `# App Store Release Check (${done}/${results.length})`,
    "",
    ...results.map((result) => `- [${result.ok ? "x" : " "}] ${result.label}: ${result.detail}`)
  ].join("\n") + "\n";
}

export function renderHtml(results) {
  const rows = results.map((result) => `<li><strong>${result.ok ? "PASS" : "MISS"}</strong> ${result.label}: ${escapeHtml(result.detail)}</li>`).join("");
  return `<!doctype html><meta charset="utf-8"><title>App Store Release Check</title><style>body{font-family:system-ui;margin:32px;max-width:860px}li{margin:8px 0}</style><h1>App Store Release Check</h1><ul>${rows}</ul>`;
}

function escapeHtml(text) {
  return String(text).replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char]));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const file = process.argv[2];
  if (!file) {
    console.error("Usage: app-store-release-checker app-release.json");
    process.exit(1);
  }
  try {
    const results = checkRelease(JSON.parse(readFileSync(file, "utf8")));
    console.log(process.argv.includes("--html") ? renderHtml(results) : renderChecklist(results));
    process.exit(results.every((result) => result.ok) ? 0 : 2);
  } catch (error) {
    console.error(`app-store-release-checker: ${error.message}`);
    process.exit(2);
  }
}
