import { useState, useRef } from "react";
import OnboardingForm from "./pages/OnboardingForm";
import AssessmentAndDashboard from "./pages/AssessmentAndDashboard";
import { saveOnboarding, saveResult } from "./lib/db";

// ── Flow:
//   1. User fills OnboardingForm → onComplete(userData) fires
//      → saveOnboarding() inserts row into Supabase, returns submissionId
//   2. User completes dashboard questions → AI generates result
//      → AssessmentAndDashboard calls onResult(answers, result)
//      → saveResult() updates the same row with scores + analysis
// ──────────────────────────────────────────────────────────────────

export default function App() {
  const [userData, setUserData]       = useState(null);
  const submissionIdRef               = useRef(null); // holds Supabase row UUID

  // ── Called when onboarding form is submitted ──────────────────
  async function handleOnboardingComplete(formData) {
    setUserData(formData);

    // Save to Supabase immediately — non-blocking
    const id = await saveOnboarding(formData);
    submissionIdRef.current = id; // store for phase 2
  }

  // ── Called when AI analysis completes inside the dashboard ────
  async function handleResult(answers, result) {
    // Fire-and-forget — don't block the UI
    saveResult(submissionIdRef.current, answers, result).catch(e =>
      console.warn("DB result save failed:", e.message)
    );
  }

  function handleRestart() {
    setUserData(null);
    submissionIdRef.current = null;
  }

  if (userData) {
    return (
      <AssessmentAndDashboard
        userData={userData}
        onResult={handleResult}
        onRestart={handleRestart}
      />
    );
  }

  return <OnboardingForm onComplete={handleOnboardingComplete} user={null} />;
}