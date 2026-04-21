// ─── AI Detective Solutions — Main JS ───────────────────────

document.addEventListener('DOMContentLoaded', () => {

  // ── Scroll reveal ────────────────────────────────────────
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if(e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  // ── Roadmap phase switcher ────────────────────────────────
  const phaseBtns   = document.querySelectorAll('.phase-btn');
  const phasePanels = document.querySelectorAll('.phase-panel');

  phaseBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.phase;
      phaseBtns.forEach(b => b.classList.remove('active'));
      phasePanels.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`phase-${target}`).classList.add('active');
    });
  });

  // ── Sample loaders ────────────────────────────────────────
  document.querySelectorAll('.tool-sample').forEach(btn => {
    btn.addEventListener('click', () => {
      const ta = document.getElementById('evidence-input');
      ta.value = btn.dataset.text;
      document.getElementById('char-count').textContent = ta.value.length + ' chars';
    });
  });

  // ── Char counter ──────────────────────────────────────────
  const input = document.getElementById('evidence-input');
  if(input) {
    input.addEventListener('input', () => {
      document.getElementById('char-count').textContent = input.value.length + ' chars';
    });
    input.addEventListener('keydown', e => {
      if((e.ctrlKey||e.metaKey) && e.key==='Enter') analyze();
    });
  }

  // ── Clear ─────────────────────────────────────────────────
  const clearBtn = document.getElementById('btn-clear');
  if(clearBtn) {
    clearBtn.addEventListener('click', () => {
      input.value = '';
      document.getElementById('char-count').textContent = '0 chars';
      document.getElementById('tool-output').innerHTML = '';
    });
  }

  // ── Analyze ───────────────────────────────────────────────
  const analyzeBtn = document.getElementById('btn-analyze');
  if(analyzeBtn) analyzeBtn.addEventListener('click', analyze);

  function analyze() {
    const text = input.value.trim();
    const output = document.getElementById('tool-output');

    if(!text) { output.innerHTML = '<div class="err-box">Submit a communication to open a case.</div>'; return; }
    if(text.split(/\s+/).length < 3) { output.innerHTML = '<div class="err-box">Enter at least a few words for meaningful analysis.</div>'; return; }

    output.innerHTML = `<div class="loading-state"><div class="spinner"></div>Running forensic analysis…</div>`;

    setTimeout(() => {
      const result  = Analyzer.scoreText(text);
      const caseId  = Analyzer.generateCaseId();
      output.innerHTML = renderCase(result, text, caseId);
    }, 440);
  }

  function renderCase(r, raw, caseId) {
    const ht = Analyzer.highlightEvidence(raw, r.evidence);
    const ts = new Date(r.timestamp).toLocaleString('en-GB', {day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
    const barColor = r.risk==='high'?'#c0392b':r.risk==='medium'?'#c47d11':'#148a74';
    const dotColor = barColor;

    const hi = r.evidence.filter(e=>e.level==='high');
    const mi = r.evidence.filter(e=>e.level==='medium');
    const si = r.evidence.filter(e=>e.level==='safe');

    const pills = (items, cls) => items.map(e =>
      `<span class="pill ${cls}">${e.type==='pat'?`<em>${e.label}:</em> `:''}"${e.text}"</span>`
    ).join('');
    const grp = (items, cls, h) => items.length
      ? `<div class="ev-grp"><span class="ev-hed">${h}</span>${pills(items,cls)}</div>` : '';

    return `
      <div class="case-card risk-${r.risk}">
        <div class="case-head">
          <div>
            <div class="case-verdict">
              <div class="verdict-dot" style="background:${dotColor}"></div>
              <span class="verdict-text vt-${r.risk}">${r.verdict}</span>
            </div>
            <div class="case-meta-row">
              <span><strong>${r.confidence}%</strong> confidence</span>
              <span><strong>${r.wordCount}</strong> words</span>
              <span><strong>${r.evidence.length}</strong> signal${r.evidence.length!==1?'s':''}</span>
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
          <div class="ev-groups">
            ${grp(hi,'ph','High-risk signals')}
            ${grp(mi,'pm','Medium-risk signals')}
            ${grp(si,'ps','Safe signals')}
            ${r.evidence.length===0?'<p class="no-ev">No notable signals detected.</p>':''}
          </div>
        </div>
        <div class="case-foot">
          <span class="score-lbl">Internal score: <strong>${r.score}</strong> / 20</span>
        </div>
      </div>`;
  }

  // ── Mobile nav toggle ─────────────────────────────────────
  const hamburger = document.querySelector('.nav__hamburger');
  const navLinks  = document.querySelector('.nav__links');
  if(hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
      navLinks.style.flexDirection = 'column';
      navLinks.style.position = 'absolute';
      navLinks.style.top = 'var(--nav-h)';
      navLinks.style.left = '0';
      navLinks.style.right = '0';
      navLinks.style.background = 'rgba(8,10,15,0.97)';
      navLinks.style.padding = '20px 28px';
      navLinks.style.borderBottom = '1px solid rgba(255,255,255,0.08)';
      navLinks.style.gap = '18px';
    });
  }

  // ── Animate hero stats counter ────────────────────────────
  function animateCount(el, target, suffix='', duration=1400) {
    let start = null;
    const step = (ts) => {
      if(!start) start = ts;
      const progress = Math.min((ts-start)/duration, 1);
      const eased = 1 - Math.pow(1-progress, 3);
      el.textContent = Math.floor(eased * target) + suffix;
      if(progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if(e.isIntersecting) {
        const el = e.target;
        animateCount(el, +el.dataset.target, el.dataset.suffix||'');
        statObserver.unobserve(el);
      }
    });
  }, {threshold:0.5});

  document.querySelectorAll('.count-up').forEach(el => statObserver.observe(el));
});