// 📦 backend/server.js (Express-Server mit API & GA4 Polling)

const express = require("express");
const fs = require("fs");
const path = require("path");
const redis = require("./redis");
const { fetchLiveUsers } = require("./ga4");
const config = require("./config.json");

const app = express();
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});


let trafficData = {}; // fallback falls Redis nicht läuft

const getTodayFilename = () => {
  const today = new Date().toISOString().slice(0, 10);
  return path.join(__dirname, "data", `${today}.json`);
};

// 🔁 Polling-Funktion alle 30 Sek.
setInterval(async () => {
  const now = new Date();
  const hour = now.getHours();

  for (const site of config.sites) {
    const count = await fetchLiveUsers(site.propertyId);
    const key = `${site.id}:${hour}`;
    await redis.incrBy(key, count);
    await redis.expire(key, 60 * 60 * 48); // 48h speichern
  }

  // zusätzlich in JSON-Datei speichern
  const filename = getTodayFilename();
  const snapshot = {};
  for (const site of config.sites) {
    for (let h = 0; h <= 23; h++) {
      const val = await redis.get(`${site.id}:${h}`) || 0;
      if (!snapshot[h]) snapshot[h] = {};
      snapshot[h][site.id] = parseInt(val);
    }
  }
  fs.writeFileSync(filename, JSON.stringify(snapshot, null, 2));
}, 30 * 1000);

// 🚪 API Endpoints
app.get("/api/stats", async (req, res) => {
  const filename = getTodayFilename();
  const json = fs.readFileSync(filename);
  res.setHeader("Content-Type", "application/json");
  res.send(json);
});

app.get("/api/config", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.json(config);
});

// 💡 Wichtig: frontend von hier ausliefern (same-origin für CORS-freies Setup)
app.use(express.static(path.join(__dirname, '../frontend')));

app.listen(PORT, () => {
  console.log(`Dashboard läuft auf Port ${PORT}`);
});