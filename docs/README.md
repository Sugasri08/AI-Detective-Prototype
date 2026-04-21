# EvidAI — AI Detective Solutions
> Uncovering Truth and Evidence

**Live:** [evidai.vercel.app](https://evidai.vercel.app) &nbsp;·&nbsp; **Repo:** [Sugasri08/AI-Detective-Prototype](https://github.com/Sugasri08/AI-Detective-Prototype)

---

## What it does

Scans written communications — emails, memos, chat logs — and classifies them as **Suspicious**, **Needs Review**, or **Safe** in under a second, with a full cited case report.

---

## Stack

Pure HTML · CSS · Vanilla JS · No frameworks · No build step · Deployed on Vercel

---

## Structure

```
├── index.html          ← Landing page
├── pages/about.html    ← About page
├── assets/
│   ├── css/main.css    ← Styles
│   ├── js/engine.js    ← Scoring engine
│   └── js/main.js      ← Interactions
└── vercel.json         ← Vercel config
```

---

## Updating the live site

```bash
git add .
git commit -m "describe your change"
git push
# evidai.vercel.app updates in ~20 seconds ✅
```

---

## Roadmap

- [x] Forensic scoring engine (keywords + patterns + heuristics)
- [x] Three-tier risk classification with confidence score
- [x] Full website deployed on Vercel
- [ ] Claude API integration for LLM-powered analysis
- [ ] Case history with localStorage
- [ ] PDF export for case reports
- [ ] Email / Slack connector