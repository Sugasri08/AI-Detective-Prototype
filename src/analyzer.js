const Analyzer = (() => {
  function scoreText(text) {
    const lower = text.toLowerCase();
    const evidence = [];
    let score = 0;

    // --- High-risk keyword hits (weight: 3 each) ---
    KEYWORDS.high_risk.forEach(kw => {
      if (lower.includes(kw)) {
        score += 3;
        evidence.push({ text: kw, level: "high", type: "keyword" });
      }
    });

    // --- Medium-risk keyword hits (weight: 1.5 each) ---
    KEYWORDS.medium_risk.forEach(kw => {
      if (lower.includes(kw)) {
        score += 1.5;
        evidence.push({ text: kw, level: "medium", type: "keyword" });
      }
    });

    // --- Safe signal hits (weight: -1 each, reduces suspicion) ---
    KEYWORDS.safe.forEach(kw => {
      if (lower.includes(kw)) {
        score -= 1;
        evidence.push({ text: kw, level: "safe", type: "keyword" });
      }
    });

    // --- Pattern matching (weight: 4 each — context-aware) ---
    Object.entries(PATTERNS).forEach(([name, regex]) => {
      const matches = [...text.matchAll(regex)];
      matches.forEach(m => {
        score += 4;
        evidence.push({ text: m[0].trim(), level: "high", type: "pattern", pattern: name });
      });
    });

    // --- Heuristics ---
    const wordCount = text.trim().split(/\s+/).length;

    // Excessive urgency without context
    const urgencyWords = (lower.match(/\b(urgent|asap|immediately|right now|hurry)\b/g) || []).length;
    if (urgencyWords >= 2) { score += 2; evidence.push({ text: "multiple urgency signals", level: "medium", type: "heuristic" }); }

    // Very short, aggressive messages
    if (wordCount < 15 && score > 3) score += 1;

    // Clamping
    score = Math.max(0, score);

    // --- Classification ---
    const MAX_SCORE = 20;
    const confidence = Math.min(100, Math.round((score / MAX_SCORE) * 100));
    let verdict, risk;

    if (score >= 6) {
      verdict = "Suspicious";
      risk = "high";
    } else if (score >= 2.5) {
      verdict = "Needs Review";
      risk = "medium";
    } else {
      verdict = "Safe";
      risk = "low";
    }

    return { verdict, risk, confidence, score: +score.toFixed(2), evidence, wordCount };
  }

  function highlightEvidence(text, evidence) {
    let result = text;
    const sorted = [...evidence]
      .filter(e => e.type === "keyword" || e.type === "pattern")
      .sort((a, b) => b.text.length - a.text.length); // longest first to avoid partial replacements

    const escaped = new Set();
    sorted.forEach(e => {
      if (escaped.has(e.text.toLowerCase())) return;
      escaped.add(e.text.toLowerCase());
      const regex = new RegExp(`(${e.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, "gi");
      result = result.replace(regex, `<mark class="ev-${e.level}">$1</mark>`);
    });
    return result;
  }

  return { scoreText, highlightEvidence };
})();