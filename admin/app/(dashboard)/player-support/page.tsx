import { EmptyState, PageHeader } from "@/components/DashboardShell";

export default function PlayerSupportPage() {
  return (
    <>
      <PageHeader
        title="Player Support"
        description="Support lookups, reports, and account assistance tools."
      />
      <section className="panel">
        <h2>Open cases</h2>
        <EmptyState message="Empty — no support cases loaded." />
      </section>
    </>
  );
}
