import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";

export const metadata: Metadata = {
  title: "Sentinel AI — The Safety Operating System for Autonomous AI",
  description:
    "Sentinel AI monitors, secures, audits, and governs AI agent actions before execution. Intercept prompt injection, secrets exposure, and unsafe tool calls in real time.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
