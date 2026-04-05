const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(__dirname));

// ── Supabase config ──
const SUPABASE_URL    = 'https://iaibrxnvomsrxjpnjodw.supabase.co';
const SUPABASE_SECRET = process.env.SUPABASE_SECRET_KEY;
const ADMIN_EMAIL     = process.env.ADMIN_EMAIL || 'muhammadjawadahmed8567@gmail.com';

// ══════════════════════════════════════════
// CRON JOB — Keep server alive (ping every 14 min)
// Render free tier sleeps after 15 min of inactivity
// This self-ping prevents that from happening
// ══════════════════════════════════════════
const APP_URL = process.env.APP_URL || 'https://shaykh-ai-klwz.onrender.com';

function keepAlive() {
  fetch(`${APP_URL}/ping`)
    .then(() => console.log(`[KeepAlive] ✅ Pinged at ${new Date().toLocaleTimeString()}`))
    .catch(err => console.log(`[KeepAlive] ⚠️ Ping failed: ${err.message}`));
}

// Ping every 14 minutes (840,000 ms)
setInterval(keepAlive, 14 * 60 * 1000);
console.log('✅ KeepAlive cron job started — pinging every 14 minutes');

// Ping endpoint
app.get('/ping', (req, res) => {
  res.json({ status: 'alive', time: new Date().toISOString() });
});

// ── Helper: query Supabase ──
async function supabase(endpoint, method='GET', body=null) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_SECRET,
      'Authorization': `Bearer ${SUPABASE_SECRET}`,
      'Prefer': method==='POST' ? 'return=representation' : ''
    },
    body: body ? JSON.stringify(body) : null
  });
  if (!res.ok) { const err = await res.text(); throw new Error(err); }
  const text = await res.text();
  return text ? JSON.parse(text) : [];
}

// ── CHAT endpoint ──
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, langPrompt } = req.body;
    const lastQuestion = messages[messages.length-1]?.content || '';
    let knowledgeContext = '';
    try {
      const knowledge = await supabase('/knowledge?select=*&order=created_at.desc');
      if (knowledge.length > 0) {
        const relevant = knowledge.filter(k => {
          if (!k.question && !k.answer) return false;
          const words = lastQuestion.toLowerCase().split(' ').filter(w => w.length > 3);
          return words.some(w => (k.question||'').toLowerCase().includes(w) || (k.answer||'').toLowerCase().includes(w));
        });
        if (relevant.length > 0) {
          knowledgeContext = '\n\n## IMPORTANT: Use this verified knowledge in your answer:\n' +
            relevant.map(k => k.question ? `Q: ${k.question}\nA: ${k.answer}` : k.answer).join('\n\n');
        }
      }
    } catch(e) {}

    const SYSTEM = `You are Shaykh AI — a distinguished Islamic scholar following the Hanafi madhab, Maturidi Aqeedah, and Sunni tradition. Expert in Quran, Tafsir, Hadith, Hanafi Fiqh, Islamic Philosophy, Tasawwuf. Speak with wisdom of a senior Shaykh. Quote Quran and Hadith with references. State Hanafi position clearly. Be patient and encouraging. Only discuss Islamic topics. Maintain highest adab.

LANGUAGE: ${langPrompt || 'Respond in English.'}${knowledgeContext}`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + process.env.GROQ_API_KEY },
      body: JSON.stringify({ model: 'llama-3.3-70b-versatile', max_tokens: 1024, messages: [{ role: 'system', content: SYSTEM }, ...messages] })
    });
    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });
    res.json({ reply: data.choices[0].message.content });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── KNOWLEDGE endpoints ──
app.get('/api/knowledge', async (req, res) => {
  try { res.json(await supabase('/knowledge?select=*&order=created_at.desc')); }
  catch(err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/knowledge', async (req, res) => {
  try {
    if (req.body.email !== ADMIN_EMAIL) return res.status(403).json({ error: 'Admin only' });
    res.json(await supabase('/knowledge', 'POST', req.body));
  } catch(err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/knowledge/:id', async (req, res) => {
  try {
    if (req.body.email !== ADMIN_EMAIL) return res.status(403).json({ error: 'Admin only' });
    await supabase(`/knowledge?id=eq.${req.params.id}`, 'DELETE');
    res.json({ success: true });
  } catch(err) { res.status(500).json({ error: err.message }); }
});

// ── SUGGESTIONS endpoints ──
app.get('/api/suggestions', async (req, res) => {
  try { res.json(await supabase('/suggestions?select=*&order=created_at.desc')); }
  catch(err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/suggestions', async (req, res) => {
  try { res.json(await supabase('/suggestions', 'POST', req.body)); }
  catch(err) { res.status(500).json({ error: err.message }); }
});

app.patch('/api/suggestions/:id', async (req, res) => {
  try {
    const { email, status, answer } = req.body;
    if (email !== ADMIN_EMAIL) return res.status(403).json({ error: 'Admin only' });
    await supabase(`/suggestions?id=eq.${req.params.id}`, 'PATCH', { status });
    if (status === 'approved' && answer) {
      await supabase('/knowledge', 'POST', { type:'qa', question:req.body.question, answer, topic:'user-suggestion' });
    }
    res.json({ success: true });
  } catch(err) { res.status(500).json({ error: err.message }); }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(process.env.PORT || 3000, () => {
  console.log('✅ Shaykh AI is running!');
});
