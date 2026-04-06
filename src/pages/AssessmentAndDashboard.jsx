// src/pages/AssessmentAndDashboard.jsx
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useCallback } from "react";
import { generateAnalysis } from "../lib/gemini";
import { exportPdf } from "../lib/exportPdf";
import { uploadScreenshot, saveScreenshotUrl } from "../lib/db";

const IFRAME_ORIGIN = window.location.origin;

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

function buildPrefill(userData) {
  return {
    organization: userData.organization ?? "",
    bizName:      userData.productName  || userData.organization || "",
    sectorCode:   SECTOR_MAP[userData.sector]         ?? "OT",
    bizTypeCode:  BIZ_TYPE_MAP[userData.businessType] ?? "B2B_SME",
    geoCode:      userData.geography ?? "PI",
    problem:      userData.problem   ?? "",
    stage:        userData.stage     ?? "",
  };
}

const LOADER_STEPS = [
  { n: 1, msg: "Reading your inputs…",                                    pct: 8  },
  { n: 2, msg: "Searching live market data & sector sizing…",             pct: 25 },
  { n: 3, msg: "Fetching real-time competitor profiles & funding data…",  pct: 48 },
  { n: 4, msg: "Calculating TAM/SAM/SOM, scores & 12-month projections…", pct: 75 },
  { n: 5, msg: "Assembling your market intelligence dashboard…",          pct: 95 },
];

// ── Load html2canvas from CDN once ────────────────────────────────
function loadHtml2Canvas() {
  return new Promise((resolve, reject) => {
    if (window.html2canvas) { resolve(window.html2canvas); return; }
    const script  = document.createElement("script");
    script.src    = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
    script.onload = () => resolve(window.html2canvas);
    script.onerror = () => reject(new Error("html2canvas failed to load"));
    document.head.appendChild(script);
  });
}

// ── Take a screenshot of the iframe's visible content ────────────
async function screenshotIframe(iframeEl) {
  try {
    const html2canvas = await loadHtml2Canvas();

    // Try to capture the iframe's inner document directly
    const iframeDoc = iframeEl.contentDocument || iframeEl.contentWindow?.document;

    let canvas;
    if (iframeDoc) {
      // Capture the dashboard section inside the iframe
      const dashShell = iframeDoc.getElementById("dashShell") || iframeDoc.body;
      canvas = await html2canvas(dashShell, {
        useCORS:        true,
        allowTaint:     true,
        scale:          1.5,          // higher resolution
        backgroundColor: "#EEF2F7",
        logging:        false,
        width:          iframeDoc.body.scrollWidth,
        height:         Math.min(iframeDoc.body.scrollHeight, 4000), // cap at 4000px
        windowWidth:    iframeDoc.body.scrollWidth,
        windowHeight:   iframeDoc.body.scrollHeight,
      });
    } else {
      // Fallback: capture the iframe element itself from parent
      canvas = await html2canvas(iframeEl, {
        useCORS:        true,
        allowTaint:     true,
        scale:          1.5,
        backgroundColor: "#EEF2F7",
        logging:        false,
      });
    }

    // Convert canvas to PNG blob
    return new Promise(resolve => {
      canvas.toBlob(blob => resolve(blob), "image/png", 0.92);
    });

  } catch (err) {
    console.error("❌ Screenshot capture failed:", err.message);
    return null;
  }
}

