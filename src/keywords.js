const KEYWORDS = {
  high_risk: [
    "delete all records", "wipe the database", "bypass security", "disable logging",
    "unauthorized access", "override permissions", "launder", "bribe", "cover up",
    "no one will know", "off the books", "don't tell anyone", "erase the evidence",
    "kill the audit", "fake the report", "hide the transaction", "under the table",
    "destroy the files", "back channel", "they won't find out", "avoid detection",
    "secret account", "dummy invoice", "inflate the numbers", "falsify"
  ],
  medium_risk: [
    "confidential", "sensitive", "restricted", "internal only", "do not share",
    "between us", "off the record", "just this once", "make an exception",
    "bend the rules", "workaround", "unofficial", "not documented", "gray area",
    "technically allowed", "loophole", "avoid the process", "skip approval",
    "expedite without review", "personal favor", "don't log this"
  ],
  safe: [
    "please review", "approved by", "as per policy", "following protocol",
    "audit trail", "documented", "transparent", "compliance", "per regulations",
    "legal review", "signed off", "official channels", "on the record",
    "full disclosure", "as discussed in the meeting", "cc the team",
    "per our agreement", "attached for reference", "see attached report"
  ]
};

const PATTERNS = {
  urgency_manipulation: /\b(immediately|right now|no time|urgent|asap|before anyone|quickly delete|act fast)\b/gi,
  financial_fraud:      /\b(transfer.{0,20}without|payment.{0,20}trace|cash.{0,20}untraceable|invoice.{0,20}fake|account.{0,20}offshore)\b/gi,
  data_exfil:           /\b(send.{0,20}external|export.{0,20}personal|share.{0,20}credentials|forward.{0,20}private)\b/gi,
  threat_language:      /\b(or else|consequences|you'll regret|make sure you|don't make me|watch yourself)\b/gi,
};