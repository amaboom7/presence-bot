const http = require('http');
const https = require('https');

const DISCORD_ID = '1508859937340522586';
const PORT = process.env.PORT || 3000;

let cachedData = { success: false };
let lastFetch = 0;

function fetchPresence() {
  const url = `https://api.lanyard.rest/v1/users/${DISCORD_ID}`;
  https.get(url, { headers: { 'Accept': 'application/json' } }, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
      try {
        const d = JSON.parse(body);
        if (d.success) { cachedData = d.data; lastFetch = Date.now(); }
      } catch (e) { /* ignore parse errors */ }
    });
  }).on('error', () => { /* ignore fetch errors */ });
}

// Fetch immediately, then every 1 second
fetchPresence();
setInterval(fetchPresence, 1000);

http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-cache');
  res.end(JSON.stringify({ success: true, data: cachedData, updated: lastFetch }));
}).listen(PORT, () => console.log(`Presence bot running on port ${PORT}`));
