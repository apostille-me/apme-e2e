import assert from "node:assert/strict";
import test from "node:test";
import { startFixtureServer } from "../support/fixture-server.mjs";

test("offline fixture exposes bounded health and contract surfaces", async (t) => {
  const fixture = await startFixtureServer();
  t.after(() => fixture.close());
  const health = await fetch(`${fixture.baseURL}/healthz`).then((response) => response.json());
  assert.equal(health.ok, true);
  const contracts = await fetch(`${fixture.baseURL}/contracts`).then((response) => response.json());
  assert.equal(contracts.mode, "offline-fixture");
});

test("offline fixture rejects unknown routes without exposing the landing page", async (t) => {
  const fixture = await startFixtureServer();
  t.after(() => fixture.close());

  const unknown = await fetch(`${fixture.baseURL}/api/v1/cases/unknown`);
  assert.equal(unknown.status, 404);
  assert.equal(unknown.headers.get("cache-control"), "no-store");
  assert.equal(unknown.headers.get("content-type"), "application/json");
  assert.deepEqual(await unknown.json(), { error: "not_found" });

  const root = await fetch(fixture.baseURL);
  assert.equal(root.status, 200);
  assert.match(await root.text(), /data-e2e-ready="true"/);
});

test("offline fixture fails closed for unauthorized HTTP methods", async (t) => {
  const fixture = await startFixtureServer();
  t.after(() => fixture.close());
  for (const path of ["/healthz", "/contracts", "/"]) {
    const response = await fetch(`${fixture.baseURL}${path}`, { method: "POST" });
    assert.equal(response.status, 405);
    assert.equal(response.headers.get("allow"), "GET");
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.deepEqual(await response.json(), { error: "method_not_allowed" });
  }
});
