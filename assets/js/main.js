// ─── EvidAI v7 — Main JS (Semantic Search) ──────────────────

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

  // ── Samples ───────────────────────────────────────────────
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
      Object.assign(navLinks.style, { display: open?'none':'flex', flexDirection:'column', position:'absolute', top:'var(--nav-h)', left:'0', right:'0', background:'rgba(8,10,15,0.97)', padding:'20px 28px', borderBottom:'1px solid rgba(255,255,255,0.08)', gap:'18px', zIndex:'99' });
    });
  }

  // ── Stat counters ─────────────────────────────────────────
  const so = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { animateCount(e.target, +e.target.dataset.target, e.target.dataset.suffix||''); so.unobserve(e.target); } });
  }, { threshold: 0.5 });
  document.querySelectorAll('.count-up').forEach(el => so.observe(el));
  function animateCount(el, target, suffix, dur=1400) {
    let t0=null;
    const f=ts=>{ if(!t0)t0=ts; const p=Math.min((ts-t0)/dur,1); el.textContent=Math.floor((1-Math.pow(1-p,3))*target)+suffix; if(p<1)requestAnimationFrame(f); };
    requestAnimationFrame(f);
  }

  // ════════════════════════════════════════════════════════
  //  SEMANTIC ENGINE PRELOAD
  //  Starts loading all-MiniLM-L6-v2 on page open
  // ════════════════════════════════════════════════════════
  const mlStatus = document.getElementById('ml-status');

  function setStatus(text, color) {
    if (!mlStatus) return;
    mlStatus.textContent = text;
    mlStatus.style.color = color || 'var(--chalk-3)';
  }

  if (typeof SemanticEngine !== 'undefined') {
    setStatus('⟳ Loading semantic model…', 'var(--gold)');

    SemanticEngine.loadModel((pct) => {
      setStatus(`⟳ Loading semantic model… ${pct}%`, 'var(--gold)');
    }).then(() => {
      setStatus('⟳ Building pattern index…', 'var(--gold)');
      // Pre-build pattern embeddings while user is reading the page
      return SemanticEngine.classify('test warmup query');
    }).then(() => {
      setStatus('✓ Semantic search ready', 'var(--teal-lit)');
    }).catch(() => {
      setStatus('Rule-based mode', 'var(--chalk-3)');
    });
  } else {
    setStatus('Rule-based mode', 'var(--chalk-3)');
  }

  // ════════════════════════════════════════════════════════
  //  ANALYZE
  // ════════════════════════════════════════════════════════
  async function analyze() {
    const text   = input?.value.trim();
    const output = document.getElementById('tool-output');
    if (!output) return;
    if (!text)                        { output.innerHTML = errBox('Submit a communication to open a case.'); return; }
    if (text.split(/\s+/).length < 3) { output.innerHTML = errBox('Enter at least a few words for meaningful analysis.'); return; }

    // Use semantic engine if ready, else fall back to rules
    if (typeof SemanticEngine !== 'undefined' && SemanticEngine.isReady()) {
      await runSemantic(text, output);
    } else {
      runRules(text, output);
    }
  }

  // ── Semantic path ─────────────────────────────────────────
  async function runSemantic(text, output) {
    output.innerHTML = loadingHTML('Running semantic search…');
    try {
      const result = await SemanticEngine.classify(text);
      const caseId = SemanticEngine.generateCaseId();
      if (typeof CaseHistory !== 'undefined') CaseHistory.save(result, text, caseId);
      window._lastCase = { ...result, rawText: text, id: caseId };
      output.innerHTML = renderCase(result, text, caseId);
    } catch (err) {
      console.warn('Semantic failed, falling back:', err);
      runRules(text, output);
    }
  }

  // ── Rule-based fallback ───────────────────────────────────
  function runRules(text, output) {
    output.innerHTML = loadingHTML('Running forensic analysis…');
    setTimeout(() => {
      const result = Analyzer.scoreText(text);
      const caseId = Analyzer.generateCaseId();
      if (typeof CaseHistory !== 'undefined') CaseHistory.save(result, text, caseId);
      window._lastCase = { ...result, rawText: text, id: caseId };
      output.innerHTML = renderCase(result, text, caseId);
    }, 440);
  }

  // ════════════════════════════════════════════════════════
  //  RENDER CASE RESULT
  // ════════════════════════════════════════════════════════
  function renderCase(r, raw, caseId) {
    const isSemantic = r.semanticMode === true;
    const isML       = r.mlPowered    === true;

    // Highlight using keyword evidence
    const kwEv = r.kwEvidence || r.evidence?.filter(e=>e.type!=='semantic') || [];
    const ht   = typeof Analyzer !== 'undefined'
      ? Analyzer.highlightEvidence(raw, kwEv)
      : raw;

    const ts       = new Date(r.timestamp).toLocaleString('en-GB', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
    const barColor = r.risk==='high'?'#c0392b':r.risk==='medium'?'#c47d11':'#148a74';

    // Engine badge
    const badge = isSemantic
      ? `<span class="engine-badge engine-sem">Semantic · MiniLM</span>`
      : isML
      ? `<span class="engine-badge engine-ml">ML · DistilBERT</span>`
      : `<span class="engine-badge engine-rule">Rule-based</span>`;

    // Semantic evidence — similarity bars grouped by category
    let evidenceHTML = '';

    if (isSemantic && r.evidence?.length) {
      const riskEv = r.evidence.filter(e => e.level !== 'safe');
      const safeEv = r.evidence.filter(e => e.level === 'safe');

      const semBars = (items) => items.map(e => {
        const pct  = Math.round(e.similarity * 100);
        const bar  = e.level==='high'?'#c0392b':e.level==='medium'?'#c47d11':'#148a74';
        const cls  = e.level==='high'?'ph':e.level==='medium'?'pm':'ps';
        return `
          <div class="sem-match">
            <div class="sem-match__top">
              <span class="sem-match__cat pill ${cls}">${e.category}</span>
              <span class="sem-match__pct">${pct}% match</span>
            </div>
            <div class="sem-match__text">"${e.text}"</div>
            <div class="sem-match__bar-track">
              <div class="sem-match__bar" style="width:${pct}%;background:${bar}"></div>
            </div>
          </div>`;
      }).join('');

      evidenceHTML = `
        ${riskEv.length ? `
          <div class="transcript-lbl" style="margin-top:16px">Semantic pattern matches</div>
          <div class="sem-matches">${semBars(riskEv)}</div>` : ''}
        ${safeEv.length ? `
          <div class="transcript-lbl" style="margin-top:14px">Safe pattern matches</div>
          <div class="sem-matches">${semBars(safeEv)}</div>` : ''}`;

    } else {
      // Rule-based evidence pills
      const hi = (r.evidence||[]).filter(e=>e.level==='high');
      const mi = (r.evidence||[]).filter(e=>e.level==='medium');
      const si = (r.evidence||[]).filter(e=>e.level==='safe');
      const pills = (items,cls) => items.map(e=>`<span class="pill ${cls}">${e.type==='pat'?`<em>${e.label}:</em> `:''}"${e.text}"</span>`).join('');
      const grp   = (items,cls,h) => items.length?`<div class="ev-grp"><span class="ev-hed">${h}</span>${pills(items,cls)}</div>`:'';
      evidenceHTML = `
        <div class="transcript-lbl" style="margin-top:16px">Evidence log</div>
        <div class="ev-groups">
          ${grp(hi,'ph','High-risk signals')}
          ${grp(mi,'pm','Medium-risk signals')}
          ${grp(si,'ps','Safe signals')}
          ${!(r.evidence?.length)?'<p class="no-ev">No notable signals detected.</p>':''}
        </div>`;
    }

    // Top match callout
    const topMatchHTML = isSemantic && r.topMatch && r.topMatch.level !== 'safe'
      ? `<div class="top-match-callout risk-${r.risk}">
           <span class="top-match-callout__label">Closest pattern match</span>
           <span class="top-match-callout__text">"${r.topMatch.text}"</span>
           <span class="top-match-callout__cat">${r.topMatch.category} · ${Math.round(r.topMatch.similarity*100)}% similarity</span>
         </div>`
      : '';

    const footNote = isSemantic
      ? `· <span style="color:var(--gold);font-size:10px;font-family:var(--ff-mono)">all-MiniLM-L6-v2 · ${r.evidence?.length||0} patterns compared</span>`
      : '';

    return `
      <div class="case-card risk-${r.risk}">
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
              <span><strong>${r.evidence?.length||0}</strong> patterns matched</span>
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
          ${topMatchHTML}
          <div class="transcript-lbl">Analyzed transcript</div>
          <div class="transcript">${ht}</div>
          ${evidenceHTML}
        </div>
        <div class="case-foot">
          <span class="score-lbl">Score: <strong>${r.score}</strong> / 20 ${footNote}</span>
          <div style="display:flex;gap:8px;">
            <button class="btn btn--ghost btn--sm" onclick="(function(){if(typeof PDFExport!=='undefined'&&window._lastCase)PDFExport.generate(window._lastCase)})()">Download PDF</button>
            <a href="pages/history.html" class="btn btn--outline btn--sm">View history</a>
          </div>
        </div>
      </div>`;
  }

  function loadingHTML(msg) {
    return `<div class="loading-state"><div class="spinner"></div>${msg}</div>`;
  }

  function errBox(msg) {
    return `<div class="err-box">${msg}</div>`;
  }

});