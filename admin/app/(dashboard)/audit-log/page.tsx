import { EmptyState, PageHeader } from "@/components/DashboardShell";

export default function AuditLogPage() {
  return (
    <>
      <PageHeader
        title="Audit Log"
        description="Operator actions recorded in operator_audit_log."
      />
      <section className="panel">
        <h2>Recent actions</h2>
        <EmptyState message="Empty — no audit entries loaded." />
      </section>
    </>
  );
}
