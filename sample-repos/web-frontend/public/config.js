// Upstream services this frontend depends on.
const SERVICES = {
  "user-service": "http://localhost:5002",
  "payments-service": "http://localhost:5001",
};

if (typeof module !== "undefined") module.exports = { SERVICES };
