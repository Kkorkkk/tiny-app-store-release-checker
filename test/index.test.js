import test from "node:test";
import assert from "node:assert/strict";
import { checkRelease, parseCliArgs, renderChecklist, renderHtml, requiredScreenshots, screenshotGroups, truthyValue } from "../src/index.js";

test("renders release gate checklist", () => {
  const results = checkRelease({ agreements: "active", bundleId: "com.example.app", version: "1.0 build 1", screenshots: ["a", "b", "c"] });
  assert.equal(results.find((item) => item.key === "agreements").ok, true);
  assert.equal(results.find((item) => item.key === "bundleId").ok, true);
  assert.equal(checkRelease({ bundleId: "bad id" }).find((item) => item.key === "bundleId").ok, false);
  assert.match(renderChecklist(results), /App Store Release Check/);
  assert.match(renderHtml(results), /<h1>/);
  assert.deepEqual(screenshotGroups("6.7-inch, 6.5-inch, iPad"), ["6.7", "6.5", "iPad"]);
  assert.deepEqual(screenshotGroups("667-inch, 65-inch"), []);
  assert.deepEqual(requiredScreenshots({ supportedDevices: "iphone" }), ["6.7", "6.5"]);
  assert.equal(checkRelease({ supportedDevices: "iphone", screenshots: "6.7-inch, 6.5-inch" }).find((item) => item.key === "screenshots").ok, true);
  assert.equal(checkRelease({ agreements: "false" }).find((item) => item.key === "agreements").ok, false);
  assert.equal(checkRelease({ bundleId: "com.example.-bad" }).find((item) => item.key === "bundleId").ok, false);
  assert.equal(checkRelease({ version: "abc1.0xyz" }).find((item) => item.key === "version").ok, false);
  assert.equal(truthyValue("no"), false);
  assert.deepEqual(parseCliArgs(["examples/app-release.json", "--html"]), { file: "examples/app-release.json", html: true });
  assert.throws(() => parseCliArgs([]), /Usage:/);
});
