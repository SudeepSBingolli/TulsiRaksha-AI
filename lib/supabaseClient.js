import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://fnhncmrzxuzzhgbubhyd.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_FuoFBEVa-OmrQ3-5eoQRwA_WtjMiMLm";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
