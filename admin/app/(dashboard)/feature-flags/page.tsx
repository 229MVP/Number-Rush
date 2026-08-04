import { EmptyState, PageHeader } from "@/components/DashboardShell";

export default function FeatureFlagsPage() {
  return (
    <>
      <PageHeader
        title="Feature Flags"
        description="Client and server feature flag state by environment."
      />
      <section className="panel">
        <h2>Flags</h2>
        <EmptyState message="Unavailable — feature flag source is not wired." />
      </section>
    </>
  );
}
