/**
 * generateAnalysis — calls the Node proxy (server.js → Gemini)
 * Returns a parsed analysis object.
 */
export async function generateAnalysis(userData, answers = {}) {
  const answerLines = Object.entries(answers)
    .filter(([, v]) => v && v !== "")
    .map(([, v]) => `  - ${Array.isArray(v) ? v.join(", ") : v}`)
    .join("\n");

  const prompt = `You are a senior market intelligence analyst with deep knowledge of Indian and global markets.

Analyse this product and produce a data-driven market assessment using your real knowledge of this sector, geography, and companies.

PRODUCT: ${userData.organization || "Unnamed"}
SECTOR: ${userData.sector || "Not specified"}
BUSINESS TYPE: ${userData.role || "Not specified"}
TARGET GEOGRAPHY: ${userData.geography || "Not specified"}
BUSINESS STAGE: ${userData.stage || "Not specified"}
PROBLEM BEING SOLVED: ${userData.problem || "Not described"}

WHAT THE FOUNDER TOLD US ABOUT THEIR MARKET:
${answerLines || "(answers not provided)"}

CRITICAL INSTRUCTIONS:
1. Use your REAL knowledge of the ${userData.sector} market in ${userData.geography} — cite real TAM figures, real CAGR rates
2. Name REAL competitors that actually exist in ${userData.sector} in ${userData.geography} — not placeholders
3. Score those competitors based on your actual knowledge of their market position
4. Revenue by region must reflect real market concentration for ${userData.sector} in ${userData.geography}
5. The overall score must genuinely reflect the founder's answers above
6. TAM/SAM/SOM must be realistic for this specific sector and geography

Return ONLY raw JSON, no markdown fences, no explanation before or after:
{
"overallScore": <0-100>,
"grade": "Excellent" or "Strong" or "Moderate" or "Needs Work" or "Critical",
"verdict": "<One specific sentence naming the product, its key opportunity, and its biggest risk>",
"realTimeInsight": "<One real market fact with actual numbers>",
"dimensions": {"marketSize":<0-100>,"audienceQuality":<0-100>,"competitionEdge":<0-100>,"revenuePotential":<0-100>,"riskProfile":<0-100>,"sectorFit":<0-100>},
"tamCrore": <realistic TAM in ₹Crore>,
"samCrore": <serviceable portion>,
"somCrore": <3-year realistic target>,
"growthRate": <real CAGR %>,
"competitorProfiles": [
  {"name":"<REAL company 1>","stage":"<funding/size>","strength":"<real strength>","weakness":"<real gap>","marketSharePct":<realistic %>},
  {"name":"<REAL company 2>","stage":"<funding/size>","strength":"<real strength>","weakness":"<real gap>","marketSharePct":<realistic %>},
  {"name":"<REAL company 3>","stage":"<funding/size>","strength":"<real strength>","weakness":"<real gap>","marketSharePct":<realistic %>}
],
"marketShare": [
  {"name":"<product>","pct":<1-10>,"val":"₹<somCrore>Cr"},
  {"name":"<real comp 1>","pct":<their share %>,"val":"₹<amount>Cr"},
  {"name":"<real comp 2>","pct":<their share %>,"val":"₹<amount>Cr"},
  {"name":"<real comp 3>","pct":<their share %>,"val":"₹<amount>Cr"},
  {"name":"Others","pct":<remainder>,"val":"—"}
],
"revenueByRegion": {
  "labels": [<5-6 real cities relevant to the sector>],
  "currentMarket": [<real ₹Cr market size per city>],
  "projected2027": [<apply growthRate CAGR>],
  "ourTarget": [<realistic 2-8% of each city market>]
},
"competitorRadar": [
  {"name":"<product>","scores":{"pricingPower":<0-100>,"distribution":<0-100>,"brandValue":<0-100>,"innovation":<0-100>,"marketReach":<0-100>,"customerSat":<0-100>},"avg":"<average>"},
  {"name":"<comp 1>","scores":{"pricingPower":<n>,"distribution":<n>,"brandValue":<n>,"innovation":<n>,"marketReach":<n>,"customerSat":<n>},"avg":"<average>"},
  {"name":"<comp 2>","scores":{"pricingPower":<n>,"distribution":<n>,"brandValue":<n>,"innovation":<n>,"marketReach":<n>,"customerSat":<n>},"avg":"<average>"},
  {"name":"<comp 3>","scores":{"pricingPower":<n>,"distribution":<n>,"brandValue":<n>,"innovation":<n>,"marketReach":<n>,"customerSat":<n>},"avg":"<average>"}
],
"trendData": {
  "months": ["Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar"],
  "series": [
    {"label":"<product>","dash":[],"data":[<12 monthly values 0-1% to 3-8%>]},
    {"label":"<comp 1>","dash":[],"data":[<12 monthly values ~20-35%>]},
    {"label":"<comp 2>","dash":[],"data":[<12 monthly values ~15-25%>]},
    {"label":"<comp 3>","dash":[],"data":[<12 monthly values ~10-20%>]}
  ]
},
"geoRegions": {
  "Asia Pacific": {"rev":"<global sector size>","pct":"<% of global TAM>","ids":[4,50,156,356,360,392,410,458,702,704,764]},
  "North America": {"rev":"<global sector size>","pct":"<% of global TAM>","ids":[124,484,840]},
  "South America": {"rev":"<global sector size>","pct":"<% of global TAM>","ids":[32,68,76,152,170]},
  "Europe": {"rev":"<global sector size>","pct":"<% of global TAM>","ids":[276,250,826,380,724,528,208,752,756,616]},
  "Africa": {"rev":"<global sector size>","pct":"<% of global TAM>","ids":[566,710,404,818,12]}
},
"keyInsights": ["<insight 1 with numbers>","<insight 2>","<insight 3>","<insight 4>","<90-day action>"],
"topRisks": ["<risk 1>","<risk 2>","<risk 3>"],
"quickWins": ["<win 1>","<win 2>","<win 3>"],
"popups": {
  "mktshare": "<2 sentences: TAM/SAM/SOM + competitor context>",
  "revregion": "<2 sentences: priority cities and why>",
  "radar": "<2 sentences: where product leads and trails>",
  "trend": "<2 sentences: trajectory and inflection point>",
  "geomap": "<2 sentences: geographic focus rationale>"
}
}`;

  const resp = await fetch("/api", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ _type: "analysis", prompt }),
  });

  if (!resp.ok) throw new Error("API error " + resp.status);

  const data = await resp.json();

  // Support both Gemini native format and Anthropic-style wrapper
  const allText = (data?.candidates?.[0]?.content?.parts || [])
    .map((p) => p.text || "")
    .join("") || (data?.content?.[0]?.text || "");

  if (!allText) throw new Error("Empty API response");

  let raw = allText.trim();
  const fm = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fm) raw = fm[1].trim();

  const s0 = raw.indexOf("{"), e0 = raw.lastIndexOf("}");
  if (s0 === -1 || e0 === -1) throw new Error("No JSON in response");
  raw = raw.slice(s0, e0 + 1);

  return JSON.parse(raw);
}
