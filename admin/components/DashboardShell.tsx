import Link from "next/link";
import type { ReactNode } from "react";

const NAV = [
  { href: "/", label: "Overview" },
  { href: "/remote-config", label: "Remote Config" },
  { href: "/seasons", label: "Seasons" },
  { href: "/events", label: "Events" },
  { href: "/announcements", label: "Announcements" },
  { href: "/leaderboards", label: "Leaderboards" },
  { href: "/anti-cheat", label: "Anti-Cheat" },
  { href: "/player-support", label: "Player Support" },
  { href: "/economy", label: "Economy" },
  { href: "/feature-flags", label: "Feature Flags" },
  { href: "/release-status", label: "Release Status" },
  { href: "/audit-log", label: "Audit Log" },
] as const;

export function DashboardShell({
  children,
  currentPath,
}: {
  children: ReactNode;
  currentPath?: string;
}) {
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          Number Rush
          <span>Live Ops Admin</span>
        </div>
        <nav className="nav" aria-label="Primary">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={currentPath === item.href ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="main">{children}</div>
    </div>
  );
}

export function PageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <header className="page-header">
      <h1>{title}</h1>
      {description ? <p>{description}</p> : null}
      <div className="badge">Authorized operators only</div>
    </header>
  );
}

export function EmptyState({ message }: { message: string }) {
  return <div className="empty-state">{message}</div>;
}
