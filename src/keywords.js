// ─────────────────────────────────────────────────────────────
//  AI Detective Solutions — Evidence Pattern Library
//  Uncovering Truth and Evidence
// ─────────────────────────────────────────────────────────────

const KEYWORDS = {

  // High-risk signals → strong indicators of fraud, misconduct, or cover-up
  high_risk: [
    "delete all records",
    "wipe the database",
    "bypass security",
    "disable logging",
    "unauthorized access",
    "override permissions",
    "launder",
    "bribe",
    "cover up",
    "no one will know",
    "off the books",
    "don't tell anyone",
    "erase the evidence",
    "kill the audit",
    "fake the report",
    "hide the transaction",
    "under the table",
    "destroy the files",
    "back channel",
    "they won't find out",
    "avoid detection",
    "secret account",
    "dummy invoice",
    "inflate the numbers",
    "falsify",
    "without a trace",
    "before anyone finds out",
    "off the record permanently",
    "make it disappear",
  ],

  // Medium-risk signals → policy violations, boundary-pushing, or suspicious framing
  medium_risk: [
    "confidential",
    "sensitive",
    "restricted",
    "internal only",
    "do not share",
    "between us",
    "off the record",
    "just this once",
    "make an exception",
    "bend the rules",
    "workaround",
    "unofficial",
    "not documented",
    "gray area",
    "technically allowed",
    "loophole",
    "avoid the process",
    "skip approval",
    "personal favor",
    "don't log this",
    "don't forward",
    "keep this quiet",
    "no paper trail",
  ],

  // Safe signals → evidence of compliance and transparent conduct
  safe: [
    "please review",
    "approved by",
    "as per policy",
    "following protocol",
    "audit trail",
    "documented",
    "transparent",
    "compliance",
    "per regulations",
    "legal review",
    "signed off",
    "official channels",
    "on the record",
    "full disclosure",
    "as discussed in the meeting",
    "cc the team",
    "attached for reference",
    "see attached report",
    "per our agreement",
    "for the record",
    "in accordance with",
  ],
};

// ─────────────────────────────────────────────────────────────
//  Contextual pattern matching — catches multi-word fraud signals
//  that keyword lists miss
// ─────────────────────────────────────────────────────────────

const PATTERNS = {
  urgency_manipulation: {
    label:  "Urgency manipulation",
    regex:  /\b(immediately|right now|no time|urgent|asap|before anyone|quickly delete|act fast|before it logs)\b/gi,
    weight: 3,
  },
  financial_fraud: {
    label:  "Financial fraud signal",
    regex:  /\b(transfer.{0,20}without|payment.{0,20}trace|cash.{0,20}untraceable|invoice.{0,20}fake|account.{0,20}offshore|funds.{0,20}hidden)\b/gi,
    weight: 4,
  },
  data_exfiltration: {
    label:  "Data exfiltration signal",
    regex:  /\b(send.{0,20}external|export.{0,20}personal|share.{0,20}credentials|forward.{0,20}private|forward.{0,20}email|copy.{0,20}outside)\b/gi,
    weight: 4,
  },
  threat_language: {
    label:  "Threatening language",
    regex:  /\b(or else|consequences|you'll regret|make sure you|don't make me|watch yourself|you have been warned)\b/gi,
    weight: 4,
  },
  identity_deception: {
    label:  "Identity or access deception",
    regex:  /\b(use.{0,15}someone else|login.{0,15}as|pretend.{0,15}to be|impersonate|fake.{0,15}identity|another person's account)\b/gi,
    weight: 4,
  },
};