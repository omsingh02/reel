// Deletes the signed-in user's account. Their rows in watchlist_items, episode_progress,
// hidden_items and profiles go with it (foreign keys cascade from auth.users).
//
// The platform JWT check is off (see config.toml) because it is done here, in code:
//   1. the bearer token is verified by Supabase Auth (getUser), not just decoded;
//   2. tokens issued to connected apps (OAuth clients, e.g. an MCP assistant) are refused,
//      so an app you approved to manage your list can never delete your account.

import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

/** Reads a claim from an already-verified JWT. Never use this to trust a token on its own. */
function claimsOf(jwt: string): Record<string, unknown> {
  try {
    const payload = jwt.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(payload.padEnd(Math.ceil(payload.length / 4) * 4, "=")));
  } catch {
    return {};
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });

  const header = req.headers.get("Authorization") ?? "";
  const jwt = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!jwt) return json(401, { error: "Sign in to delete your account" });

  const url = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !anonKey || !serviceKey) {
    console.error("delete-account: function environment is incomplete");
    return json(500, { error: "The service is not configured" });
  }

  const options = { auth: { persistSession: false, autoRefreshToken: false } };

  const { data, error } = await createClient(url, anonKey, options).auth.getUser(jwt);
  if (error || !data.user) return json(401, { error: "Your session is invalid or has expired" });

  if (claimsOf(jwt).client_id) {
    return json(403, { error: "Connected apps can't delete accounts. Do it from Reel's settings." });
  }

  const { error: deleteError } = await createClient(url, serviceKey, options).auth.admin.deleteUser(data.user.id);
  if (deleteError) {
    console.error("delete-account: deleteUser failed:", deleteError.message);
    return json(500, { error: "We couldn't delete the account. Please try again." });
  }

  return json(200, { deleted: true });
});
