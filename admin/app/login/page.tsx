"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setMessage(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage(error.message);
        setPending(false);
        return;
      }

      window.location.href = "/";
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Sign-in failed");
      setPending(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Operator Login</h1>
        <p>
          Number Rush Live Ops. Sign in with an account that has an active{" "}
          <code>operator_roles</code> row.
        </p>
        <form onSubmit={onSubmit}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={pending}>
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>
        {message ? <p className="auth-note">{message}</p> : null}
        <p className="auth-note">
          Uses the anon key only. Service-role keys must never ship to this
          browser app.
        </p>
      </div>
    </div>
  );
}
