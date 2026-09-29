async function checkService(name, baseUrl) {
  const li = document.createElement("li");
  try {
    const res = await fetch(`${baseUrl}/health`);
    li.textContent = `${name}: ${res.ok ? "up" : "down"}`;
    li.className = res.ok ? "ok" : "down";
  } catch {
    li.textContent = `${name}: unreachable`;
    li.className = "down";
  }
  document.getElementById("status").appendChild(li);
}

for (const [name, url] of Object.entries(SERVICES)) {
  checkService(name, url);
}
