"use server";

import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

// Derives a stable, never-shown password from the email + a server-only
// secret, so the same email always logs into the same account without
// ever sending a verification email or asking for a real password.
function derivePassword(email: string) {
  return crypto
    .createHmac("sha256", process.env.AUTH_PEPPER!)
    .update(email)
    .digest("hex");
}

export async function simpleLogin(rawEmail: string, rawName: string) {
  const email = rawEmail.trim().toLowerCase();
  const name = rawName.trim();
  if (!email) return { error: "Enter your email." };
  if (!name) return { error: "Enter your name." };

  const password = derivePassword(email);
  const admin = createAdminClient();

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: name },
  });

  let userId = created?.user?.id;

  if (createError) {
    const alreadyExists = /already.*registered|already.*exists/i.test(
      createError.message
    );
    if (!alreadyExists) return { error: createError.message };

    const { data: list, error: listError } = await admin.auth.admin.listUsers({
      perPage: 1000,
    });
    if (listError) return { error: listError.message };
    userId = list.users.find((u) => u.email === email)?.id;
    if (!userId) return { error: "Could not find your account." };

    // Keep the derived password authoritative in case it ever drifts.
    await admin.auth.admin.updateUserById(userId, { password });
  }

  if (userId) {
    await admin
      .from("profiles")
      .update({ display_name: name, onboarded: true })
      .eq("id", userId);

    // Auto-join the club -- no separate invite step anymore.
    await admin.from("club_members").upsert({ profile_id: userId, active: true });
  }

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (signInError) return { error: signInError.message };

  return { error: null };
}
