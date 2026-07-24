import { EmptyState, PageHeader } from "@/components/DashboardShell";

export default function AnnouncementsPage() {
  return (
    <>
      <PageHeader
        title="Announcements"
        description="In-game news and published announcements."
      />
      <section className="panel">
        <h2>Published & drafts</h2>
        <EmptyState message="Empty — no announcements loaded." />
      </section>
    </>
  );
}
