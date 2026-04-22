// ─── EvidAI — PDF Export Module ─────────────────────────────
// Generates a formatted case report PDF using jsPDF

const PDFExport = (() => {

  function generate(caseData) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });

    const W      = 210;
    const MARGIN = 20;
    const CW     = W - MARGIN * 2;
    let   y      = 0;

    // ── Colors ────────────────────────────────────────────
    const INK    = [8,   10,  15];
    const GOLD   = [200, 168, 75];
    const CHALK  = [220, 225, 235];
    const MUTED  = [100, 110, 130];
    const RED    = [192, 57,  43];
    const AMBER  = [196, 125, 17];
    const TEAL   = [20,  138, 116];
    const WHITE  = [255, 255, 255];

    const riskColor = caseData.risk === 'high' ? RED
                    : caseData.risk === 'medium' ? AMBER
                    : TEAL;

    // ── Header band ───────────────────────────────────────
    doc.setFillColor(...INK);
    doc.rect(0, 0, W, 42, 'F');

    // Gold top accent line
    doc.setFillColor(...GOLD);
    doc.rect(0, 0, W, 1.5, 'F');

    // Brand name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(...GOLD);
    doc.text('EvidAI', MARGIN, 16);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.text('AI Detective Solutions  ·  Uncovering Truth and Evidence', MARGIN, 22);

    // Case ID + timestamp (right aligned)
    doc.setFont('courier', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    const ts = new Date(caseData.timestamp).toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
    doc.text(caseData.id, W - MARGIN, 14, { align: 'right' });
    doc.text(ts, W - MARGIN, 20, { align: 'right' });

    // Verdict badge area
    doc.setFillColor(...riskColor);
    doc.roundedRect(MARGIN, 28, 50, 10, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...WHITE);
    doc.text(caseData.verdict.toUpperCase(), MARGIN + 25, 34.5, { align: 'center' });

    y = 52;

    // ── Confidence row ────────────────────────────────────
    doc.setFillColor(20, 25, 35);
    doc.roundedRect(MARGIN, y, CW, 18, 2, 2, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text('RISK CONFIDENCE', MARGIN + 4, y + 7);

    // Bar track
    doc.setFillColor(40, 50, 65);
    doc.roundedRect(MARGIN + 4, y + 9, CW - 50, 4, 1, 1, 'F');

    // Bar fill
    const barW = ((CW - 50) * caseData.confidence) / 100;
    doc.setFillColor(...riskColor);
    doc.roundedRect(MARGIN + 4, y + 9, barW, 4, 1, 1, 'F');

    // Percentage
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...CHALK);
    doc.text(`${caseData.confidence}%`, W - MARGIN - 4, y + 13, { align: 'right' });

    // Score
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...MUTED);
    doc.text(`Score: ${caseData.score} / 20  ·  ${caseData.wordCount} words  ·  ${caseData.evidence.length} signals`, MARGIN + 4, y + 16);

    y += 26;

    // ── Analyzed transcript ───────────────────────────────
    sectionHeader(doc, 'ANALYZED TRANSCRIPT', MARGIN, y, CW, GOLD, INK, MUTED);
    y += 10;

    doc.setFillColor(14, 18, 28);
    const textLines = doc.setFontSize(9).splitTextToSize(caseData.rawText, CW - 10);
    const textBlockH = Math.min(textLines.length * 5 + 8, 50);
    doc.roundedRect(MARGIN, y, CW, textBlockH, 2, 2, 'F');

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    const visibleLines = textLines.slice(0, Math.floor((textBlockH - 8) / 5));
    doc.text(visibleLines, MARGIN + 5, y + 7);
    if (textLines.length > visibleLines.length) {
      doc.setFontSize(7);
      doc.text('[truncated — see full text in analyzer]', MARGIN + 5, y + textBlockH - 3);
    }

    y += textBlockH + 8;

    // ── Evidence log ──────────────────────────────────────
    sectionHeader(doc, 'EVIDENCE LOG', MARGIN, y, CW, GOLD, INK, MUTED);
    y += 10;

    const high   = caseData.evidence.filter(e => e.level === 'high');
    const medium = caseData.evidence.filter(e => e.level === 'medium');
    const safe   = caseData.evidence.filter(e => e.level === 'safe');

    y = evidenceGroup(doc, high,   'HIGH-RISK SIGNALS',    RED,   WHITE, MARGIN, y, CW);
    y = evidenceGroup(doc, medium, 'MEDIUM-RISK SIGNALS',  AMBER, WHITE, MARGIN, y, CW);
    y = evidenceGroup(doc, safe,   'SAFE / COMPLIANT',     TEAL,  WHITE, MARGIN, y, CW);

    if (caseData.evidence.length === 0) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(...MUTED);
      doc.text('No notable signals detected in this communication.', MARGIN, y);
      y += 8;
    }

    // ── Footer ────────────────────────────────────────────
    doc.setFillColor(...INK);
    doc.rect(0, 287, W, 10, 'F');
    doc.setFont('courier', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...MUTED);
    doc.text('EvidAI — AI Detective Solutions  ·  evidai.vercel.app', MARGIN, 293);
    doc.text(`Generated: ${ts}`, W - MARGIN, 293, { align: 'right' });

    // ── Save ──────────────────────────────────────────────
    doc.save(`${caseData.id}.pdf`);
  }

  function sectionHeader(doc, label, x, y, w, gold, ink, muted) {
    doc.setFillColor(...ink);
    doc.rect(x, y, w, 8, 'F');
    doc.setFillColor(...gold);
    doc.rect(x, y, 2, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...gold);
    doc.text(label, x + 6, y + 5.5);
  }

  function evidenceGroup(doc, items, heading, color, textColor, margin, y, cw) {
    if (!items.length) return y;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...color);
    doc.text(heading, margin, y);
    y += 5;

    let x = margin;
    items.forEach(e => {
      const label = e.type === 'pat' ? `${e.label}: "${e.text}"` : `"${e.text}"`;
      const pillW = Math.min(doc.getTextWidth(label) + 6, cw);

      if (x + pillW > margin + cw) { x = margin; y += 7; }

      doc.setFillColor(...color);
      doc.setGState(doc.GState({ opacity: 0.15 }));
      doc.roundedRect(x, y - 4, pillW, 6, 1, 1, 'F');
      doc.setGState(doc.GState({ opacity: 1 }));

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(...color);
      doc.text(label, x + 3, y);
      x += pillW + 3;
    });

    return y + 10;
  }

  return { generate };

})();