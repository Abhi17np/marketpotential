// src/pages/AssessmentAndDashboard.jsx
import { useEffect, useRef } from "react";
import { generateAnalysis } from "../lib/gemini";
import { exportPdf } from "../lib/exportPdf";

// Maps React onboarding userData → dashboard.html iframe field codes
function buildPrefill(userData) {
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
    "Other / General":               "OT",
  };

  const BIZ_TYPE_MAP = {
    "B2B (Business to Business)": "B2B_SME",
    "B2C (Business to Consumer)": "B2C_MASS",
    "B2B2C":                      "B2B_SME",
    "D2C (Direct to Consumer)":   "B2C_MASS",
    "Marketplace":                "B2B_SME",
    "SaaS / Platform":            "B2B_SME",
    "Other":                      "B2B_SME",
  };

  return {
    organization: userData.organization,
    bizName:      userData.productName   || userData.organization,
    sectorCode:   SECTOR_MAP[userData.sector]       || "OT",
    bizTypeCode:  BIZ_TYPE_MAP[userData.businessType] || "B2B_SME",
    geoCode:      userData.geography     || "PI",
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

// ── onResult(answers, result) is called by App.jsx to save to Supabase
export default function AssessmentAndDashboard({ userData, onResult, onRestart }) {
  const iframeRef       = useRef(null);
  const prefillSentRef  = useRef(false);
  const latestResultRef = useRef(null);
  const latestFdRef     = useRef(null);

  function postToIframe(msg) {
    iframeRef.current?.contentWindow?.postMessage(msg, "*");
  }

  async function handleSubmit(fd) {
    latestFdRef.current = fd;

    // Drive loader steps
    for (const s of LOADER_STEPS) {
      postToIframe({ type: "INFOPACE_LOADER_STEP", step: s.n, msg: s.msg, pct: s.pct });
      await new Promise(r => setTimeout(r, s.n === 3 ? 150 : 300));
    }

    try {
      const result = await generateAnalysis(userData, fd.answers || {});
      latestResultRef.current = result;

      // ── Save result to Supabase via App.jsx callback ──────────
      if (onResult) {
        onResult(fd.answers || {}, result);
      }

      // Render dashboard in iframe
      postToIframe({ type: "INFOPACE_RENDER", fd, analysis: result });

    } catch (err) {
      console.error("Analysis failed:", err);
      postToIframe({ type: "INFOPACE_LOADER_STEP", step: 5, msg: "Running offline analysis…", pct: 95 });
      setTimeout(() => {
        const fallbackResult = {};
        // Still try to save even on fallback
        if (onResult) {
          onResult(fd.answers || {}, fallbackResult);
        }
        postToIframe({ type: "INFOPACE_RENDER", fd, analysis: fallbackResult });
      }, 800);
    }
  }

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

      if (event.data.type === "INFOPACE_EXPORT_PDF") {
        handleExportPdf();
      }

      if (event.data.type === "INFOPACE_RESET") {
        onRestart();
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [userData]);

  function handleExportPdf() {
    exportPdf({
      userData,
      answers: latestFdRef.current?.answers || {},
      result:  latestResultRef.current || {},
      iframeEl: iframeRef.current,   
    });
  }

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
