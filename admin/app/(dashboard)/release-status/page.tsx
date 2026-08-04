import { EmptyState, PageHeader } from "@/components/DashboardShell";

export default function ReleaseStatusPage() {
  return (
    <>
      <PageHeader
        title="Release Status"
        description="Min version, maintenance, and channel readiness."
      />
      <section className="panel">
        <h2>Channels</h2>
        <EmptyState message="Unavailable — release status has not been loaded." />
      </section>
    </>
  );
}
