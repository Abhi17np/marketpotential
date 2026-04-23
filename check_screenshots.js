// Quick script to check which submissions have screenshots saved
const { createClient } = require("@supabase/supabase-js");

const s = createClient(
  "https://ptncbweomagroosudqmf.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0bmNid2VvbWFncm9vc3VkcW1mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0MzM1MjgsImV4cCI6MjA5MDAwOTUyOH0.CKdzxHzh5INOXGRgDo8jwsfd9BIgIo3EXUARzkKai88"
);

(async () => {
  const { data, error } = await s
    .from("submissions")
    .select("id, name, email, organization, screenshot_url, status, created_at")
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    console.log("Error:", error.message);
    return;
  }

  console.log("Found " + data.length + " submissions:\n");
  data.forEach((r, i) => {
    console.log("--- Row " + (i + 1) + " ---");
    console.log("  ID:         " + r.id);
    console.log("  Name:       " + r.name);
    console.log("  Email:      " + r.email);
    console.log("  Org:        " + (r.organization || "-"));
    console.log("  Status:     " + r.status);
    console.log("  Created:    " + r.created_at);
    console.log("  Screenshot: " + (r.screenshot_url ? "YES (" + r.screenshot_url.length + " chars)" : "NULL"));
    console.log("");
  });
})();
