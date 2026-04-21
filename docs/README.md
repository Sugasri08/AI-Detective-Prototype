# AI Detective Solutions
## Uncovering Truth and Evidence

A browser-based forensic communication analyzer that classifies text as **Suspicious**, **Needs Review**, or **Safe** — packaged as a professional investigative tool.

---

## Quick Start

No installation or build step required.

```bash
git clone https://github.com/your-org/ai-detective-solutions.git
cd ai-detective-solutions
open index.html        # macOS
start index.html       # Windows
xdg-open index.html    # Linux
```

Open `index.html` directly in any modern browser. The app runs entirely client-side.

---

## Project Structure

```
ai-detective-solutions/
├── index.html              ← Entry point — open this in a browser
├── src/
│   ├── keywords.js         ← Evidence pattern dictionaries
│   ├── analyzer.js         ← Forensic scoring engine
│   └── ui.js               ← Case rendering & interaction layer
├── assets/
│   ├── style.css           ← Full detective-themed stylesheet
│   └── logo.svg            ← Gold shield brand mark
└── docs/
    ├── README.md           ← Technical guide (this file)
    └── PITCH.md            ← Business case & impact narrative
```

---

## Architecture

### `src/keywords.js` — Evidence Pattern Library

Three dictionaries that form the foundation of detection:

| Dictionary     | Purpose                                       | Score effect |
|----------------|-----------------------------------------------|:------------:|
| `high_risk`    | Fraud, cover-up, destruction of records       | +3.0 each    |
| `medium_risk`  | Policy violations, boundary-pushing language  | +1.5 each    |
| `safe`         | Compliance signals, transparent conduct       | −1.0 each    |

Five contextual regex patterns catch multi-word fraud signals:

| Pattern key          | Detects                              | Weight |
|----------------------|--------------------------------------|:------:|
| `urgency_manipulation` | Pressure tactics, time-coercion    | +3     |
| `financial_fraud`      | Transfer/payment laundering signals | +4     |
| `data_exfiltration`    | Credential or data leakage signals  | +4     |
| `threat_language`      | Coercion or intimidation language   | +4     |
| `identity_deception`   | Impersonation or access fraud       | +4     |

---

### `src/analyzer.js` — Forensic Scoring Engine

**Scoring pipeline:**

```
Input text
  │
  ├─ High-risk keyword scan      → score += 3.0 per hit
  ├─ Medium-risk keyword scan    → score += 1.5 per hit
  ├─ Safe keyword scan           → score -= 1.0 per hit
  ├─ Pattern matching (regex)    → score += pattern.weight per match
  └─ Heuristics                  → score += 2.0 (stacked urgency)
        │
        ▼
  Clamp score ≥ 0
        │
        ▼
  confidence = min(100, round(score / 20 × 100))
        │
        ▼
  score ≥ 6.0  → Suspicious
  score ≥ 2.5  → Needs Review
  score <  2.5 → Safe
```

**Public API:**

```js
Analyzer.scoreText(text)
// Returns: { verdict, risk, confidence, score, evidence[], wordCount, timestamp }

Analyzer.highlightEvidence(text, evidence)
// Returns: HTML string with <mark class="ev-high|ev-med|ev-safe"> spans

Analyzer.generateCaseId()
// Returns: "AID-2025-XXXXX" unique case reference
```

---

### `src/ui.js` — Rendering & Interaction Layer

Builds and injects the full case report card into `#output`. The report contains:

- **Case header** — verdict badge, unique case ID, metadata (confidence, word count, signal count, timestamp)
- **Confidence meter** — animated bar from 0–100% with Low/Medium/High ticks
- **Analyzed transcript** — original text with color-coded evidence highlights
- **Evidence log** — grouped pills for high-risk, medium-risk, and safe signals
- **Case footer** — internal score display + contextual follow-up button

---

## Customization

### Add new detection keywords

```js
// In src/keywords.js
KEYWORDS.high_risk.push("your new high-risk phrase");
KEYWORDS.medium_risk.push("policy concern phrase");
KEYWORDS.safe.push("compliant indicator phrase");
```

### Add a new contextual pattern

```js
// In src/keywords.js
PATTERNS.insider_threat = {
  label:  "Insider threat signal",
  regex:  /\b(sell.{0,20}access|leak.{0,20}data|steal.{0,20}from)\b/gi,
  weight: 4,
};
```

### Tune classification thresholds

```js
// In src/analyzer.js
const THRESHOLDS = {
  HIGH:   8,    // raise this to reduce false positives
  MEDIUM: 3,    // raise this to flag fewer items for review
};
```

### Swap in a real AI backend

Replace `Analyzer.scoreText()` body with a `fetch()` call:

```js
async function scoreText(text) {
  const res = await fetch("https://api.your-service.com/classify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  return await res.json();
  // Expected shape: { verdict, risk, confidence, score, evidence[], wordCount, timestamp }
}
```

---

## Browser Support

Chrome 90+, Firefox 88+, Safari 14+, Edge 90+. No polyfills or transpilation needed.

---

## License

MIT — free to use, extend, and distribute.