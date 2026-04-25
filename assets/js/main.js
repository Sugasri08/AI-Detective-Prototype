// ─── EvidAI v5 — Main JS ────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {

  // ── Scroll reveal ─────────────────────────────────────────
  const ro = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); ro.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => ro.observe(el));

  // ── Phase tabs ────────────────────────────────────────────
  document.querySelectorAll('.phase-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.phase-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.phase-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const panel = document.getElementById(`phase-${btn.dataset.phase}`);
      if (panel) panel.classList.add('active');
    });
  });

  // ── Sample buttons ────────────────────────────────────────
  document.querySelectorAll('.tool-sample').forEach(btn => {
    btn.addEventListener('click', () => {
      const ta = document.getElementById('evidence-input');
      if (ta) { ta.value = btn.dataset.text; updateCharCount(); }
    });
  });

  // ── Char counter ──────────────────────────────────────────
  const input = document.getElementById('evidence-input');
  function updateCharCount() {
    const cc = document.getElementById('char-count');
    if (cc && input) cc.textContent = input.value.length + ' chars';
  }
  if (input) {
    input.addEventListener('input', updateCharCount);
    input.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') analyze(); });
  }

  // ── Clear ─────────────────────────────────────────────────
  document.getElementById('btn-clear')?.addEventListener('click', () => {
    if (input) input.value = '';
    updateCharCount();
    const out = document.getElementById('tool-output');
    if (out) out.innerHTML = '';
  });

  // ── Analyze ───────────────────────────────────────────────
  document.getElementById('btn-analyze')?.addEventListener('click', analyze);

  // ── Mobile nav ────────────────────────────────────────────
  const hamburger = document.querySelector('.nav__hamburger');
  const navLinks  = document.querySelector('.nav__links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const open = navLinks.style.display === 'flex';
      Object.assign(navLinks.style, { display: open ? 'none' : 'flex', flexDirection: 'column', position: 'absolute', top: 'var(--nav-h)', left: '0', right: '0', background: 'rgba(8,10,15,0.97)', padding: '20px 28px', borderBottom: '1px solid rgba(255,255,255,0.08)', gap: '18px', zIndex: '99' });
    });
  }

  // ── Stat counters ─────────────────────────────────────────
  const so = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { animateCount(e.target, +e.target.dataset.target, e.target.dataset.suffix || ''); so.unobserve(e.target); } });
  }, { threshold: 0.5 });
  document.querySelectorAll('.count-up').forEach(el => so.observe(el));
  function animateCount(el, target, suffix, dur = 1400) {
    let t0 = null;
    const f = ts => { if (!t0) t0 = ts; const p = Math.min((ts - t0) / dur, 1); el.textContent = Math.floor((1 - Math.pow(1 - p, 3)) * target) + suffix; if (p < 1) requestAnimationFrame(f); };
    requestAnimationFrame(f);
  }

  // ════════════════════════════════════════════════════════
  //  ML PRELOAD — start downloading model in background
  //  as soon as page loads, so it's ready when user clicks
  // ════════════════════════════════════════════════════════
  const mlStatus = document.getElementById('ml-status');

  function setMLStatus(text, color) {
    if (!mlStatus) return;
    mlStatus.textContent = text;
    mlStatus.style.color = color || 'var(--chalk-3)';
  }

  if (typeof MLEngine !== 'undefined') {
    setMLStatus('⟳ Loading ML model…', 'var(--gold)');

    MLEngine.loadModel((pct) => {
      setMLStatus(`⟳ Loading ML model… ${pct}%`, 'var(--gold)');
    }).then(() => {
      setMLStatus('✓ ML ready', 'var(--teal-lit)');
    }).catch(() => {
      setMLStatus('Rule-based mode', 'var(--chalk-3)');
    });
  } else {
    setMLStatus('Rule-based mode', 'var(--chalk-3)');
  }

  // ════════════════════════════════════════════════════════
  //  ANALYZE
  // ════════════════════════════════════════════════════════
  async function analyze() {
    const text   = input?.value.trim();
    const output = document.getElementById('tool-output');
    if (!output) return;
    if (!text)                         { output.innerHTML = '<div class="err-box">Submit a communication to open a case.</div>'; return; }
    if (text.split(/\s+/).length < 3)  { output.innerHTML = '<div class="err-box">Enter at least a few words for meaningful analysis.</div>'; return; }

    const useML = typeof MLEngine !== 'undefined' && MLEngine.isReady();
    useML ? await runML(text, output) : runRules(text, output);
  }

  async function runML(text, output) {
    output.innerHTML = loading('Running ML inference…');
    try {
      const result = await MLEngine.classify(text);
      const caseId = MLEngine.generateCaseId();
      if (typeof CaseHistory !== 'undefined') CaseHistory.save(result, text, caseId);
      window._lastCase = { ...result, rawText: text, id: caseId };
      output.innerHTML = renderCase(result, text, caseId, true);
    } catch (err) {
      console.warn('ML inference failed, using rule engine:', err);
      runRules(text, output);
    }
  }

  function runRules(text, output) {
    output.innerHTML = loading('Running forensic analysis…');
    setTimeout(() => {
      const result = Analyzer.scoreText(text);
      const caseId = Analyzer.generateCaseId();
      if (typeof CaseHistory !== 'undefined') CaseHistory.save(result, text, caseId);
      window._lastCase = { ...result, rawText: text, id: caseId };
      output.innerHTML = renderCase(result, text, caseId, false);
    }, 440);
  }

  // ════════════════════════════════════════════════════════
  //  RENDER
  // ════════════════════════════════════════════════════════
  function loading(msg) {
    return `<div class="loading-state"><div class="spinner"></div>${msg}</div>`;
  }

  function renderCase(r, raw, caseId, mlPowered) {
    const ht = mlPowered
      ? MLEngine.highlightEvidence(raw, r.evidence)
      : Analyzer.highlightEvidence(raw, r.evidence);

    const ts       = new Date(r.timestamp).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const barColor = r.risk === 'high' ? '#c0392b' : r.risk === 'medium' ? '#c47d11' : '#148a74';

    // ML evidence: show probability bars for ML signals + keyword pills below
    const mlSignals  = (r.evidence || []).filter(e => e.type === 'ml');
    const kwSignals  = (r.evidence || []).filter(e => e.type !== 'ml');
    const hi = kwSignals.filter(e => e.level === 'high');
    const mi = kwSignals.filter(e => e.level === 'medium');
    const si = kwSignals.filter(e => e.level === 'safe');
    const pills = (items, cls) => items.map(e => `<span class="pill ${cls}">${e.type === 'pat' ? `<em>${e.label}:</em> ` : ''}"${e.text}"</span>`).join('');
    const grp   = (items, cls, h) => items.length ? `<div class="ev-grp"><span class="ev-hed">${h}</span>${pills(items, cls)}</div>` : '';

    const mlBars = mlSignals.map(e => {
      const pct = Math.round(e.score * 100);
      const bar = e.level === 'high' ? '#c0392b' : e.level === 'medium' ? '#c47d11' : '#148a74';
      const cls = e.level === 'high' ? 'ph' : e.level === 'medium' ? 'pm' : 'ps';
      return `<div class="ml-signal">
        <div class="ml-signal__label"><span class="pill ${cls}" style="font-size:10px">${e.label}</span><span class="ml-signal__pct">${pct}%</span></div>
        <div class="ml-signal__track"><div class="ml-signal__fill" style="width:${pct}%;background:${bar}"></div></div>
      </div>`;
    }).join('');

    const evidenceHTML = mlPowered
      ? `<div class="transcript-lbl" style="margin-top:14px">ML classification scores</div>
         <div class="ml-signals">${mlBars}</div>
         ${kwSignals.length ? `<div class="transcript-lbl" style="margin-top:14px">Keyword signals</div>
         <div class="ev-groups">${grp(hi,'ph','High-risk')}${grp(mi,'pm','Medium-risk')}${grp(si,'ps','Safe')}</div>` : ''}`
      : `<div class="transcript-lbl" style="margin-top:14px">Evidence log</div>
         <div class="ev-groups">${grp(hi,'ph','High-risk signals')}${grp(mi,'pm','Medium-risk signals')}${grp(si,'ps','Safe signals')}${!r.evidence?.length?'<p class="no-ev">No notable signals.</p>':''}</div>`;

    const badge = mlPowered
      ? `<span class="engine-badge engine-ml">ML · DistilBERT</span>`
      : `<span class="engine-badge engine-rule">Rule-based</span>`;

    const footerNote = mlPowered
      ? `· <span style="color:var(--gold);font-size:10px;font-family:var(--ff-mono)">DistilBERT + Keywords</span>`
      : '';

    return `<div class="case-card risk-${r.risk}">
      <div class="case-head">
        <div>
          <div class="case-verdict">
            <div class="verdict-dot" style="background:${barColor}"></div>
            <span class="verdict-text vt-${r.risk}">${r.verdict}</span>
            ${badge}
          </div>
          <div class="case-meta-row">
            <span><strong>${r.confidence}%</strong> confidence</span>
            <span><strong>${r.wordCount}</strong> words</span>
            <span><strong>${(r.evidence||[]).length}</strong> signals</span>
            <span>${ts}</span>
          </div>
        </div>
        <code class="case-id-badge">${caseId}</code>
      </div>
      <div class="case-body">
        <div class="conf-row">
          <span class="conf-lbl">Risk confidence</span>
          <div class="conf-track"><div class="conf-fill" style="width:${r.confidence}%;background:${barColor}"></div></div>
          <span class="conf-pct">${r.confidence}%</span>
        </div>
        <div class="transcript-lbl">Analyzed transcript</div>
        <div class="transcript">${ht}</div>
        ${evidenceHTML}
      </div>
      <div class="case-foot">
        <span class="score-lbl">Score: <strong>${r.score}</strong> / 20 ${footerNote}</span>
        <div style="display:flex;gap:8px;">
          <button class="btn btn--ghost btn--sm" onclick="(function(){if(typeof PDFExport!=='undefined'&&window._lastCase)PDFExport.generate(window._lastCase)})()">Download PDF</button>
          <a href="pages/history.html" class="btn btn--outline btn--sm">View history</a>
        </div>
      </div>
    </div>`;
  }

});