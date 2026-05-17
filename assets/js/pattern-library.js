// ─── EvidAI — Forensic Pattern Library ──────────────────────
// These sentences represent known risk/fraud communication patterns.
// The semantic engine compares user input against these using
// cosine similarity of vector embeddings.
// Grouped by category and risk level.

const PATTERN_LIBRARY = [

  // ── Financial Fraud ───────────────────────────────────────
  { text: "transfer money without leaving any trace",              category: "Financial Fraud",       risk: "high" },
  { text: "move funds to an offshore account secretly",           category: "Financial Fraud",       risk: "high" },
  { text: "create a fake invoice to cover the transaction",       category: "Financial Fraud",       risk: "high" },
  { text: "make the payment untraceable",                         category: "Financial Fraud",       risk: "high" },
  { text: "inflate the numbers before the report is submitted",   category: "Financial Fraud",       risk: "high" },
  { text: "hide the transaction from the auditors",               category: "Financial Fraud",       risk: "high" },
  { text: "use a dummy account to process the payment",           category: "Financial Fraud",       risk: "high" },
  { text: "keep this payment off the official books",             category: "Financial Fraud",       risk: "high" },

  // ── Evidence Destruction ──────────────────────────────────
  { text: "delete all records before the audit begins",           category: "Evidence Destruction",  risk: "high" },
  { text: "destroy the files before anyone finds out",            category: "Evidence Destruction",  risk: "high" },
  { text: "erase the evidence from the system",                   category: "Evidence Destruction",  risk: "high" },
  { text: "wipe the database before they investigate",            category: "Evidence Destruction",  risk: "high" },
  { text: "make sure there is no paper trail",                    category: "Evidence Destruction",  risk: "high" },
  { text: "remove the logs before the review",                    category: "Evidence Destruction",  risk: "high" },
  { text: "clean up the records tonight",                         category: "Evidence Destruction",  risk: "high" },

  // ── Data Exfiltration ─────────────────────────────────────
  { text: "send the confidential data to an external email",      category: "Data Exfiltration",     risk: "high" },
  { text: "forward the client credentials to my personal account",category: "Data Exfiltration",     risk: "high" },
  { text: "share the private files outside the organization",     category: "Data Exfiltration",     risk: "high" },
  { text: "copy the database and send it externally",             category: "Data Exfiltration",     risk: "high" },
  { text: "leak the internal report to a competitor",             category: "Data Exfiltration",     risk: "high" },
  { text: "export all user data without authorization",           category: "Data Exfiltration",     risk: "high" },

  // ── Cover-up & Deception ──────────────────────────────────
  { text: "no one will find out if we do it this way",            category: "Cover-up",              risk: "high" },
  { text: "make sure they never discover what happened",          category: "Cover-up",              risk: "high" },
  { text: "keep this between us and tell nobody",                 category: "Cover-up",              risk: "high" },
  { text: "falsify the report to make it look legitimate",        category: "Cover-up",              risk: "high" },
  { text: "cover up the mistake before management finds out",     category: "Cover-up",              risk: "high" },
  { text: "change the records so it looks like it never happened",category: "Cover-up",              risk: "high" },

  // ── Threat & Coercion ─────────────────────────────────────
  { text: "you will regret this if you don't comply",             category: "Threat & Coercion",     risk: "high" },
  { text: "do this or there will be serious consequences",        category: "Threat & Coercion",     risk: "high" },
  { text: "I will make sure your career is over",                 category: "Threat & Coercion",     risk: "high" },
  { text: "don't make me take action against you",                category: "Threat & Coercion",     risk: "high" },

  // ── Policy Violation ──────────────────────────────────────
  { text: "skip the approval process just this once",             category: "Policy Violation",      risk: "medium" },
  { text: "bypass the security check to save time",               category: "Policy Violation",      risk: "medium" },
  { text: "bend the rules to get this done faster",               category: "Policy Violation",      risk: "medium" },
  { text: "use a workaround to avoid the official process",       category: "Policy Violation",      risk: "medium" },
  { text: "this is technically not allowed but do it anyway",     category: "Policy Violation",      risk: "medium" },
  { text: "keep this unofficial and off the record",              category: "Policy Violation",      risk: "medium" },
  { text: "don't document this anywhere",                         category: "Policy Violation",      risk: "medium" },

  // ── Urgency Manipulation ──────────────────────────────────
  { text: "act immediately before anyone notices",                category: "Urgency Manipulation",  risk: "medium" },
  { text: "do this right now before the system logs it",          category: "Urgency Manipulation",  risk: "medium" },
  { text: "we need to move fast before the review happens",       category: "Urgency Manipulation",  risk: "medium" },
  { text: "hurry up before the audit team arrives",               category: "Urgency Manipulation",  risk: "medium" },

  // ── Safe / Compliant ──────────────────────────────────────
  { text: "please review this document as per our policy",        category: "Compliant",             risk: "safe" },
  { text: "this transaction has been approved and documented",    category: "Compliant",             risk: "safe" },
  { text: "following the official compliance guidelines",         category: "Compliant",             risk: "safe" },
  { text: "the audit trail is complete and available for review", category: "Compliant",             risk: "safe" },
  { text: "all records have been signed off by legal",            category: "Compliant",             risk: "safe" },
  { text: "transparent process in accordance with regulations",   category: "Compliant",             risk: "safe" },
];

// Cosine similarity between two vectors
function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot   += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB) + 1e-8);
}

window.PATTERN_LIBRARY   = PATTERN_LIBRARY;
window.cosineSimilarity  = cosineSimilarity;