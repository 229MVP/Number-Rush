import { EmptyState, PageHeader } from "@/components/DashboardShell";

export default function EconomyPage() {
  return (
    <>
      <PageHeader
        title="Economy"
        description="Economy config versions and balance knobs."
      />
      <section className="panel">
        <h2>Config versions</h2>
        <EmptyState message="Empty — no economy config versions loaded." />
      </section>
    </>
  );
}
