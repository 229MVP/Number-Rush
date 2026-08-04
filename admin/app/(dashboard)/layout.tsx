import type { ReactNode } from "react";
import { requireOperator } from "@/lib/auth/requireOperator";
import { DashboardShell } from "@/components/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireOperator();
  return <DashboardShell>{children}</DashboardShell>;
}
