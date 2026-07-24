import { EmptyState, PageHeader } from "@/components/DashboardShell";

export default function LeaderboardsPage() {
  return (
    <>
      <PageHeader
        title="Leaderboards"
        description="Moderation queue for usernames and leaderboard entries."
      />
      <section className="panel">
        <h2>Moderation queue</h2>
        <EmptyState message="Empty — no leaderboard moderation items." />
      </section>
    </>
  );
}
