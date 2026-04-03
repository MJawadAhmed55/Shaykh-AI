# Shaykh AI — Complete Deployment Guide
# 100% Free · Public · Works on Android & iPhone

============================================================
STEP 1: GET YOUR FREE GROQ API KEY (2 minutes)
============================================================
1. Go to: https://console.groq.com
2. Sign up FREE (Google or Email — no credit card)
3. Click "API Keys" in left sidebar
4. Click "Create API Key" → name it anything
5. COPY the key (starts with gsk_...)

============================================================
STEP 2: DEPLOY FREE ON RENDER.COM (5 minutes)
============================================================
1. Create free account at: https://render.com
2. Go to: https://github.com → Create free account
3. Create new repository called "shaykh-ai"
4. Upload ALL files from this folder to GitHub
5. On Render.com:
   - Click "New" → "Web Service"
   - Connect your GitHub repo
   - Settings:
       Name:         shaykh-ai
       Runtime:      Node
       Build Command: npm install
       Start Command: npm start
6. Click "Environment Variables" → Add:
       Key:   GROQ_API_KEY
       Value: (paste your gsk_... key here)
7. Click "Deploy" → Wait 2-3 minutes
8. Your URL will be: https://shaykh-ai.onrender.com

============================================================
STEP 3: SHARE WITH EVERYONE
============================================================
Share your URL:  https://shaykh-ai.onrender.com

✅ Works on: Android Chrome, iPhone Safari, PC, Mac
✅ Installs like an app on phone (PWA)
✅ No login needed for users
✅ Completely free

============================================================
INSTALL AS APP ON PHONE (for you and users)
============================================================
Android (Chrome):
  Open URL → Tap menu (3 dots) → "Add to Home Screen" → Install

iPhone (Safari):
  Open URL → Tap Share button → "Add to Home Screen" → Add

============================================================
FREE LIMITS (Groq)
============================================================
- 14,400 requests/day FREE
- 30 requests/minute FREE
- No credit card ever needed
- Upgrade only if you get very popular

============================================================
FOLDER STRUCTURE
============================================================
shaykh-ai/
├── server.js          ← Backend (hides your API key)
├── package.json       ← Node.js config
├── README.txt         ← This file
└── public/
    ├── index.html     ← The chatbot UI
    ├── manifest.json  ← Makes it installable as app
    └── sw.js          ← Service worker (offline support)

============================================================
ALTERNATIVE FREE HOSTS
============================================================
1. Railway.app   → railway.app (also free)
2. Fly.io        → fly.io (free tier)
3. Vercel        → vercel.com (free, great for this)

All work the same way — upload code, add GROQ_API_KEY env var.
