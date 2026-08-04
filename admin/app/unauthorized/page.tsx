import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Unauthorized</h1>
        <p>
          Your account is signed in but is not an active Live Ops operator.
          Access requires one or more rows in <code>operator_roles</code> with{" "}
          <code>active = true</code>.
        </p>
        <p>
          RLS denies non-operators. Contact an administrator if you need access.
        </p>
        <p>
          <Link href="/login">Back to login</Link>
        </p>
      </div>
    </div>
  );
}
