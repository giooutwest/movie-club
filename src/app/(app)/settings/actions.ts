"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

export async function inviteMember(email: string) {
  const admin = createAdminClient();

  const { data: created, error: inviteError } =
    await admin.auth.admin.inviteUserByEmail(email);

  if (inviteError && !inviteError.message.includes("already registered")) {
    return { error: inviteError.message };
  }

  let userId = created?.user?.id;
  if (!userId) {
    const { data: list } = await admin.auth.admin.listUsers();
    userId = list.users.find((u) => u.email === email)?.id;
  }
  if (!userId) {
    return { error: "Could not find or create that user." };
  }

  const { error: memberError } = await admin
    .from("club_members")
    .upsert({ profile_id: userId, active: true });

  if (memberError) {
    return { error: memberError.message };
  }

  revalidatePath("/settings");
  return { error: null };
}
