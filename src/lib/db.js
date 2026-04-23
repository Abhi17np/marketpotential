// src/lib/db.js
import { supabase } from "./supabase";

// ── Phase 1: Save onboarding form immediately after submit ────────
export async function saveOnboarding(userData) {
  try {
    const { data, error } = await supabase
      .from("submissions")
      .insert([{
        name:          userData.name,
        email:         userData.email,
        phone:         userData.phone         || null,
        phone_full:    userData.phoneFull     || null,
        country_code:  userData.countryCode   || null,
        organization:  userData.organization  || null,
        role:          userData.role          || null,
        website:       userData.website       || null,
        linkedin:      userData.linkedin      || null,
        team_size:     userData.teamSize      || null,
        product_name:  userData.productName   || null,
        business_type: userData.businessType  || null,
        sector:        userData.sector        || null,
        geography:     userData.geography     || null,
        problem:       userData.problem       || null,
        stage:         userData.stage         || null,
        status:        "onboarding_complete",
      }])
      .select("id")
      .single();

    if (error) {
      console.error("❌ saveOnboarding error:", error.message);
      return null;
    }
    console.log("✅ Onboarding saved — ID:", data.id);
    return data.id;
  } catch (err) {
    console.error("❌ saveOnboarding exception:", err.message);
    return null;
  }
}

// ── Phase 2: Save AI analysis result ─────────────────────────────
export async function saveResult(submissionId, answers, result) {
  if (!submissionId) {
    console.warn("⚠️ saveResult: no submissionId, skipping.");
    return;
  }
  try {
    const { error } = await supabase
      .from("submissions")
      .update({
        answers,
        overall_score: result?.overallScore ?? null,
        grade:         result?.grade        ?? null,
        verdict:       result?.verdict      ?? null,
        tam_crore:     result?.tamCrore     ?? null,
        sam_crore:     result?.samCrore     ?? null,
        som_crore:     result?.somCrore     ?? null,
        growth_rate:   result?.growthRate   ?? null,
        dimensions:    result?.dimensions   ?? null,
        key_insights:  result?.keyInsights  ?? null,
        top_risks:     result?.topRisks     ?? null,
        quick_wins:    result?.quickWins    ?? null,
        analysis_json: result              ?? null,
        status:        "assessment_complete",
      })
      .eq("id", submissionId);

    if (error) console.error("❌ saveResult error:", error.message);
    else        console.log("✅ Result saved — ID:", submissionId);
  } catch (err) {
    console.error("❌ saveResult exception:", err.message);
  }
}

// ── Phase 3: Save screenshot as base64 data URL directly in DB ───
// Stores the image inline in the screenshot_url column (text type).
// This avoids needing a Supabase Storage bucket.
export async function saveScreenshotDataUrl(submissionId, dataUrl) {
  if (!submissionId || !dataUrl) {
    console.warn("⚠️ saveScreenshotDataUrl: missing id or dataUrl");
    return;
  }
  try {
    const { error } = await supabase
      .from("submissions")
      .update({ screenshot_url: dataUrl })
      .eq("id", submissionId);

    if (error) {
      console.error("❌ saveScreenshotDataUrl error:", error.message);
    } else {
      console.log("✅ Screenshot saved for:", submissionId, "(length:", dataUrl.length, "chars)");
    }
  } catch (err) {
    console.error("❌ saveScreenshotDataUrl exception:", err.message);
  }
}

// ── Legacy export (keeps old references working) ──────────────────
export async function saveSubmission({ userData, answers, result }) {
  const id = await saveOnboarding(userData);
  if (id) await saveResult(id, answers, result);
}