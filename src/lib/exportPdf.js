/**
 * exportPdf — generates a well-formatted PDF report
 * Uses a hidden iframe with print-styled HTML — no external libraries needed.
 */
export function exportPdf({ userData, answers, result }) {
  const now = new Date().toLocaleDateString("en-IN", {
    day: "2-digit", month: "long", year: "numeric",
  });

  const scoreCol =
    (result?.overallScore ?? 0) >= 70 ? "#00A3A1" :
    (result?.overallScore ?? 0) >= 50 ? "#E8A000" : "#C8002D";

  const dim = result?.dimensions || {};
  const dims = [
    { l: "Market Size",       v: dim.marketSize       ?? "—" },
    { l: "Audience Quality",  v: dim.audienceQuality  ?? "—" },
    { l: "Competitive Edge",  v: dim.competitionEdge  ?? "—" },
    { l: "Revenue Potential", v: dim.revenuePotential ?? "—" },
    { l: "Risk Profile",      v: dim.riskProfile      ?? "—" },
    { l: "Sector Fit",        v: dim.sectorFit        ?? "—" },
  ];

  const answerRows = Object.entries(answers || {})
    .filter(([, v]) => v && v !== "")
    .map(([k, v]) => `
      <tr>
        <td style="padding:7px 12px;border-bottom:1px solid #F3F4F6;font-size:11px;color:#6B7280;width:40%">${k}</td>
        <td style="padding:7px 12px;border-bottom:1px solid #F3F4F6;font-size:11px;color:#111827">${Array.isArray(v) ? v.join(", ") : v}</td>
      </tr>`)
    .join("");

  const insightRows = (result?.keyInsights || [])
    .map((ins, i) => `
      <div style="display:flex;gap:12px;padding:10px 14px;background:${i % 2 === 0 ? "#FAFAFA" : "#fff"};border:1px solid #F3F4F6;border-radius:6px;margin-bottom:8px;">
        <div style="width:22px;height:22px;border-radius:50%;background:#0F1E3C;color:#fff;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0">${i + 1}</div>
        <div style="font-size:12px;color:#374151;line-height:1.65">${ins.replace(/^[💡⚔️💰📍✅⚠️]\s*/u, "")}</div>
      </div>`)
    .join("");

  const riskRows = (result?.topRisks || [])
    .map((r, i) => `<div style="display:flex;gap:8px;margin-bottom:8px;font-size:12px;color:#374151"><span style="color:#EF4444;font-weight:700">${i + 1}.</span>${r}</div>`)
    .join("");

  const winRows = (result?.quickWins || [])
    .map((w, i) => `<div style="display:flex;gap:8px;margin-bottom:8px;font-size:12px;color:#374151"><span style="color:#059669;font-weight:700">${i + 1}.</span>${w}</div>`)
    .join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Infopace Market Assessment — ${userData.organization || "Report"}</title>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;600&display=swap" rel="stylesheet"/>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'IBM Plex Sans',sans-serif;color:#111827;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    @page{size:A4;margin:0}
    @media print{body{margin:0}}
    .page{max-width:794px;margin:0 auto;padding:0}
    /* Cover */
    .cover{background:#0F1E3C;padding:52px 56px 36px;position:relative;page-break-after:always}
    .cover-brand{font-size:8px;letter-spacing:.2em;text-transform:uppercase;color:rgba(148,163,184,.5);margin-bottom:20px}
    .cover-title{font-size:38px;font-weight:700;color:#F8FAFC;line-height:1;letter-spacing:-.02em;margin-bottom:10px}
    .cover-sub{font-size:13px;color:rgba(148,163,184,.6);margin-bottom:28px}
    .cover-badges{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:36px}
    .badge{padding:5px 14px;border-radius:4px;font-size:10px;font-weight:600;letter-spacing:.04em}
    .cover-kpis{display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid rgba(255,255,255,.08);padding-top:24px;gap:0}
    .kpi{padding:0 16px 0 0}
    .kpi+.kpi{border-left:1px solid rgba(255,255,255,.08);padding-left:16px}
    .kpi-l{font-size:7px;color:rgba(148,163,184,.4);text-transform:uppercase;letter-spacing:.1em;margin-bottom:5px}
    .kpi-v{font-family:'IBM Plex Mono',monospace;font-size:16px;font-weight:700;color:#E2E8F0}
    /* Body */
    .body{padding:40px 56px 60px}
    .section-hdr{display:flex;align-items:baseline;gap:10px;margin-bottom:12px;padding-bottom:8px;border-bottom:2px solid #0F1E3C}
    .section-letter{font-size:10px;font-weight:700;color:#6B7280;letter-spacing:.16em;text-transform:uppercase}
    .section-title{font-size:18px;font-weight:700;color:#111827;letter-spacing:-.02em}
    .section-sub{font-size:11px;color:#9CA3AF;margin-left:auto}
    .card{background:#fff;border:1px solid #E5E7EB;border-radius:8px;overflow:hidden;margin-bottom:20px;box-shadow:0 1px 4px rgba(15,30,60,.04)}
    .card-hdr{padding:13px 20px;border-bottom:1px solid #F3F4F6;font-size:11px;font-weight:700;color:#374151}
    .card-body{padding:16px 20px}
    /* Score gauge inline */
    .score-ring{display:flex;align-items:center;gap:24px;padding:18px 0}
    .ring-num{font-family:'IBM Plex Mono',monospace;font-size:52px;font-weight:700;line-height:1}
    .ring-info{display:flex;flex-direction:column;gap:4px}
    .ring-grade{font-size:14px;font-weight:700}
    .ring-label{font-size:10px;color:#9CA3AF;text-transform:uppercase;letter-spacing:.1em}
    /* Dim bars */
    .dim-row{display:flex;align-items:center;gap:12px;margin-bottom:10px}
    .dim-label{font-size:10px;color:#374151;width:130px;flex-shrink:0}
    .dim-track{flex:1;height:8px;background:#F3F4F6;border-radius:4px;overflow:hidden}
    .dim-fill{height:100%;border-radius:4px}
    .dim-val{font-family:'IBM Plex Mono',monospace;font-size:10px;font-weight:700;width:32px;text-align:right}
    /* User info */
    .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:0}
    .info-cell{padding:8px 12px;border-bottom:1px solid #F9FAFB;font-size:11px}
    .info-label{color:#9CA3AF;font-size:9px;text-transform:uppercase;letter-spacing:.08em;margin-bottom:2px}
    .info-val{color:#111827;font-weight:500}
    /* Answers table */
    table{width:100%;border-collapse:collapse}
    /* Competitors */
    .comp-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
    .comp-card{border:1px solid #E5E7EB;border-radius:6px;overflow:hidden}
    .comp-hdr{padding:10px 14px;border-bottom:2px solid}
    .comp-name{font-size:12px;font-weight:700;color:#111827}
    .comp-stage{font-size:9px;color:#6B7280;margin-top:2px}
    .comp-body{padding:10px 14px}
    .comp-tag{font-size:7px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;margin-bottom:3px}
    .comp-txt{font-size:10px;color:#374151;line-height:1.5}
    /* Footer */
    .footer{display:flex;justify-content:space-between;align-items:center;padding-top:20px;border-top:2px solid #0F1E3C;margin-top:32px}
    .footer-brand{font-size:12px;font-weight:700;color:#0F1E3C}
    .footer-sub{font-size:9px;color:#9CA3AF;margin-top:2px}
    .footer-date{font-size:10px;color:#6B7280;text-align:right}
  </style>
</head>
<body>
<div class="page">

  <!-- ══ COVER ══ -->
  <div class="cover">
    <div class="cover-brand">Infopace Management Pvt Ltd · Market Intelligence Platform</div>
    <div class="cover-title">${userData.organization || "Market Assessment"}</div>
    <div class="cover-sub">${userData.sector || ""} &nbsp;/&nbsp; ${userData.role || ""} &nbsp;/&nbsp; ${userData.geography || ""}</div>
    <div class="cover-badges">
      <span class="badge" style="background:rgba(255,255,255,.08);color:#F1F5F9;border:1px solid rgba(255,255,255,.12)">${result?.grade || "—"}</span>
      <span class="badge" style="background:rgba(217,119,6,.12);color:#FCD34D;border:1px solid rgba(217,119,6,.25)">↑ ${result?.growthRate || "—"}% CAGR</span>
      <span class="badge" style="background:rgba(6,95,70,.15);color:#6EE7B7;border:1px solid rgba(6,95,70,.3)">${result?.overallScore || "—"}/100 Score</span>
      ${result?.realTimeInsight ? `<span class="badge" style="background:rgba(14,116,144,.15);color:#67E8F9;border:1px solid rgba(14,116,144,.3)">Live Intelligence</span>` : ""}
    </div>
    <div class="cover-kpis">
      <div class="kpi"><div class="kpi-l">Total Market · TAM</div><div class="kpi-v">₹${Math.round(result?.tamCrore || 0)}Cr</div></div>
      <div class="kpi"><div class="kpi-l">Serviceable · SAM</div><div class="kpi-v">₹${Math.round(result?.samCrore || 0)}Cr</div></div>
      <div class="kpi"><div class="kpi-l">3-Year Target · SOM</div><div class="kpi-v">₹${Math.round(result?.somCrore || 0)}Cr</div></div>
      <div class="kpi"><div class="kpi-l">Report Date</div><div class="kpi-v" style="font-size:11px">${now}</div></div>
    </div>
  </div>

  <!-- ══ BODY ══ -->
  <div class="body">

    <!-- Verdict -->
    ${result?.verdict ? `
    <div style="display:grid;grid-template-columns:6px 1fr;gap:0;margin-bottom:28px;background:#fff;border-radius:8px;border:1px solid #E5E7EB;overflow:hidden">
      <div style="background:#0F1E3C"></div>
      <div style="padding:20px 24px">
        <div style="font-size:8px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:.18em;margin-bottom:8px">Executive Assessment</div>
        <div style="font-size:14px;color:#111827;line-height:1.8">${result.verdict}</div>
        ${result.realTimeInsight ? `<div style="margin-top:12px;display:flex;gap:8px;padding:10px 14px;background:#F0FDFA;border-radius:6px;border:1px solid #99F6E4"><span style="font-size:10px;color:#0F766E;font-weight:700">LIVE</span><span style="font-size:11px;color:#134E4A">${result.realTimeInsight}</span></div>` : ""}
      </div>
    </div>` : ""}

    <!-- A: User Info -->
    <div class="section-hdr">
      <span class="section-letter">A</span>
      <span class="section-title">Participant Details</span>
      <span class="section-sub">Submitted ${now}</span>
    </div>
    <div class="card" style="margin-bottom:28px">
      <div class="info-grid">
        <div class="info-cell"><div class="info-label">Full Name</div><div class="info-val">${userData.name || "—"}</div></div>
        <div class="info-cell"><div class="info-label">Email</div><div class="info-val">${userData.email || "—"}</div></div>
        <div class="info-cell"><div class="info-label">Phone</div><div class="info-val">${userData.phone || "—"}</div></div>
        <div class="info-cell"><div class="info-label">Organization</div><div class="info-val">${userData.organization || "—"}</div></div>
        <div class="info-cell"><div class="info-label">Role</div><div class="info-val">${userData.role || "—"}</div></div>
        <div class="info-cell"><div class="info-label">Team Size</div><div class="info-val">${userData.teamSize || "—"}</div></div>
        <div class="info-cell"><div class="info-label">Sector</div><div class="info-val">${userData.sector || "—"}</div></div>
        <div class="info-cell"><div class="info-label">Geography</div><div class="info-val">${userData.geography || "—"}</div></div>
        <div class="info-cell" style="grid-column:span 2"><div class="info-label">Problem Statement</div><div class="info-val" style="line-height:1.6">${userData.problem || "—"}</div></div>
      </div>
    </div>

    <!-- B: Score -->
    <div class="section-hdr">
      <span class="section-letter">B</span>
      <span class="section-title">Market Potential Score</span>
      <span class="section-sub">6 Dimensions · Weighted</span>
    </div>
    <div class="card" style="margin-bottom:28px">
      <div class="card-body">
        <div class="score-ring">
          <div class="ring-num" style="color:${scoreCol}">${result?.overallScore ?? "—"}</div>
          <div class="ring-info">
            <div class="ring-grade" style="color:${scoreCol}">${result?.grade || "—"} Opportunity</div>
            <div class="ring-label">Overall Score / 100</div>
            <div style="font-size:11px;color:#6B7280;margin-top:4px">CAGR: +${result?.growthRate || "—"}% &nbsp;·&nbsp; TAM: ₹${Math.round(result?.tamCrore || 0)}Cr</div>
          </div>
        </div>
        <div style="border-top:1px solid #F3F4F6;padding-top:16px;margin-top:8px">
          ${dims.map(d => {
            const v = typeof d.v === "number" ? d.v : 0;
            const c = v >= 70 ? "#059669" : v >= 50 ? "#D97706" : "#DC2626";
            return `<div class="dim-row">
              <div class="dim-label">${d.l}</div>
              <div class="dim-track"><div class="dim-fill" style="width:${v}%;background:${c}"></div></div>
              <div class="dim-val" style="color:${c}">${d.v}/100</div>
            </div>`;
          }).join("")}
        </div>
      </div>
    </div>

    <!-- C: Competitors -->
    ${(result?.competitorProfiles || []).length ? `
    <div class="section-hdr">
      <span class="section-letter">C</span>
      <span class="section-title">Competitor Profiles</span>
      <span class="section-sub">${result.competitorProfiles.length} identified</span>
    </div>
    <div class="comp-grid" style="margin-bottom:28px">
      ${(result.competitorProfiles || []).slice(0, 3).map((p, i) => {
        const cols = ["#1A56B0", "#0891B2", "#065F46"];
        const c = cols[i] || "#374151";
        return `<div class="comp-card">
          <div class="comp-hdr" style="border-color:${c}">
            <div class="comp-name">${p.name || "—"}</div>
            <div class="comp-stage">${p.stage || ""} · ~${p.marketSharePct || "—"}% share</div>
          </div>
          <div class="comp-body">
            <div class="comp-tag" style="color:#059669">Strength</div>
            <div class="comp-txt" style="margin-bottom:8px">${p.strength || "—"}</div>
            <div class="comp-tag" style="color:#D97706">Exploitable Gap</div>
            <div class="comp-txt">${p.weakness || "—"}</div>
          </div>
        </div>`;
      }).join("")}
    </div>` : ""}

    <!-- D: Key Insights -->
    <div class="section-hdr">
      <span class="section-letter">D</span>
      <span class="section-title">Key Market Insights</span>
      <span class="section-sub">AI-generated · data-verified</span>
    </div>
    <div style="margin-bottom:28px">${insightRows || "<p style='color:#9CA3AF;font-size:12px'>No insights available.</p>"}</div>

    <!-- E: Risks & Quick Wins -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:28px">
      <div>
        <div class="section-hdr"><span class="section-letter">E</span><span class="section-title">Top Risks</span></div>
        <div class="card"><div class="card-body">${riskRows || "—"}</div></div>
      </div>
      <div>
        <div class="section-hdr"><span class="section-letter">F</span><span class="section-title">90-Day Quick Wins</span></div>
        <div class="card"><div class="card-body">${winRows || "—"}</div></div>
      </div>
    </div>

    <!-- G: Assessment Answers -->
    ${answerRows ? `
    <div class="section-hdr">
      <span class="section-letter">G</span>
      <span class="section-title">Assessment Responses</span>
      <span class="section-sub">All questions answered</span>
    </div>
    <div class="card" style="margin-bottom:28px">
      <table><tbody>${answerRows}</tbody></table>
    </div>` : ""}

    <!-- Footer -->
    <div class="footer">
      <div>
        <div class="footer-brand">Infopace Management Pvt Ltd</div>
        <div class="footer-sub">Market Intelligence Platform · AI-Powered Analysis</div>
      </div>
      <div class="footer-date">
        <div>Generated ${now}</div>
        <div style="margin-top:2px;color:#D1D5DB;font-size:9px">Confidential · For Internal Use Only</div>
      </div>
    </div>

  </div>
</div>
</body>
</html>`;

  // Open in new tab and trigger print dialog
  const win = window.open("", "_blank");
  if (!win) {
    alert("Please allow pop-ups to export PDF.");
    return;
  }
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => {
    win.print();
  }, 800);
}
