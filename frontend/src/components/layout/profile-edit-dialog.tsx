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
import { useAuth } from "@/hooks/use-auth";
import { ApiError } from "@/lib/api-client";
import { userQueryKeys } from "@/hooks/use-users";
import { usersService } from "@/services/users.service";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const profileFormSchema = z.object({
  name: z.string().trim().min(2, "Nome precisa ter ao menos 2 caracteres."),
});

interface ProfileFormValues {
  name: string;
}

interface ProfileEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileEditDialog({
  open,
  onOpenChange,
}: ProfileEditDialogProps) {
  const { user, updateUser } = useAuth();
  const queryClient = useQueryClient();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { name: "" },
  });

  useEffect(() => {
    if (open && user) {
      form.reset({ name: user.name });
      setAvatarFile(null);
      setSubmitError(null);
    }
  }, [open, user, form]);

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setAvatarFile(null);
      setSubmitError(null);
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = async (values: ProfileFormValues) => {
    if (!user) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const updated = await usersService.update(user.id, {
        name: values.name.trim(),
        avatar: avatarFile,
      });

      updateUser({ name: updated.name, avatar: updated.avatar });
      void queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
      handleDialogOpenChange(false);
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Erro ao atualizar perfil.";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Editar perfil</DialogTitle>
          <DialogDescription>
            Atualize seu nome e avatar.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={form.handleSubmit((values) => void handleSubmit(values))}
        >
          <div className="space-y-2">
            <Label htmlFor="profile-name">Nome</Label>
            <Input id="profile-name" autoFocus {...form.register("name")} />
            {form.formState.errors.name?.message ? (
              <p className="text-sm text-red-600">
                {form.formState.errors.name.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label>Avatar</Label>
            <AvatarUpload
              currentAvatar={user.avatar}
              value={avatarFile}
              disabled={isSubmitting}
              onChange={setAvatarFile}
            />
          </div>

          {submitError ? (
            <p className="text-sm text-red-600">{submitError}</p>
          ) : null}

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
              {isSubmitting ? "Salvando..." : "Salvar alteracoes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
