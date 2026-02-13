"use client";

import { AvatarUpload } from "@/components/users/avatar-upload";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { User } from "@/types/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

const userFormSchema = z.object({
  name: z.string().trim().min(2, "Nome precisa ter ao menos 2 caracteres."),
  email: z.string().trim().email("Formato de e-mail invalido."),
  password: z.string(),
  isAdmin: z.boolean(),
});

interface UserFormValuesBase {
  name: string;
  email: string;
  password: string;
  isAdmin: boolean;
}

export interface UserFormValues extends UserFormValuesBase {
  avatar: File | null;
}

const defaultUserValues: UserFormValuesBase = {
  name: "",
  email: "",
  password: "",
  isAdmin: false,
};

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingUser: User | null;
  isSubmitting: boolean;
  submitError: string | null;
  onSubmit: (values: UserFormValues) => Promise<void>;
}

export function UserFormDialog({
  open,
  onOpenChange,
  editingUser,
  isSubmitting,
  submitError,
  onSubmit,
}: UserFormDialogProps) {
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const form = useForm<UserFormValuesBase>({
    resolver: zodResolver(userFormSchema),
    defaultValues: defaultUserValues,
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    if (editingUser) {
      form.reset({
        name: editingUser.name,
        email: editingUser.email,
        password: "",
        isAdmin: editingUser.isAdmin,
      });
    } else {
      form.reset(defaultUserValues);
    }
  }, [editingUser, form, open]);

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setAvatarFile(null);
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = async (values: UserFormValuesBase) => {
    const normalizedPassword = values.password.trim();

    if (!editingUser && normalizedPassword.length < 6) {
      form.setError("password", {
        message: "Senha deve ter pelo menos 6 caracteres.",
      });
      return;
    }

    if (
      editingUser &&
      normalizedPassword.length > 0 &&
      normalizedPassword.length < 6
    ) {
      form.setError("password", {
        message: "Senha deve ter pelo menos 6 caracteres.",
      });
      return;
    }

    await onSubmit({
      name: values.name.trim(),
      email: values.email.trim(),
      password: normalizedPassword,
      isAdmin: values.isAdmin,
      avatar: avatarFile,
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{editingUser ? "Editar usuario" : "Novo usuario"}</DialogTitle>
          <DialogDescription>
            {editingUser
              ? "Atualize os dados do usuario selecionado."
              : "Preencha os dados para criar um novo usuario."}
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={form.handleSubmit((values) => void handleSubmit(values))}
        >
          <div className="space-y-2">
            <Label htmlFor="user-name">Nome</Label>
            <Input id="user-name" autoFocus {...form.register("name")} />
            {form.formState.errors.name?.message ? (
              <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-email">E-mail</Label>
            <Input id="user-email" type="email" {...form.register("email")} />
            {form.formState.errors.email?.message ? (
              <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-password">
              {editingUser ? "Senha (opcional)" : "Senha"}
            </Label>
            <Input
              id="user-password"
              type="password"
              placeholder={
                editingUser ? "Deixe em branco para manter a atual" : undefined
              }
              {...form.register("password")}
            />
            {form.formState.errors.password?.message ? (
              <p className="text-sm text-red-600">
                {form.formState.errors.password.message}
              </p>
            ) : null}
          </div>

          {editingUser ? (
            <>
              <div className="space-y-2">
                <Label>Permissoes</Label>
                <Controller
                  control={form.control}
                  name="isAdmin"
                  render={({ field }) => (
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="accent-primary size-4 rounded border-zinc-300"
                        checked={field.value}
                        onChange={(event) => {
                          field.onChange(event.target.checked);
                        }}
                        disabled={isSubmitting}
                      />
                      Administrador
                    </label>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label>Avatar</Label>
                <AvatarUpload
                  currentAvatar={editingUser.avatar}
                  value={avatarFile}
                  disabled={isSubmitting}
                  onChange={setAvatarFile}
                />
              </div>
            </>
          ) : null}

          {submitError ? <p className="text-sm text-red-600">{submitError}</p> : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleDialogOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? editingUser
                  ? "Salvando..."
                  : "Criando..."
                : editingUser
                  ? "Salvar alteracoes"
                  : "Criar usuario"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
