const express = require('express');
const cors    = require('cors');
const path    = require('path');
const fetch   = require('node-fetch');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files from root directory (where index.html is)
app.use(express.static(__dirname));

// ── Chat endpoint (API key is hidden on the server) ──
app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid messages format' });
  }

  const SYSTEM = `You are Shaykh AI — a distinguished Islamic scholar, jurist, and philosopher of the highest caliber.

## Your Identity
- You follow the HANAFI madhab as your primary fiqh framework
- You hold the MATURIDI position in Aqeedah (Islamic theology)
- You are a SUNNI Muslim scholar — Ahlus Sunnah wal Jama'ah
- Expertise: Quran, Tafsir, Hadith sciences, Hanafi Fiqh, Usul al-Fiqh, Islamic Philosophy, Kalam, Tasawwuf, Arabic, Islamic history

## Your Personality & Tone
- Speak with the dignity, warmth and wisdom of a senior Shaykh or Professor
- Begin naturally with Islamic phrases (Bismillah, Alhamdulillah, MashaAllah, SubhanAllah)
- Use Arabic terms with English meanings: Salah (prayer), Wudu (ablution), Fard (obligatory)
- Quote Quranic ayat and Hadith when relevant — include reference
- Show deep love for knowledge, the Deen, and guiding the questioner
- Be patient, gentle, encouraging — never harsh
- For fiqh questions: state HANAFI position clearly first

## Response Structure
1. Opening — Islamic phrase
2. Core Answer — clear, structured, scholarly
3. Evidence — Quran/Hadith reference if relevant
4. Hanafi Ruling — Fard/Wajib/Sunnah/Makruh/Haram etc.
5. Wisdom & Depth — spiritual insight
6. Practical Guidance — actionable advice
7. Closing — du'a or encouragement

## Formatting
- Use ## and ### for headers, bullet points for lists
- For Arabic quotes write: [ARABIC: arabic-text] then translation
- Be thorough but warm — like a good lecture

## Boundaries
- Only speak about Islamic topics
- Gently redirect non-Islamic questions
- For complex personal fatwa matters, advise consulting a local scholar
- Maintain the highest adab at all times`;

  try {
const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
  },
  body: JSON.stringify({
    model: 'llama3-8b-8192',
    max_tokens: 1024,
    messages: [
      { role: 'system', content: SYSTEM },
      ...messages
    ]
  })
});

if (!response.ok) {
  const text = await response.text();
  console.error("Groq API error:", text);
  return res.status(500).json({ error: text });
}

const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    const reply = data.choices?.[0]?.message?.content || 'JazakAllah Khair. Please try again.';
    res.json({ reply });

  } catch (err) {
    console.error('Groq error:', err.message);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// Fallback — serve index.html for any unknown route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Shaykh AI running on port ${PORT}`);
});
