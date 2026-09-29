const { test } = require("node:test");
const assert = require("node:assert");
const request = require("supertest");
const app = require("../src/app");

test("GET /health returns ok", async () => {
  const res = await request(app).get("/health");
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.status, "ok");
});

test("POST then GET a user", async () => {
  const created = await request(app)
    .post("/users")
    .send({ name: "Ada", email: "ada@example.com" });
  assert.strictEqual(created.status, 201);
  const fetched = await request(app).get(`/users/${created.body.id}`);
  assert.strictEqual(fetched.body.name, "Ada");
});

test("POST /users validates input", async () => {
  const res = await request(app).post("/users").send({ name: "NoEmail" });
  assert.strictEqual(res.status, 400);
});

test("DELETE /users/:id removes a user", async () => {
  const created = await request(app)
    .post("/users")
    .send({ name: "Grace", email: "grace@example.com" });
  const del = await request(app).delete(`/users/${created.body.id}`);
  assert.strictEqual(del.status, 204);
  const fetched = await request(app).get(`/users/${created.body.id}`);
  assert.strictEqual(fetched.status, 404);
});
