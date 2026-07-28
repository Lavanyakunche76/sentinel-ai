"use client";

import { Search, Bell, LogOut } from "lucide-react";
import { useAuth } from "@/components/auth-provider";

export function Topbar({ title }: { title: string }) {
  const { user, logout } = useAuth();
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <header
      className="flex items-center justify-between h-16 px-6 border-b shrink-0"
      style={{ borderColor: "var(--border)", background: "var(--bg)" }}
    >
      <h1 className="text-lg font-semibold">{title}</h1>

      <div className="flex items-center gap-3">
        <div
          className="hidden sm:flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm w-64"
          style={{ borderColor: "var(--border-strong)", color: "var(--text-muted)" }}
        >
          <Search size={14} />
          <span>Search actions, agents…</span>
          <kbd className="ml-auto text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>
            ⌘K
          </kbd>
        </div>
        <button
          className="relative h-9 w-9 flex items-center justify-center rounded-lg border"
          style={{ borderColor: "var(--border-strong)" }}
        >
          <Bell size={16} style={{ color: "var(--text-secondary)" }} />
          <span
            className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full"
            style={{ background: "var(--accent-red)" }}
          />
        </button>
        <div className="flex items-center gap-2">
          <div
            className="h-9 w-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
            style={{ background: "var(--accent-blue-dim)", color: "var(--accent-blue)" }}
            title={user ? `${user.name} · ${user.role}` : ""}
          >
            {initials}
          </div>
          <button
            onClick={logout}
            className="h-9 w-9 flex items-center justify-center rounded-lg border"
            style={{ borderColor: "var(--border-strong)" }}
            title="Sign out"
          >
            <LogOut size={14} style={{ color: "var(--text-secondary)" }} />
          </button>
        </div>
      </div>
    </header>
  );
}
