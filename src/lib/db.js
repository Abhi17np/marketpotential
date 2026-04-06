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

// ── Phase 3: Upload screenshot blob to Supabase Storage ──────────
// Returns the public URL of the uploaded image, or null on failure
export async function uploadScreenshot(submissionId, blob) {
  if (!submissionId || !blob) return null;

  try {
    const fileName  = `${submissionId}.png`;
    const filePath  = `screenshots/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("dashboard-screenshots")   // bucket name
      .upload(filePath, blob, {
        contentType:  "image/png",
        upsert:       true,            // overwrite if re-run
      });

    if (uploadError) {
      console.error("❌ Screenshot upload error:", uploadError.message);
      return null;
    }

    // Get the public URL
    const { data } = supabase.storage
      .from("dashboard-screenshots")
      .getPublicUrl(filePath);

    const publicUrl = data?.publicUrl ?? null;
    console.log("✅ Screenshot uploaded:", publicUrl);
    return publicUrl;

  } catch (err) {
    console.error("❌ uploadScreenshot exception:", err.message);
    return null;
  }
}

// ── Phase 3b: Save the screenshot URL back to the submissions row ─
export async function saveScreenshotUrl(submissionId, screenshotUrl) {
  if (!submissionId || !screenshotUrl) return;
  try {
    const { error } = await supabase
      .from("submissions")
      .update({ screenshot_url: screenshotUrl })
      .eq("id", submissionId);

    if (error) console.error("❌ saveScreenshotUrl error:", error.message);
    else        console.log("✅ Screenshot URL saved for:", submissionId);
  } catch (err) {
    console.error("❌ saveScreenshotUrl exception:", err.message);
  }
}

// ── Legacy export (keeps old references working) ──────────────────
export async function saveSubmission({ userData, answers, result }) {
  const id = await saveOnboarding(userData);
  if (id) await saveResult(id, answers, result);
}