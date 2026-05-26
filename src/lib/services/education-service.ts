import { supabase } from "@/lib/supabase/client";

export async function getRegions() {
  return supabase
    .from("regions")
    .select("*")
    .order("name");
}

export async function getSchools() {
  return supabase
    .from("schools")
    .select("*")
    .order("name");
}
