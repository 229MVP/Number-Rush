import { EmptyState, PageHeader } from "@/components/DashboardShell";

export default function RemoteConfigPage() {
  return (
    <>
      <PageHeader
        title="Remote Config"
        description="Published and draft remote configuration versions."
      />
      <section className="panel">
        <h2>Versions</h2>
        <EmptyState message="Empty — no remote config versions loaded." />
      </section>
    </>
  );
}
