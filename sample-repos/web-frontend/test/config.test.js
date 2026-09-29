const { test } = require("node:test");
const assert = require("node:assert");
const { SERVICES } = require("../public/config");

test("frontend is configured for both backend services", () => {
  assert.ok(SERVICES["user-service"]);
  assert.ok(SERVICES["payments-service"]);
});
