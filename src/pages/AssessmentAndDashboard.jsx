import { useEffect, useRef } from "react";
import { generateAnalysis } from "../lib/gemini";
import { saveSubmission, uploadScreenshot } from "../lib/db";
import { supabase } from "../lib/supabase";

// ── Sector / role maps ────────────────────────────────────────
const SECTOR_MAP = {
  "Information Technology / SaaS": "IT",
  "Healthcare & Pharma":           "HC",
  "Financial Services / FinTech":  "FS",
  "E-Commerce & Retail":           "EC",
  "Education & EdTech":            "ED",
  "Manufacturing":                 "MF",
  "Real Estate & PropTech":        "RE",
  "Logistics & Supply Chain":      "LG",
  "Media & Entertainment":         "ME",
  "Agriculture & AgroTech":        "AG",
  "Energy & CleanTech":            "EN",
};
const ROLE_BIZ_MAP = {
  "Founder / Co-Founder": "B2B_SME",
  "CEO / MD":             "B2B_ENT",
  "CTO / CPO":            "B2B_SME",
  "CMO / VP Marketing":   "B2C_MASS",
  "Business Development": "B2B_SME",
  "Product Manager":      "B2B_SME",
  "Investor / VC":        "B2B_ENT",
  "Consultant / Advisor": "B2B_SME",
  "Other":                "B2B_SME",
};

function buildPrefill(userData) {
  return {
    organization: userData.organization,
    sectorCode:   SECTOR_MAP[userData.sector]  || "IT",
    bizTypeCode:  ROLE_BIZ_MAP[userData.role]  || "B2B_SME",
    geoCode:      userData.geography           || "PI",
    problem:      userData.problem,
    stage:        userData.stage,
  };
}

const LOADER_STEPS = [
  { n: 1, msg: "Reading your inputs…",                                    pct: 8  },
  { n: 2, msg: "Searching live market data & sector sizing…",             pct: 25 },
  { n: 3, msg: "Fetching real-time competitor profiles & funding data…",  pct: 48 },
  { n: 4, msg: "Calculating TAM/SAM/SOM, scores & 12-month projections…", pct: 75 },
  { n: 5, msg: "Assembling your market intelligence dashboard…",          pct: 95 },
];

export default function AssessmentAndDashboard({ userData, onRestart }) {
  // ── Refs (all inside the component) ────────────────────────
  const iframeRef       = useRef(null);
  const prefillSentRef  = useRef(false);
  const latestResultRef = useRef(null);
  const latestFdRef     = useRef(null);
  const submissionIdRef = useRef(null);   // stores UUID of saved row for screenshot patch

  // ── Post to iframe ─────────────────────────────────────────
  function postToIframe(msg) {
    iframeRef.current?.contentWindow?.postMessage(msg, "*");
  }

  // ── Analysis + save ────────────────────────────────────────
  async function handleSubmit(fd) {
    latestFdRef.current = fd;

    for (const s of LOADER_STEPS) {
      postToIframe({ type: "INFOPACE_LOADER_STEP", step: s.n, msg: s.msg, pct: s.pct });
      await new Promise(r => setTimeout(r, s.n === 3 ? 150 : 300));
    }

    try {
      const result = await generateAnalysis(userData, fd.answers || {});
      latestResultRef.current = result;

      // Save submission → get back the row UUID
      const rowId = await saveSubmission({ userData, answers: fd.answers || {}, result });
      submissionIdRef.current = rowId;

      postToIframe({ type: "INFOPACE_RENDER", fd, analysis: result });

    } catch (err) {
      console.error("Analysis failed:", err);
      postToIframe({ type: "INFOPACE_LOADER_STEP", step: 5, msg: "Running offline analysis…", pct: 95 });
      // Still save the offline result
      try {
        const rowId = await saveSubmission({ userData, answers: fd.answers || {}, result: {} });
        submissionIdRef.current = rowId;
      } catch (_) {}
      setTimeout(() => postToIframe({ type: "INFOPACE_RENDER", fd, analysis: {} }), 800);
    }
  }

  // ── Screenshot: upload to Storage + patch submission row ───
  async function handleScreenshot(buffer, filename) {
    try {
      const blob = new Blob([buffer], { type: "image/png" });

      // Upload PNG to Supabase Storage bucket "dashboard-screenshots"
      const screenshotUrl = await uploadScreenshot(blob, filename);

      // Patch the submission row with the URL (if we have the row id)
      if (submissionIdRef.current) {
        await supabase
          .from("submissions")
          .update({ screenshot_url: screenshotUrl })
          .eq("id", submissionIdRef.current);
      }

      console.log("Dashboard screenshot saved:", screenshotUrl);
    } catch (e) {
      console.warn("Screenshot upload failed:", e.message);
    }
  }

  // ── Message listener ────────────────────────────────────────
  useEffect(() => {
    function handleMessage(event) {
      if (!event.data) return;

      if (event.data.type === "INFOPACE_LOADED") {
        if (!prefillSentRef.current) {
          prefillSentRef.current = true;
          postToIframe({ type: "INFOPACE_PREFILL", userData: buildPrefill(userData) });
        }
      }

      if (event.data.type === "INFOPACE_SUBMIT") {
        handleSubmit(event.data.fd);
      }

      // Screenshot blob sent from iframe after dashboard renders
      if (event.data.type === "INFOPACE_SCREENSHOT") {
        handleScreenshot(event.data.buffer, event.data.filename);
      }

      if (event.data.type === "INFOPACE_RESET") {
        onRestart();
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [userData]);

  return (
    <iframe
      ref={iframeRef}
      src="/dashboard.html"
      style={{ position: "fixed", inset: 0, border: "none", width: "100%", height: "100%" }}
      title="Infopace Assessment"
      sandbox="allow-scripts allow-same-origin allow-popups allow-downloads"
    />
  );
}