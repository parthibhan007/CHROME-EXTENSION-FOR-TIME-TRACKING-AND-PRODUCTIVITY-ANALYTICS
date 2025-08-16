const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// In-memory store for demo (replace with DB)
const userData = {}; // { userId: { date: { site: seconds } } }

// Save log (POST) - example: { userId: "u1", date: "2025-08-16", site: "github.com", seconds: 120 }
app.post('/api/log', (req, res) => {
  const { userId, date, site, seconds, category } = req.body;
  if (!userId || !date || !site) return res.status(400).send({ error: 'missing' });
  userData[userId] = userData[userId] || {};
  userData[userId][date] = userData[userId][date] || {};
  userData[userId][date][site] = (userData[userId][date][site] || 0) + (seconds || 0);
  res.send({ ok: true });
});

// Get aggregated for user/date
app.get('/api/summary/:userId/:date', (req, res) => {
  const { userId, date } = req.params;
  const summary = (userData[userId] && userData[userId][date]) || {};
  res.send(summary);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log('Server running on', PORT));
