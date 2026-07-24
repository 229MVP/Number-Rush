import { requireOperator } from "@/lib/auth/requireOperator";
import {
  DashboardShell,
  EmptyState,
  PageHeader,
} from "@/components/DashboardShell";

export default async function OverviewPage() {
  await requireOperator();

  return (
    <DashboardShell currentPath="/">
      <PageHeader
        title="Overview"
        description="Live Ops control surface. Metrics stay empty until connected backends respond."
      />
      <section className="panel">
        <h2>Aggregates</h2>
        <EmptyState message="Unavailable — no overview aggregates loaded. Connect the liveops-admin Edge Function or operator RPCs when ready." />
      </section>
      <section className="panel">
        <h2>Health</h2>
        <EmptyState message="Empty — release health and incident signals are not wired in this shell." />
      </section>
    </DashboardShell>
  );
}
