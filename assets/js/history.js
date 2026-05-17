// ─── EvidAI — Case History Module ────────────────────────────

const CaseHistory = (() => {

  const STORAGE_KEY = 'evidai_cases';
  const MAX_CASES   = 100;

  function save(result, rawText, caseId) {
    try {
      const cases = getAll();
      const entry = {
        id:         caseId,
        verdict:    result.verdict,
        risk:       result.risk,
        confidence: result.confidence,
        score:      result.score,
        wordCount:  result.wordCount,
        evidence:   result.evidence || [],
        kwEvidence: result.kwEvidence || [],
        rawText:    rawText,
        timestamp:  result.timestamp,
        semanticMode: result.semanticMode || false,
      };
      cases.unshift(entry);
      if (cases.length > MAX_CASES) cases.splice(MAX_CASES);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
      console.log(`[EvidAI] Case saved: ${caseId} — total: ${cases.length}`);
      return entry;
    } catch (err) {
      console.error('[EvidAI] Failed to save case:', err);
      return null;
    }
  }

  function getAll() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  }

  function getById(id) {
    return getAll().find(c => c.id === id) || null;
  }

  function remove(id) {
    const updated = getAll().filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  function clearAll() {
    localStorage.removeItem(STORAGE_KEY);
  }

  function getStats() {
    const cases = getAll();
    return {
      total:  cases.length,
      high:   cases.filter(c => c.risk === 'high').length,
      medium: cases.filter(c => c.risk === 'medium').length,
      low:    cases.filter(c => c.risk === 'low').length,
    };
  }

  return { save, getAll, getById, remove, clearAll, getStats };

})();