export default function AssessmentAndDashboard({ userData, onResult, onRestart }) {
  const iframeRef       = useRef(null);
  const prefillSentRef  = useRef(false);
  const latestResultRef = useRef(null);
  const latestFdRef     = useRef(null);
  const onResultRef     = useRef(onResult);
  const onRestartRef    = useRef(onRestart);
  const userDataRef     = useRef(userData);
  const submissionIdRef = useRef(null); // passed in via onResult callback from App.jsx

  useEffect(() => { onResultRef.current  = onResult;  }, [onResult]);
  useEffect(() => { onRestartRef.current = onRestart; }, [onRestart]);
  useEffect(() => { userDataRef.current  = userData;  }, [userData]);

  const postToIframe = useCallback((msg) => {
    iframeRef.current?.contentWindow?.postMessage(msg, IFRAME_ORIGIN);
  }, []);

  // ── After dashboard renders, wait briefly then screenshot ─────
  const takeAndSaveScreenshot = useCallback(async (submissionId) => {
    if (!submissionId) return;

    // Wait for charts/maps to fully render inside the iframe
    await new Promise(r => setTimeout(r, 3500));

    console.log("📸 Taking dashboard screenshot…");
    const blob = await screenshotIframe(iframeRef.current);

    if (!blob) {
      console.warn("⚠️ Screenshot blob is null — skipping upload.");
      return;
    }

    const url = await uploadScreenshot(submissionId, blob);
    if (url) {
      await saveScreenshotUrl(submissionId, url);
      console.log("✅ Screenshot saved to Supabase:", url);
    }
  }, []);

  const handleSubmit = useCallback(async (fd) => {
    latestFdRef.current = fd;

    for (const s of LOADER_STEPS) {
      postToIframe({ type: "INFOPACE_LOADER_STEP", step: s.n, msg: s.msg, pct: s.pct });
      await new Promise(r => setTimeout(r, s.n === 3 ? 150 : 300));
    }

    try {
      const result = await generateAnalysis(userDataRef.current, fd.answers ?? {});
      latestResultRef.current = result;

      // ── Save result + get submissionId back from App.jsx ──────
      const submissionId = await onResultRef.current?.(fd.answers ?? {}, result);
      submissionIdRef.current = submissionId;

      postToIframe({ type: "INFOPACE_RENDER", fd, analysis: result });

      // ── Take screenshot after dashboard renders ───────────────
      // We wait for the iframe to finish rendering before capturing
      takeAndSaveScreenshot(submissionId);

    } catch (err) {
      console.error("Analysis failed:", err);
      postToIframe({
        type: "INFOPACE_LOADER_STEP",
        step: 5,
        msg:  "Running offline analysis…",
        pct:  95,
      });
      setTimeout(async () => {
        const submissionId = await onResultRef.current?.(fd.answers ?? {}, {});
        postToIframe({ type: "INFOPACE_RENDER", fd, analysis: {} });
        takeAndSaveScreenshot(submissionId);
      }, 800);
    }
  }, [postToIframe, takeAndSaveScreenshot]);

  const handleExportPdf = useCallback(() => {
    exportPdf({
      userData: userDataRef.current,
      answers:  latestFdRef.current?.answers ?? {},
      result:   latestResultRef.current      ?? {},
    });
  }, []);

  useEffect(() => {
    function handleMessage(event) {
      if (event.origin !== IFRAME_ORIGIN) return;
      if (!event.data?.type) return;

      switch (event.data.type) {
        case "INFOPACE_LOADED":
          if (!prefillSentRef.current) {
            prefillSentRef.current = true;
            postToIframe({
              type:     "INFOPACE_PREFILL",
              userData: buildPrefill(userDataRef.current),
            });
          }
          break;
        case "INFOPACE_SUBMIT":
          handleSubmit(event.data.fd);
          break;
        case "INFOPACE_EXPORT_PDF":
          handleExportPdf();
          break;
        case "INFOPACE_RESET":
          onRestartRef.current?.();
          break;
        default:
          break;
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [handleSubmit, handleExportPdf, postToIframe]);

  return (
    <iframe
      ref={iframeRef}
      src="/dashboard.html"
      style={{
        position: "fixed",
        inset:    0,
        border:   "none",
        width:    "100%",
        height:   "100%",
      }}
      title="Infopace Assessment"
      sandbox="allow-scripts allow-same-origin allow-popups allow-downloads"
    />
  );
}