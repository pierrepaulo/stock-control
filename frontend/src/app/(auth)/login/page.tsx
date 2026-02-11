"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import type { LoginCredentials } from "@/types/auth";
import { zodResolver } from "@hookform/resolvers/zod";
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
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-center text-2xl font-semibold">
            Stock Control
          </CardTitle>
          <p className="text-center text-sm text-zinc-600">
            Entre com suas credenciais para continuar.
          </p>
        </CardHeader>
        <CardContent>
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
                <p className="text-sm text-red-600">
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
                <p className="text-sm text-red-600">
                  {form.formState.errors.password.message}
                </p>
              ) : null}
            </div>

            {apiError ? (
              <div
                className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
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
    </main>
  );
}

