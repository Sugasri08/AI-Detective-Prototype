// ─── AI Detective Solutions — Evidence Engine ───────────────

const KEYWORDS = {
  high_risk: [
    "delete all records","wipe the database","bypass security","disable logging",
    "unauthorized access","override permissions","launder","bribe","cover up",
    "no one will know","off the books","don't tell anyone","erase the evidence",
    "kill the audit","fake the report","hide the transaction","under the table",
    "destroy the files","back channel","they won't find out","avoid detection",
    "secret account","dummy invoice","inflate the numbers","falsify",
    "without a trace","before anyone finds out","make it disappear",
  ],
  medium_risk: [
    "confidential","sensitive","restricted","internal only","do not share",
    "between us","off the record","just this once","make an exception",
    "bend the rules","workaround","unofficial","not documented","gray area",
    "technically allowed","loophole","avoid the process","skip approval",
    "personal favor","don't log this","don't forward","keep this quiet","no paper trail",
  ],
  safe: [
    "please review","approved by","as per policy","following protocol",
    "audit trail","documented","transparent","compliance","per regulations",
    "legal review","signed off","official channels","on the record",
    "full disclosure","as discussed in the meeting","cc the team",
    "attached for reference","see attached report","for the record","in accordance with",
  ],
};

const PATTERNS = {
  urgency_manipulation: { label:"Urgency manipulation",   regex:/\b(immediately|right now|no time|urgent|asap|before anyone|act fast|before it logs)\b/gi, weight:3 },
  financial_fraud:      { label:"Financial fraud signal", regex:/\b(transfer.{0,20}without|payment.{0,20}trace|cash.{0,20}untraceable|invoice.{0,20}fake|account.{0,20}offshore)\b/gi, weight:4 },
  data_exfiltration:    { label:"Data exfiltration",      regex:/\b(send.{0,20}external|share.{0,20}credentials|forward.{0,20}private|forward.{0,20}email|copy.{0,20}outside)\b/gi, weight:4 },
  threat_language:      { label:"Threatening language",   regex:/\b(or else|consequences|you'll regret|don't make me|watch yourself)\b/gi, weight:4 },
  identity_deception:   { label:"Identity deception",     regex:/\b(use.{0,15}someone else|login.{0,15}as|impersonate|fake.{0,15}identity)\b/gi, weight:4 },
};

const Analyzer = (() => {
  function scoreText(text) {
    const lower = text.toLowerCase();
    const evidence = [];
    let score = 0;

    KEYWORDS.high_risk.forEach(k => { if(lower.includes(k)){ score+=3; evidence.push({text:k,level:"high",type:"kw"}); }});
    KEYWORDS.medium_risk.forEach(k => { if(lower.includes(k)){ score+=1.5; evidence.push({text:k,level:"medium",type:"kw"}); }});
    KEYWORDS.safe.forEach(k => { if(lower.includes(k)){ score-=1; evidence.push({text:k,level:"safe",type:"kw"}); }});

    Object.entries(PATTERNS).forEach(([,p]) => {
      [...text.matchAll(p.regex)].forEach(m => {
        score += p.weight;
        evidence.push({text:m[0].trim(), level:"high", type:"pat", label:p.label});
      });
    });

    const urgN = (lower.match(/\b(urgent|asap|immediately|right now|hurry|act fast)\b/g)||[]).length;
    if(urgN >= 2){ score+=2; evidence.push({text:`${urgN} urgency signals stacked`, level:"medium", type:"heuristic"}); }

    score = Math.max(0, score);
    const confidence = Math.min(100, Math.round((score/20)*100));
    const risk = score>=6 ? "high" : score>=2.5 ? "medium" : "low";
    const verdict = risk==="high" ? "Suspicious" : risk==="medium" ? "Needs Review" : "Safe";

    return { verdict, risk, confidence, score:+score.toFixed(2), evidence, wordCount:text.trim().split(/\s+/).length, timestamp:new Date().toISOString() };
  }

  function highlightEvidence(text, evidence) {
    let r = text;
    const done = new Set();
    [...evidence].filter(e=>e.type==="kw"||e.type==="pat")
      .sort((a,b)=>b.text.length-a.text.length)
      .forEach(e => {
        const k = e.text.toLowerCase();
        if(done.has(k)) return;
        done.add(k);
        const cls = e.level==="high"?"ev-h":e.level==="medium"?"ev-m":"ev-s";
        r = r.replace(new RegExp(`(${e.text.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})`,"gi"), `<mark class="${cls}">$1</mark>`);
      });
    return r;
  }

  function generateCaseId() {
    return `AID-${new Date().getFullYear()}-${Math.floor(Math.random()*90000)+10000}`;
  }

  return { scoreText, highlightEvidence, generateCaseId };
})();