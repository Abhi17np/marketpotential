import { useEffect, useState } from "react";
import { onAuthChange, signOut } from "./lib/auth";
import AuthPage from "./pages/AuthPage";
import OnboardingForm from "./pages/OnboardingForm";
import AssessmentAndDashboard from "./pages/AssessmentAndDashboard";

export default function App() {
  const [authUser,  setAuthUser]  = useState(undefined); // undefined = loading
  const [userData,  setUserData]  = useState(null);      // onboarding form data
  const [view,      setView]      = useState("auth");    // "auth" | "onboard" | "dashboard"

  // Listen for Supabase auth state changes
  useEffect(() => {
    const { data: { subscription } } = onAuthChange(user => {
      setAuthUser(user);
      if (!user) {
        setView("auth");
        setUserData(null);
      } else if (view === "auth") {
        setView("onboard");
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // ── Loading splash ───────────────────────────────────────────
  if (authUser === undefined) {
    return (
      <div className="min-h-screen bg-[#EEF2F7] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 bg-[#0091DA] rounded-lg flex items-center justify-center font-mono font-bold text-white text-sm">IP</div>
          <div className="text-sm text-[#627289]">Loading…</div>
        </div>
      </div>
    );
  }

  // ── Auth page ────────────────────────────────────────────────
  if (!authUser || view === "auth") {
    return <AuthPage onAuth={user => { setAuthUser(user); setView("onboard"); }} />;
  }

  // ── Onboarding form ──────────────────────────────────────────
  if (view === "onboard" || !userData) {
    return (
      <OnboardingForm
        user={authUser}
        onComplete={data => {
          // Merge auth email into form data
          setUserData({ ...data, email: data.email || authUser.email });
          setView("dashboard");
        }}
      />
    );
  }

  // ── Dashboard ────────────────────────────────────────────────
  return (
    <AssessmentAndDashboard
      userData={userData}
      onRestart={() => {
        setUserData(null);
        setView("onboard");
      }}
    />
  );
}
