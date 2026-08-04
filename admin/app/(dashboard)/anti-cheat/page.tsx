import { EmptyState, PageHeader } from "@/components/DashboardShell";

export default function AntiCheatPage() {
  return (
    <>
      <PageHeader
        title="Anti-Cheat"
        description="Run validation reviews and flagged sessions."
      />
      <section className="panel">
        <h2>Review queue</h2>
        <EmptyState message="Unavailable — anti-cheat review data is not connected." />
      </section>
    </>
  );
}
