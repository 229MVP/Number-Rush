import { EmptyState, PageHeader } from "@/components/DashboardShell";

export default function SeasonsPage() {
  return (
    <>
      <PageHeader
        title="Seasons"
        description="Ranked season schedule, status, and soft-reset controls."
      />
      <section className="panel">
        <h2>Season list</h2>
        <EmptyState message="Empty — no seasons loaded for this environment." />
      </section>
    </>
  );
}
