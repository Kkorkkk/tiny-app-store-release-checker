import test from "node:test";
import assert from "node:assert/strict";
import { checkRelease, renderChecklist, renderHtml, screenshotGroups } from "../src/index.js";

test("renders release gate checklist", () => {
  const results = checkRelease({ agreements: "active", bundleId: "com.example.app", version: "1.0 build 1", screenshots: ["a", "b", "c"] });
  assert.equal(results.find((item) => item.key === "agreements").ok, true);
  assert.equal(results.find((item) => item.key === "bundleId").ok, true);
  assert.equal(checkRelease({ bundleId: "bad id" }).find((item) => item.key === "bundleId").ok, false);
  assert.match(renderChecklist(results), /App Store Release Check/);
  assert.match(renderHtml(results), /<h1>/);
  assert.deepEqual(screenshotGroups("6.7-inch, 6.5-inch, iPad"), ["6.7", "6.5", "iPad"]);
});
