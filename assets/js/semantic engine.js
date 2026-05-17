// ─── EvidAI — Semantic Search Engine ────────────────────────
// Uses all-MiniLM-L6-v2 (~23MB) to generate sentence embeddings
// Compares user input against forensic pattern library via
// cosine similarity — real semantic search, no keyword matching

window.SemanticEngine = (function () {

  let _pipe        = null;
  let _loadPromise = null;
  let _patternEmbeddings = null; // pre-computed embeddings for pattern library

  // ── Load model ────────────────────────────────────────────
  function loadModel(onProgress) {
    if (_pipe) return Promise.resolve(_pipe);
    if (_loadPromise) return _loadPromise;

    _loadPromise = new Promise((resolve, reject) => {
      window.__sem_progress = onProgress || function(){};
      window.__sem_resolve  = resolve;
      window.__sem_reject   = reject;

      const s = document.createElement('script');
      s.type = 'module';
      s.textContent = `
        import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/transformers.min.js';
        env.allowLocalModels = false;
        env.useBrowserCache  = true;
        try {
          const p = await pipeline(
            'feature-extraction',
            'Xenova/all-MiniLM-L6-v2',
            {
              quantized: true,
              progress_callback: (info) => {
                if (info.status === 'progress' && info.total) {
                  window.__sem_progress(
                    Math.round((info.loaded / info.total) * 100),
                    info.file || ''
                  );
                }
              }
            }
          );
          window.__sem_pipe = p;
          window.dispatchEvent(new Event('sem-ready'));
        } catch(e) {
          window.__sem_error = e.message;
          window.dispatchEvent(new Event('sem-error'));
        }
      `;

      window.addEventListener('sem-ready', () => {
        _pipe = window.__sem_pipe;
        console.log('[EvidAI] Semantic model ready ✓');
        resolve(_pipe);
      }, { once: true });

      window.addEventListener('sem-error', () => {
        reject(new Error(window.__sem_error || 'Semantic model load failed'));
      }, { once: true });

      document.head.appendChild(s);
    });

    return _loadPromise;
  }

  // ── Get embedding for a single text ──────────────────────
  async function embed(text) {
    const output = await _pipe(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data);
  }

  // ── Pre-compute pattern library embeddings (done once) ───
  async function buildPatternIndex() {
    if (_patternEmbeddings) return _patternEmbeddings;
    console.log('[EvidAI] Building pattern index…');

    _patternEmbeddings = await Promise.all(
      PATTERN_LIBRARY.map(async (p) => ({
        ...p,
        embedding: await embed(p.text),
      }))
    );

    console.log(`[EvidAI] Pattern index ready — ${_patternEmbeddings.length} patterns`);
    return _patternEmbeddings;
  }

  // ── Main classify function ────────────────────────────────
  async function classify(text, onProgress) {
    const model = await loadModel(onProgress);

    // Build pattern index on first run
    const patterns = await buildPatternIndex();

    // Embed the input text
    const inputEmbedding = await embed(text);

    // Compare input against every pattern
    const scored = patterns.map(p => ({
      ...p,
      similarity: cosineSimilarity(inputEmbedding, p.embedding),
    }));

    // Sort by similarity descending
    scored.sort((a, b) => b.similarity - a.similarity);

    // Top 8 matches become the evidence
    const topMatches = scored.slice(0, 8);

    // Filter to meaningful matches (similarity > 0.25)
    const evidence = topMatches
      .filter(m => m.similarity > 0.25)
      .map(m => ({
        text:       m.text,
        category:   m.category,
        similarity: +m.similarity.toFixed(3),
        level:      m.risk === 'high' ? 'high' : m.risk === 'medium' ? 'medium' : 'safe',
        type:       'semantic',
      }));

    // Also run keyword scan for highlight support
    const kwResult = (typeof Analyzer !== 'undefined')
      ? Analyzer.scoreText(text)
      : { score: 0, evidence: [], wordCount: text.trim().split(/\s+/).length };

    // Calculate semantic risk score
    // Weighted sum of top non-safe matches
    const riskMatches = evidence.filter(e => e.level !== 'safe');
    const safeMatches = evidence.filter(e => e.level === 'safe');

    const riskScore = riskMatches.reduce((sum, m) => {
      const weight = m.level === 'high' ? 1.5 : 1.0;
      return sum + (m.similarity * weight);
    }, 0);

    const safeScore = safeMatches.reduce((sum, m) => sum + m.similarity, 0);

    // Normalize: combine semantic score + keyword boost
    const kwNorm    = Math.min(1, kwResult.score / 20);
    const semNorm   = Math.min(1, riskScore / 3);
    const combined  = (semNorm * 0.65) + (kwNorm * 0.35) - (safeScore * 0.1);
    const finalScore = Math.max(0, Math.min(1, combined));

    // Classify
    let risk, verdict;
    if      (finalScore >= 0.45) { risk = riskMatches.some(m=>m.level==='high') ? 'high' : 'medium'; verdict = risk === 'high' ? 'Suspicious' : 'Needs Review'; }
    else if (finalScore >= 0.22) { risk = 'medium'; verdict = 'Needs Review'; }
    else                         { risk = 'low';    verdict = 'Safe'; }

    const confidence = Math.min(100, Math.round(finalScore * 100));

    return {
      verdict,
      risk,
      confidence,
      score:        +((finalScore * 20).toFixed(2)),
      evidence,
      kwEvidence:   kwResult.evidence,
      wordCount:    kwResult.wordCount,
      timestamp:    new Date().toISOString(),
      mlPowered:    true,
      semanticMode: true,
      topMatch:     evidence[0] || null,
    };
  }

  // ── Highlight uses keyword engine ────────────────────────
  function highlightEvidence(text, kwEvidence) {
    if (typeof Analyzer === 'undefined') return text;
    return Analyzer.highlightEvidence(text, kwEvidence);
  }

  function generateCaseId() {
    return `AID-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000) + 10000}`;
  }

  function isReady()   { return _pipe !== null && _patternEmbeddings !== null; }
  function isLoading() { return _loadPromise !== null && !_pipe; }

  return { loadModel, classify, highlightEvidence, generateCaseId, isReady, isLoading };

})();