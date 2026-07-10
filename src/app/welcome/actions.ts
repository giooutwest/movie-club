"use server";

import { createClient } from "@/lib/supabase/server";

export async function saveDisplayName(name: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const trimmed = name.trim();
  if (trimmed.length < 1) return { error: "Enter a name." };

  const { error } = await supabase
    .from("profiles")
    .update({ display_name: trimmed, onboarded: true })
    .eq("id", user.id);

  if (error) return { error: error.message };
  return { error: null };
}
