import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://hjpvfrldnmgohbkjhzsa.supabase.co"; // cambia esto
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqcHZmcmxkbm1nb2hia2poenNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwODkwNDMsImV4cCI6MjA3NjY2NTA0M30.sTPfyDgGNRdz4J3qI2EETcNC_BQmEHGStZ2_Ng3McEk"; // copia tu anon key desde Supabase → Project Settings → API

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
