"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export default function DashboardHomePage() {
  const { logout, user } = useAuth();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-4 py-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-zinc-900">Stock Control</h1>
        <p className="text-sm text-zinc-600">
          Sessao ativa para <strong>{user?.name}</strong> ({user?.email}).
        </p>
      </header>

      <section className="rounded-lg border border-zinc-200 bg-white p-4">
        <p className="text-sm text-zinc-700">teste teste teste</p>
      </section>

      <div>
        <Button type="button" variant="outline" onClick={() => void logout()}>
          Sair
        </Button>
      </div>
    </main>
  );
}
