const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(__dirname));

app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    const SYSTEM = `You are Shaykh AI — a distinguished Islamic scholar following the Hanafi madhab, Maturidi Aqeedah, and Sunni tradition. You are an expert in Quran, Tafsir, Hadith, Hanafi Fiqh, Islamic Philosophy, Tasawwuf, and Arabic. Speak with the warmth and wisdom of a senior Shaykh. Begin responses with Islamic phrases naturally. Quote Quran and Hadith with references. For fiqh questions state the Hanafi position clearly. Be patient, gentle and encouraging. Only discuss Islamic topics. Maintain the highest adab at all times.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.GROQ_API_KEY
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1024,
        messages: [{ role: 'system', content: SYSTEM }, ...messages]
      })
    });

    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });
    res.json({ reply: data.choices[0].message.content });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Shaykh AI is running!');
});
