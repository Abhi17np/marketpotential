import { supabase } from "./supabase";

export async function saveSubmission({ userData, answers, result }) {
  const { data: { user } } = await supabase.auth.getUser();

  const row = {
    user_id:       user?.id              ?? null,
    name:          userData.name         || "",
    email:         userData.email        || "",
    phone:         userData.phone        || "",
    organization:  userData.organization || "",
    role:          userData.role         || "",
    team_size:     userData.teamSize     || "",
    sector:        userData.sector       || "",
    geography:     userData.geography    || "",
    problem:       userData.problem      || "",
    stage:         userData.stage        || "",
    answers:       answers,
    overall_score: result?.overallScore  ?? null,
    grade:         result?.grade         ?? null,
    dimensions:    result?.dimensions    ?? null,
    analysis_json: result,
    screenshot_url: null,   // filled later by handleScreenshot
  };

  const { data, error } = await supabase
    .from("submissions")
    .insert([row])
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return data.id;   // return UUID so we can patch it with screenshot URL
}

export async function uploadScreenshot(pngBlob, filename) {
  const { data, error } = await supabase.storage
    .from("dashboard-screenshots")
    .upload(filename, pngBlob, { contentType: "image/png", upsert: true });

  if (error) throw new Error(error.message);

  const { data: { publicUrl } } = supabase.storage
    .from("dashboard-screenshots")
    .getPublicUrl(data.path);

  return publicUrl;
}

export async function getMySubmissions() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("submissions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}