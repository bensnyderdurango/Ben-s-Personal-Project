const express = require("express");

const app = express();
app.use(express.json());

const users = new Map();
let nextId = 1;

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "user-service" });
});

app.get("/users", (req, res) => {
  res.json([...users.values()]);
});

app.post("/users", (req, res) => {
  const { name, email } = req.body || {};
  if (!name || !email) {
    return res.status(400).json({ error: "name and email are required" });
  }
  const user = { id: String(nextId++), name, email };
  users.set(user.id, user);
  res.status(201).json(user);
});

app.get("/users/:id", (req, res) => {
  const user = users.get(req.params.id);
  if (!user) return res.status(404).json({ error: "not found" });
  res.json(user);
});

module.exports = app;
