// ================================================================
//  Infopace Proxy Server — Gemini Edition (FREE)
//  1. Paste your Gemini API key on line 8
//     Get free key at: https://aistudio.google.com → Get API Key
//  2. Run:  node server.js
//  3. Open: http://localhost:4000
// ================================================================

const API_KEY = '';

// ── Models ──────────────────────────────────────────────────────
// Flash = fast + free (question generation)
// Pro   = smart + free (dashboard analysis)
const MODEL_FAST = 'gemini-2.5-flash';
const MODEL_SMART = 'gemini-2.5-flash';  // both use flash on free tier

// ── No edits needed below ───────────────────────────────────────
const http  = require('http');
const https = require('https');
const fs    = require('fs');
const path  = require('path');
const PORT  = 4000;

const MIME = {
  '.html':'text/html', '.js':'application/javascript',
  '.css':'text/css',   '.json':'application/json',
  '.png':'image/png',  '.ico':'image/x-icon', '.txt':'text/plain'
};

function geminiRequest(model, promptText, callback) {
  const payload = JSON.stringify({
    contents: [{ parts: [{ text: promptText }] }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 8192,
      responseMimeType: 'text/plain'
    }
  });

  const options = {
    hostname: 'generativelanguage.googleapis.com',
    path: `/v1beta/models/${model}:generateContent?key=${API_KEY}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  };

  const req = https.request(options, res => {
    let body = '';
    res.on('data', c => body += c);
    res.on('end', () => callback(null, res.statusCode, body));
  });
  req.on('error', e => callback(e, null, null));
  req.write(payload);
  req.end();
}

http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // ── /api → Gemini proxy ─────────────────────────────────────
  if (req.url === '/api' && req.method === 'POST') {
    if (!API_KEY || API_KEY === 'YOUR_GEMINI_KEY_HERE') {
      res.writeHead(500, {'Content-Type':'application/json'});
      res.end(JSON.stringify({error:'Gemini API key not set. Edit line 8 of server.js'}));
      return;
    }

    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      let payload;
      try { payload = JSON.parse(body); }
      catch(e) { res.writeHead(400); res.end('bad json'); return; }

      const type   = payload._type || 'analysis';
      const prompt = payload.prompt || '';
      const model  = type === 'questions' ? MODEL_FAST : MODEL_SMART;

      console.log('  →  ' + type + ' (' + model + ')');

      geminiRequest(model, prompt, (err, status, respBody) => {
        if (err) {
          console.log('  ❌ Network error:', err.message);
          res.writeHead(502, {'Content-Type':'application/json'});
          res.end(JSON.stringify({error: err.message}));
          return;
        }

        const icon = status < 300 ? '✅' : '❌';
        console.log('  ' + icon + '  ' + status + '  ' + type);

        if (status !== 200) {
          try {
            const e = JSON.parse(respBody);
            console.log('      Error:', e.error?.message || respBody.slice(0,120));
          } catch(_) { console.log('      Raw:', respBody.slice(0,120)); }
        }

        // Convert Gemini response → Anthropic-style response
        // so the HTML parsing code works without changes
        let anthropicStyle;
        try {
          const geminiData = JSON.parse(respBody);
          const text = (geminiData?.candidates?.[0]?.content?.parts||[])
            .map(p => p.text||'').join('');
          // Wrap in Anthropic content format
          anthropicStyle = JSON.stringify({
            candidates: geminiData.candidates,
            content: [{ type: 'text', text: text }]
          });
        } catch(_) {
          anthropicStyle = respBody;
        }

        res.writeHead(status, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(anthropicStyle);
      });
    });
    return;
  }

  // ── Static files ────────────────────────────────────────────
  let fp = req.url === '/' ? '/index.html' : req.url.split('?')[0];
  fp = path.join(process.cwd(), fp);
  fs.readFile(fp, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, {'Content-Type': MIME[path.extname(fp)] || 'text/plain'});
    res.end(data);
  });

}).listen(PORT, () => {
  const ok = API_KEY && API_KEY !== 'YOUR_GEMINI_KEY_HERE';
  console.log('');
  console.log('  Infopace — Gemini Edition (Free)');
  console.log('  ─────────────────────────────────────');
  console.log('  🌐  http://localhost:' + PORT);
  console.log('  🔑  Gemini key: ' + (ok ? '✅ Set (' + API_KEY.slice(0,16) + '...)' : '❌ NOT SET — edit line 8'));
  console.log('  🤖  Model: ' + MODEL_SMART);
  console.log('  ─────────────────────────────────────');
  if (!ok) {
    console.log('');
    console.log('  Get a free key at https://aistudio.google.com');
    console.log('  Then paste it on line 8 of server.js');
  }
  console.log('');
});
