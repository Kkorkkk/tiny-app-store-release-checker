#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

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
    let ok = truthyValue(value);
    if (key === "bundleId") ok = /^[A-Za-z0-9]+(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+$/.test(String(value || ""));
    if (key === "version") ok = /^\d+\.\d+(?:\.\d+)?(?:\s+build\s+\d+)?$/i.test(String(value || ""));
    if (key === "screenshots") {
      const requiredGroups = requiredScreenshots(meta);
      ok = requiredGroups.every((group) => screenshotGroups(value).includes(group));
    }
    return { key, label, ok, detail: formatDetail(key === "screenshots" ? screenshotGroups(value) : value) };
  });
}

export function truthyValue(value) {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return !["", "0", "false", "no", "missing"].includes(value.trim().toLowerCase());
  return Boolean(value);
}

export function requiredScreenshots(meta) {
  const devices = String(meta.supportedDevices || meta.devices || "iphone,ipad").toLowerCase();
  if (devices.includes("iphone") && !devices.includes("ipad")) return ["6.7", "6.5"];
  if (devices.includes("ipad") && !devices.includes("iphone")) return ["iPad"];
  return requiredScreenshotGroups;
}

export function screenshotGroups(value) {
  if (typeof value === "string") {
    const tokens = value.split(/[^A-Za-z0-9.]+/).filter(Boolean).map((token) => token.toLowerCase());
    return requiredScreenshotGroups.filter((group) => tokens.includes(group.toLowerCase()));
  }
  if (!Array.isArray(value)) return [];
  const tokens = value.flatMap((item) => {
    if (typeof item === "string") return item.split(/[^A-Za-z0-9.]+/);
    return [item.device, `${item.width || ""}x${item.height || ""}`];
  }).filter(Boolean).map((token) => String(token).toLowerCase());
  return requiredScreenshotGroups.filter((group) => tokens.includes(group.toLowerCase()));
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

export function parseCliArgs(args) {
  const file = args.find((arg) => !arg.startsWith("--"));
  if (!file) throw new Error("Usage: app-store-release-checker app-release.json [--html]");
  return { file, html: args.includes("--html") };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const { file, html } = parseCliArgs(process.argv.slice(2));
    const results = checkRelease(JSON.parse(readFileSync(file, "utf8")));
    console.log(html ? renderHtml(results) : renderChecklist(results));
    process.exit(results.every((result) => result.ok) ? 0 : 2);
  } catch (error) {
    console.error(`app-store-release-checker: ${error.message}`);
    process.exit(2);
  }
}
