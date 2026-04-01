import { createClient } from "@supabase/supabase-js";

let adminClient = null;

export function getAdminClient() {
  if (!adminClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl) throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_URL");
    if (!supabaseServiceKey) throw new Error("Missing environment variable: SUPABASE_SERVICE_ROLE_KEY");
    adminClient = createClient(supabaseUrl, supabaseServiceKey);
  }
  return adminClient;
}