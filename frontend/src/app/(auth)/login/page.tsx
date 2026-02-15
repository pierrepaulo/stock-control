"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import type { LoginCredentials } from "@/types/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Package } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const loginSchema = z.object({
  email: z.email("Informe um e-mail valido."),
  password: z.string().min(6, "A senha deve ter ao menos 6 caracteres."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const defaultValues: LoginFormValues = {
  email: "",
  password: "",
};

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [apiError, setApiError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues,
  });

  const handleSubmit = async (values: LoginCredentials) => {
    setApiError(null);

    try {
      await login(values);
      router.replace("/");
    } catch (error) {
      setApiError(
        error instanceof Error
          ? error.message
          : "Nao foi possivel concluir o login."
      );
    }
  };

  return (
    <main className="flex min-h-screen">
      {/* Branding panel — hidden on mobile */}
      <div className="bg-primary hidden flex-col items-center justify-center gap-6 p-12 md:flex md:w-1/2 lg:w-[45%]">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="bg-primary-foreground/10 flex size-16 items-center justify-center rounded-2xl shadow-lg shadow-black/20">
            <Package className="text-primary-foreground size-8" />
          </div>
          <h1 className="text-primary-foreground text-4xl font-bold tracking-tight">
            Stock Control
          </h1>
          <p className="text-primary-foreground/70 max-w-sm text-lg">
            Gerencie seu estoque com precisao. Produtos, categorias, movimentacoes e relatorios em um so lugar.
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="bg-background flex flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="space-y-6 p-8">
            {/* Mobile-only brand header */}
            <div className="flex flex-col items-center gap-3 md:hidden">
              <div className="bg-primary flex size-12 items-center justify-center rounded-xl">
                <Package className="text-primary-foreground size-6" />
              </div>
              <h1 className="text-xl font-bold tracking-tight">Stock Control</h1>
            </div>

            <div className="space-y-1 text-center md:text-left">
              <h2 className="text-2xl font-semibold tracking-tight">Entrar</h2>
              <p className="text-muted-foreground text-sm">
                Entre com suas credenciais para continuar.
              </p>
            </div>

            <form
              className="space-y-4"
              onSubmit={form.handleSubmit((values) => void handleSubmit(values))}
            >
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="voce@empresa.com"
                  {...form.register("email")}
                />
                {form.formState.errors.email?.message ? (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {form.formState.errors.email.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Sua senha"
                  {...form.register("password")}
                />
                {form.formState.errors.password?.message ? (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {form.formState.errors.password.message}
                  </p>
                ) : null}
              </div>

              {apiError ? (
                <div
                  className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400"
                  role="alert"
                >
                  {apiError}
                </div>
              ) : null}

              <Button
                className="w-full"
                type="submit"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
