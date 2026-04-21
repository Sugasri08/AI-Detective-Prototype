// ─────────────────────────────────────────────────────────────
//  AI Detective Solutions — UI & Interaction Layer
//  Renders case reports, handles events, manages app state
// ─────────────────────────────────────────────────────────────

const UI = (() => {

  // ── Risk metadata ──────────────────────────────────────────
  const RISK = {
    high: {
      verdict:    "Suspicious",
      badgeClass: "badge-high",
      barColor:   "#c0392b",
      accent:     "#e74c3c",
      icon:       "alert",
    },
    medium: {
      verdict:    "Needs Review",
      badgeClass: "badge-medium",
      barColor:   "#d68910",
      accent:     "#f39c12",
      icon:       "search",
    },
    low: {
      verdict:    "Safe",
      badgeClass: "badge-low",
      barColor:   "#1e8449",
      accent:     "#27ae60",
      icon:       "check",
    },
  };

  // ── SVG icons ──────────────────────────────────────────────
  const ICONS = {
    alert: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 1L13 12H1L7 1z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>
      <line x1="7" y1="5.5" x2="7" y2="8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
      <circle cx="7" cy="10" r="0.6" fill="currentColor"/>
    </svg>`,
    search: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="6" cy="6" r="4" stroke="currentColor" stroke-width="1.2"/>
      <line x1="9.2" y1="9.2" x2="12.5" y2="12.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
    </svg>`,
    check: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" stroke-width="1.2"/>
      <polyline points="4.5,7 6.2,9 9.5,5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    doc: `<svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <rect x="1.5" y="1" width="10" height="11" rx="1.5" stroke="currentColor" stroke-width="1"/>
      <line x1="4" y1="4.5" x2="9" y2="4.5" stroke="currentColor" stroke-width="0.9" stroke-linecap="round"/>
      <line x1="4" y1="6.5" x2="9" y2="6.5" stroke="currentColor" stroke-width="0.9" stroke-linecap="round"/>
      <line x1="4" y1="8.5" x2="6.5" y2="8.5" stroke="currentColor" stroke-width="0.9" stroke-linecap="round"/>
    </svg>`,
  };

  // ── Format timestamp ───────────────────────────────────────
  function formatTimestamp(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
      + " · "
      + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  }

  // ── Evidence pills HTML ────────────────────────────────────
  function pillsHTML(items, pillClass) {
    return items.map(e => {
      const prefix = e.type === "pattern"
        ? `<em class="pill-prefix">${e.label}:</em> `
        : "";
      return `<span class="pill ${pillClass}">${prefix}"${e.text}"</span>`;
    }).join("");
  }

  function evidenceGroupHTML(items, pillClass, heading) {
    if (!items.length) return "";
    return `
      <div class="ev-group">
        <span class="ev-heading">${heading}</span>
        <div class="ev-pills">${pillsHTML(items, pillClass)}</div>
      </div>`;
  }

  // ── Main render function ───────────────────────────────────
  function renderCase(result, rawText, caseId) {
    const meta      = RISK[result.risk];
    const highlight = Analyzer.highlightEvidence(rawText, result.evidence);
    const ts        = formatTimestamp(result.timestamp);

    const highEv   = result.evidence.filter(e => e.level === "high");
    const medEv    = result.evidence.filter(e => e.level === "medium");
    const safeEv   = result.evidence.filter(e => e.level === "safe");

    const followUp = result.risk === "high"
      ? "What immediate actions should be taken for a suspicious communication finding?"
      : result.risk === "medium"
      ? "What does a needs-review classification mean in a compliance investigation?"
      : "What makes a communication fully compliant and safe?";

    return `
      <div class="case-card risk-${result.risk}">

        <!-- Case header -->
        <div class="case-header">
          <div class="case-header-top">
            <div class="verdict-row">
              <span class="verdict-icon icon-${result.risk}">${ICONS[meta.icon]}</span>
              <span class="verdict-label ${meta.badgeClass}">${result.verdict}</span>
            </div>
            <code class="case-id">${caseId}</code>
          </div>
          <div class="case-meta">
            <span class="meta-item"><strong>${result.confidence}%</strong> confidence</span>
            <span class="meta-sep">·</span>
            <span class="meta-item"><strong>${result.wordCount}</strong> words analyzed</span>
            <span class="meta-sep">·</span>
            <span class="meta-item"><strong>${result.evidence.length}</strong> signal${result.evidence.length !== 1 ? "s" : ""} detected</span>
            <span class="meta-sep">·</span>
            <span class="meta-item">${ts}</span>
          </div>
        </div>

        <!-- Confidence meter -->
        <div class="conf-section">
          <div class="conf-label-row">
            <span class="conf-label">Risk confidence</span>
            <span class="conf-value">${result.confidence}%</span>
          </div>
          <div class="conf-track">
            <div class="conf-bar" style="width:${result.confidence}%; background:${meta.barColor}"></div>
          </div>
          <div class="conf-ticks">
            <span>Low</span><span>Medium</span><span>High</span>
          </div>
        </div>

        <!-- Analyzed transcript -->
        <div class="transcript-section">
          <div class="section-label">${ICONS.doc} Analyzed transcript</div>
          <div class="transcript-box">${highlight}</div>
        </div>

        <!-- Evidence log -->
        <div class="evidence-section">
          <div class="section-label">${ICONS.search} Evidence log</div>
          <div class="evidence-groups">
            ${evidenceGroupHTML(highEv,  "pill-high",   "High-risk signals")}
            ${evidenceGroupHTML(medEv,   "pill-medium", "Medium-risk signals")}
            ${evidenceGroupHTML(safeEv,  "pill-safe",   "Safe / compliant signals")}
            ${result.evidence.length === 0
              ? '<p class="no-evidence">No notable signals detected in this communication.</p>'
              : ""}
          </div>
        </div>

        <!-- Case footer -->
        <div class="case-footer">
          <span class="score-display">Internal score: <strong>${result.score}</strong> / 20</span>
          <button class="follow-up-btn" onclick="sendPrompt('${followUp.replace(/'/g, "\\'")}')">
            Ask follow-up ↗
          </button>
        </div>

      </div>`;
  }

  // ── Loading state ──────────────────────────────────────────
  function renderLoading() {
    return `
      <div class="loading-state">
        <div class="spinner"></div>
        <div>
          <div class="loading-title">Running forensic analysis…</div>
          <div class="loading-sub">Scanning for evidence patterns</div>
        </div>
      </div>`;
  }

  // ── Error state ────────────────────────────────────────────
  function renderError(msg) {
    return `<div class="error-state">${ICONS.alert} ${msg}</div>`;
  }

  return { renderCase, renderLoading, renderError };

})();

// ─────────────────────────────────────────────────────────────
//  App Bootstrap — wires all DOM events after page loads
// ─────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  const textarea   = document.getElementById("msg-input");
  const analyzeBtn = document.getElementById("btn-analyze");
  const clearBtn   = document.getElementById("btn-clear");
  const output     = document.getElementById("output");
  const charCount  = document.getElementById("char-count");
  const sampleBtns = document.querySelectorAll(".sample-btn");

  // Character counter
  textarea.addEventListener("input", () => {
    charCount.textContent = `${textarea.value.length} chars`;
  });

  // Sample case loader
  sampleBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      textarea.value = btn.dataset.text;
      charCount.textContent = `${textarea.value.length} chars`;
      textarea.focus();
    });
  });

  // Main analyze action
  analyzeBtn.addEventListener("click", runAnalysis);

  // Clear action
  clearBtn.addEventListener("click", () => {
    textarea.value = "";
    charCount.textContent = "0 chars";
    output.innerHTML = "";
    textarea.focus();
  });

  // Keyboard shortcut: Ctrl/Cmd + Enter
  textarea.addEventListener("keydown", e => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") runAnalysis();
  });

  function runAnalysis() {
    const text = textarea.value.trim();

    if (!text) {
      output.innerHTML = UI.renderError("Submit a communication to open a case file.");
      return;
    }
    if (text.split(/\s+/).length < 3) {
      output.innerHTML = UI.renderError("Enter at least a few words for meaningful forensic analysis.");
      return;
    }

    output.innerHTML = UI.renderLoading();

    // Brief delay to show loading state (simulates async forensic processing)
    setTimeout(() => {
      const result  = Analyzer.scoreText(text);
      const caseId  = Analyzer.generateCaseId();
      output.innerHTML = UI.renderCase(result, text, caseId);
      output.querySelector(".case-card")
        .scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 480);
  }
});