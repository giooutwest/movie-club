import { createClient } from "@/lib/supabase/server";
import { NavBar } from "./nav-bar";
import { ReelFab } from "./reel-fab";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let displayName: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .single();
    displayName = profile?.display_name ?? null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <NavBar displayName={displayName} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6">
        {children}
      </main>
      <ReelFab />
    </div>
  );
}
