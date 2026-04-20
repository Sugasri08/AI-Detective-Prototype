# AI Detective — Risk & Evidence Analyzer

A lightweight, browser-based prototype that classifies text communications as **Suspicious**, **Needs Review**, or **Safe** using rule-based risk scoring with pattern matching.

---

## Quick Start

No installation, no build step, no dependencies.

```bash
# Clone or download the project
git clone https://github.com/your-org/ai-detective.git
cd ai-detective

# Open in browser
open index.html        # macOS
start index.html       # Windows
xdg-open index.html    # Linux
```

That's it. The app runs entirely in the browser.

---

## File Structure

```
ai-detective/
├── index.html          ← Entry point — open this
├── src/
│   ├── keywords.js     ← Pattern dictionaries (high/medium/safe signals)
│   ├── analyzer.js     ← Scoring engine + classification logic
│   └── ui.js           ← Rendering, interaction, event handling
├── assets/
│   ├── style.css       ← Dark detective theme
│   └── logo.svg        ← Brand icon
└── docs/
    ├── README.md       ← You are here
    └── PITCH.md        ← Business case & impact narrative
```

---

## How It Works

### Scoring Engine (`analyzer.js`)

Each text input is scored on a weighted point system:

| Signal type           | Weight  | Source          |
|-----------------------|---------|-----------------|
| High-risk keyword     | +3.0    | `keywords.js`   |
| Medium-risk keyword   | +1.5    | `keywords.js`   |
| Safe/compliant signal | −1.0    | `keywords.js`   |
| Contextual pattern    | +4.0    | `PATTERNS` regex|
| Multiple urgency cues | +2.0    | Heuristic       |

**Classification thresholds:**

| Score range | Verdict       |
|-------------|---------------|
| ≥ 6.0       | Suspicious    |
| 2.5 – 5.9   | Needs Review  |
| < 2.5       | Safe          |

Risk confidence is displayed as a percentage (score / 20, capped at 100%).

### Pattern Library (`keywords.js`)

Four context-aware regex patterns catch phrases that single-keyword matching would miss:

- **Urgency manipulation** — "delete before anyone", "act fast"
- **Financial fraud** — "transfer without trace", "offshore account"
- **Data exfiltration** — "send external", "forward private"
- **Threat language** — "or else", "you'll regret"

### Evidence Highlighting

Detected signals are highlighted inline within the original text using color-coded marks:
- 🔴 Red — high-risk signals
- 🟡 Amber — medium-risk signals
- 🟢 Green — safe/compliant signals

---

## Extending the System

### Add new keywords

Edit `src/keywords.js` and add terms to the appropriate array:

```js
KEYWORDS.high_risk.push("your new term");
```

### Add new patterns

```js
PATTERNS.insider_threat = /\b(steal.{0,20}data|sell.{0,20}access|leak.{0,20}credentials)\b/gi;
```

### Adjust thresholds

In `analyzer.js`, change the `score >= 6` and `score >= 2.5` thresholds to tune sensitivity.

### Connect a real AI backend

Replace the scoring logic in `analyzer.js` with a `fetch()` call to any NLP API (OpenAI, Claude, etc.):

```js
const res = await fetch("https://api.yourservice.com/classify", {
  method: "POST",
  body: JSON.stringify({ text }),
});
const { verdict, confidence, evidence } = await res.json();
```

---

## Browser Support

Works in all modern browsers (Chrome, Firefox, Safari, Edge). No polyfills needed.

---

## License

MIT — free to use, modify, and distribute.