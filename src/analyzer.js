// ─────────────────────────────────────────────────────────────
//  AI Detective Solutions — Forensic Scoring Engine
//  Core analysis module: scores, classifies, and extracts evidence
// ─────────────────────────────────────────────────────────────

const Analyzer = (() => {

  const MAX_SCORE = 20; // normalization ceiling for confidence %

  // ── Classification thresholds ──────────────────────────────
  const THRESHOLDS = {
    HIGH:   6,    // score >= 6   → Suspicious
    MEDIUM: 2.5,  // score >= 2.5 → Needs Review
                  // score <  2.5 → Safe
  };

  // ── Weights ────────────────────────────────────────────────
  const WEIGHTS = {
    HIGH_RISK_KW:   3.0,
    MEDIUM_RISK_KW: 1.5,
    SAFE_KW:       -1.0,  // reduces suspicion score
    MULTI_URGENCY:  2.0,  // bonus for stacking urgency
  };

  // ──────────────────────────────────────────────────────────
  //  scoreText(text) → result object
  // ──────────────────────────────────────────────────────────
  function scoreText(text) {
    const lower = text.toLowerCase();
    const evidence = [];
    let score = 0;

    // 1. High-risk keyword scan
    KEYWORDS.high_risk.forEach(kw => {
      if (lower.includes(kw)) {
        score += WEIGHTS.HIGH_RISK_KW;
        evidence.push({ text: kw, level: "high", type: "keyword" });
      }
    });

    // 2. Medium-risk keyword scan
    KEYWORDS.medium_risk.forEach(kw => {
      if (lower.includes(kw)) {
        score += WEIGHTS.MEDIUM_RISK_KW;
        evidence.push({ text: kw, level: "medium", type: "keyword" });
      }
    });

    // 3. Safe signal scan (subtracts from score)
    KEYWORDS.safe.forEach(kw => {
      if (lower.includes(kw)) {
        score += WEIGHTS.SAFE_KW;
        evidence.push({ text: kw, level: "safe", type: "keyword" });
      }
    });

    // 4. Contextual pattern matching
    Object.entries(PATTERNS).forEach(([key, pattern]) => {
      const matches = [...text.matchAll(pattern.regex)];
      matches.forEach(match => {
        score += pattern.weight;
        evidence.push({
          text:    match[0].trim(),
          level:   "high",
          type:    "pattern",
          patKey:  key,
          label:   pattern.label,
        });
      });
    });

    // 5. Heuristic: stacked urgency signals
    const urgencyCount = (
      lower.match(/\b(urgent|asap|immediately|right now|hurry|act fast|no time)\b/g) || []
    ).length;
    if (urgencyCount >= 2) {
      score += WEIGHTS.MULTI_URGENCY;
      evidence.push({ text: `${urgencyCount} urgency signals stacked`, level: "medium", type: "heuristic" });
    }

    // 6. Heuristic: very short + aggressive message amplifier
    const wordCount = text.trim().split(/\s+/).length;
    if (wordCount < 15 && score > 3) score += 1;

    // Clamp score to non-negative
    score = Math.max(0, score);

    // ── Classify ──────────────────────────────────────────────
    const confidence = Math.min(100, Math.round((score / MAX_SCORE) * 100));

    let risk, verdict;
    if (score >= THRESHOLDS.HIGH) {
      risk    = "high";
      verdict = "Suspicious";
    } else if (score >= THRESHOLDS.MEDIUM) {
      risk    = "medium";
      verdict = "Needs Review";
    } else {
      risk    = "low";
      verdict = "Safe";
    }

    return {
      verdict,
      risk,
      confidence,
      score:     +score.toFixed(2),
      evidence,
      wordCount,
      timestamp: new Date().toISOString(),
    };
  }

  // ──────────────────────────────────────────────────────────
  //  highlightEvidence(text, evidence) → HTML string
  //  Wraps matched signals in <mark> tags with risk-level classes
  // ──────────────────────────────────────────────────────────
  function highlightEvidence(text, evidence) {
    let result = text;
    const applied = new Set();

    // Sort longest first to prevent partial substring replacement
    const signals = [...evidence]
      .filter(e => e.type === "keyword" || e.type === "pattern")
      .sort((a, b) => b.text.length - a.text.length);

    signals.forEach(e => {
      const key = e.text.toLowerCase();
      if (applied.has(key)) return;
      applied.add(key);

      const escaped = e.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex   = new RegExp(`(${escaped})`, 'gi');
      const cls     = e.level === "high"   ? "ev-high"
                    : e.level === "medium" ? "ev-med"
                    :                        "ev-safe";

      result = result.replace(regex, `<mark class="${cls}">$1</mark>`);
    });

    return result;
  }

  // ──────────────────────────────────────────────────────────
  //  generateCaseId() → unique case reference string
  // ──────────────────────────────────────────────────────────
  function generateCaseId() {
    const num  = Math.floor(Math.random() * 90000) + 10000;
    const year = new Date().getFullYear();
    return `AID-${year}-${num}`;
  }

  // Public API
  return { scoreText, highlightEvidence, generateCaseId };

})();