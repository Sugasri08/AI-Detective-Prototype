const UI = (() => {
  const RISK_META = {
    high:   { label: "Suspicious",    icon: "⚠",  color: "var(--red)",    bar: "var(--red)" },
    medium: { label: "Needs Review",  icon: "🔍", color: "var(--amber)",  bar: "var(--amber)" },
    low:    { label: "Safe",          icon: "✓",  color: "var(--green)",  bar: "var(--green)" },
  };

  const PATTERN_LABELS = {
    urgency_manipulation: "Urgency manipulation",
    financial_fraud:      "Financial fraud signal",
    data_exfil:           "Data exfiltration signal",
    threat_language:      "Threatening language",
  };

  function render(result, rawText) {
    const meta = RISK_META[result.risk];
    const highlighted = Analyzer.highlightEvidence(rawText, result.evidence);

    const highEvidence  = result.evidence.filter(e => e.level === "high");
    const midEvidence   = result.evidence.filter(e => e.level === "medium");
    const safeEvidence  = result.evidence.filter(e => e.level === "safe");

    const evidenceHTML = (items, cls, heading) => items.length ? `
      <div class="ev-group">
        <span class="ev-heading">${heading}</span>
        ${items.map(e => `
          <span class="ev-pill ${cls}">
            ${e.type === "pattern" ? `<em>${PATTERN_LABELS[e.pattern] || e.pattern}:</em> ` : ""}
            "${e.text}"
          </span>`).join("")}
      </div>` : "";

    return `
      <div class="result-card risk-${result.risk}">
        <div class="result-header">
          <div class="verdict-badge" style="color:${meta.color}">
            <span class="verdict-icon">${meta.icon}</span>
            <span class="verdict-label">${result.verdict}</span>
          </div>
          <div class="meta-info">
            <span>${result.wordCount} words</span>
            <span>${result.evidence.length} signal${result.evidence.length !== 1 ? "s" : ""} detected</span>
          </div>
        </div>

        <div class="confidence-row">
          <span class="conf-label">Risk confidence</span>
          <div class="conf-bar-wrap">
            <div class="conf-bar" style="width:${result.confidence}%; background:${meta.bar}"></div>
          </div>
          <span class="conf-pct">${result.confidence}%</span>
        </div>

        <div class="highlighted-text">${highlighted}</div>

        <div class="evidence-section">
          ${evidenceHTML(highEvidence, "pill-high", "High-risk signals")}
          ${evidenceHTML(midEvidence,  "pill-mid",  "Medium-risk signals")}
          ${evidenceHTML(safeEvidence, "pill-safe", "Safe signals")}
          ${result.evidence.length === 0 ? '<p class="no-ev">No notable signals detected.</p>' : ""}
        </div>

        <div class="score-line">Internal risk score: <strong>${result.score}</strong></div>
      </div>`;
  }

  function showLoading() {
    return `<div class="loading-state">
      <div class="spinner"></div>
      <p>Analyzing communication…</p>
    </div>`;
  }

  function showError(msg) {
    return `<div class="error-state">⚠ ${msg}</div>`;
  }

  return { render, showLoading, showError };
})();

// --- App bootstrap ---
document.addEventListener("DOMContentLoaded", () => {
  const input    = document.getElementById("msg-input");
  const analyzeBtn = document.getElementById("analyze-btn");
  const clearBtn   = document.getElementById("clear-btn");
  const output   = document.getElementById("output");
  const charCount = document.getElementById("char-count");
  const samples  = document.querySelectorAll(".sample-btn");

  input.addEventListener("input", () => {
    charCount.textContent = `${input.value.length} chars`;
  });

  samples.forEach(btn => {
    btn.addEventListener("click", () => {
      input.value = btn.dataset.text;
      charCount.textContent = `${input.value.length} chars`;
      input.focus();
    });
  });

  analyzeBtn.addEventListener("click", () => {
    const text = input.value.trim();
    if (!text) {
      output.innerHTML = UI.showError("Please enter some text to analyze.");
      return;
    }
    if (text.split(/\s+/).length < 3) {
      output.innerHTML = UI.showError("Enter at least a few words for meaningful analysis.");
      return;
    }
    output.innerHTML = UI.showLoading();
    // Slight delay to show the loading state (simulates async processing)
    setTimeout(() => {
      const result = Analyzer.scoreText(text);
      output.innerHTML = UI.render(result, text);
      output.querySelector(".result-card").scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 420);
  });

  clearBtn.addEventListener("click", () => {
    input.value = "";
    charCount.textContent = "0 chars";
    output.innerHTML = "";
    input.focus();
  });

  // Allow Ctrl+Enter to analyze
  input.addEventListener("keydown", e => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") analyzeBtn.click();
  });
});