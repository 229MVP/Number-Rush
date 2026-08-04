import { EmptyState, PageHeader } from "@/components/DashboardShell";

export default function EventsPage() {
  return (
    <>
      <PageHeader
        title="Events"
        description="Limited-time live events and participation."
      />
      <section className="panel">
        <h2>Live events</h2>
        <EmptyState message="Empty — no live events loaded." />
      </section>
    </>
  );
}
