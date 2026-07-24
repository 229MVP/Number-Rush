import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type OperatorRole =
  | "support_agent"
  | "moderator"
  | "liveops_manager"
  | "economy_manager"
  | "release_manager"
  | "administrator";

export type OperatorContext = {
  userId: string;
  email: string | undefined;
  roles: OperatorRole[];
};

/**
 * Ensures the current session belongs to an active Live Ops operator.
 *
 * Checks `operator_roles` via:
 * 1. Optional RPC `is_liveops_operator` (preferred when present)
 * 2. Direct table select on `public.operator_roles`
 *
 * RLS / grants: non-operators are denied. Even authenticated players cannot
 * read `operator_roles` under Live Ops RLS (`REVOKE ALL` + no SELECT policy).
 * Operators need either an operator-scoped SELECT policy or a SECURITY DEFINER
 * RPC / Edge Function to pass this gate. Empty results → treat as unauthorized.
 */
export async function requireOperator(): Promise<OperatorContext> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Preferred path when a public RPC exists.
  const { data: rpcOk, error: rpcError } = await supabase.rpc(
    "is_liveops_operator",
  );

  if (!rpcError) {
    if (rpcOk !== true) {
      redirect("/unauthorized");
    }

    const { data: roleRows } = await supabase
      .from("operator_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("active", true);

    return {
      userId: user.id,
      email: user.email,
      roles: (roleRows ?? []).map((r) => r.role as OperatorRole),
    };
  }

  // Fallback: table select. RLS denies non-operators (and may deny all
  // clients until an operator policy or RPC is deployed).
  const { data: rows, error } = await supabase
    .from("operator_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("active", true);

  if (error || !rows || rows.length === 0) {
    redirect("/unauthorized");
  }

  return {
    userId: user.id,
    email: user.email,
    roles: rows.map((r) => r.role as OperatorRole),
  };
}
