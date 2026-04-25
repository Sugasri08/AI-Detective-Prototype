// ─── EvidAI — ML Engine ──────────────────────────────────────
// DistilBERT sentiment via Transformers.js
// Model pre-loads on page start so it's ready when user clicks

window.MLEngine = (function () {

  let _pipe        = null;
  let _loading     = false;
  let _loadPromise = null;
  let _onProgress  = null;

  // Inject the ES-module loader once
  function _injectLoader() {
    return new Promise((resolve, reject) => {
      if (_pipe) { resolve(_pipe); return; }

      window.__ml_resolve = resolve;
      window.__ml_reject  = reject;
      window.__ml_prog    = function(pct, file) {
        _onProgress && _onProgress(pct, file);
      };

      const s = document.createElement('script');
      s.type = 'module';
      s.textContent = `
        import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/transformers.min.js';
        env.allowLocalModels = false;
        env.useBrowserCache  = true;
        try {
          const p = await pipeline(
            'text-classification',
            'Xenova/distilbert-base-uncased-finetuned-sst-2-english',
            {
              quantized: true,
              progress_callback: (info) => {
                if (info.status === 'progress' && info.total) {
                  window.__ml_prog(Math.round((info.loaded / info.total) * 100), info.file || '');
                }
              }
            }
          );
          window.__ml_resolve(p);
        } catch(e) {
          window.__ml_reject(e);
        }
      `;
      document.head.appendChild(s);
    });
  }

  function loadModel(onProgress) {
    _onProgress = onProgress || null;
    if (_pipe)         return Promise.resolve(_pipe);
    if (_loadPromise)  return _loadPromise;
    _loading     = true;
    _loadPromise = _injectLoader().then(p => {
      _pipe    = p;
      _loading = false;
      console.log('[EvidAI] DistilBERT model ready ✓');
      return p;
    }).catch(err => {
      _loading     = false;
      _loadPromise = null;
      throw err;
    });
    return _loadPromise;
  }

  async function classify(text, onProgress) {
    // Ensure model is loaded (may already be loading from preload)
    const model = await loadModel(onProgress);

    // Real ML inference
    const mlOut = await model(text, { topk: 2 });
    let neg = 0, pos = 0;
    mlOut.forEach(r => {
      if (r.label === 'NEGATIVE') neg = r.score;
      if (r.label === 'POSITIVE') pos = r.score;
    });

    // Keyword scan for signal extraction + hybrid scoring
    const kw = (typeof Analyzer !== 'undefined')
      ? Analyzer.scoreText(text)
      : { score: 0, evidence: [], wordCount: text.trim().split(/\s+/).length };

    // Hybrid: 60% ML negativity + 40% keyword risk
    const kwNorm   = Math.min(1, kw.score / 20);
    const combined = (neg * 0.6) + (kwNorm * 0.4);

    const mlSignals = [
      { label: 'Negative intent (ML)', score: neg, level: neg > 0.65 ? 'high' : neg > 0.40 ? 'medium' : 'safe', type: 'ml' },
      { label: 'Positive / neutral tone (ML)', score: pos, level: 'safe', type: 'ml' },
    ];

    const hasHighKw = kw.evidence.some(e => e.level === 'high');
    let risk, verdict;
    if      (combined >= 0.55) { risk = hasHighKw ? 'high' : 'medium'; verdict = risk === 'high' ? 'Suspicious' : 'Needs Review'; }
    else if (combined >= 0.30) { risk = 'medium'; verdict = 'Needs Review'; }
    else                       { risk = 'low';    verdict = 'Safe'; }

    return {
      verdict,
      risk,
      confidence: Math.min(100, Math.round(combined * 100)),
      score:      +((combined * 20).toFixed(2)),
      evidence:   [...mlSignals, ...kw.evidence],
      wordCount:  kw.wordCount,
      timestamp:  new Date().toISOString(),
      mlPowered:  true,
      mlScores:   { negative: +neg.toFixed(3), positive: +pos.toFixed(3) },
    };
  }

  function highlightEvidence(text, evidence) {
    if (typeof Analyzer === 'undefined') return text;
    return Analyzer.highlightEvidence(text, evidence.filter(e => e.type !== 'ml'));
  }

  function generateCaseId() {
    return `AID-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000) + 10000}`;
  }

  function isReady()   { return _pipe !== null; }
  function isLoading() { return _loading; }

  return { loadModel, classify, highlightEvidence, generateCaseId, isReady, isLoading };

})();