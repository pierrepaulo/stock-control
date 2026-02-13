"use client";

import {
  UserFormDialog,
  type UserFormValues,
} from "@/components/users/user-form-dialog";
import { UserTable } from "@/components/users/user-table";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useCreateUser,
  useDeleteUser,
  useUpdateUser,
  useUsers,
} from "@/hooks/use-users";
import { useAuth } from "@/hooks/use-auth";
import { canAccessUsersPage } from "@/lib/permissions/users";
import type { UpdateUserInput, User } from "@/types/user";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const PAGE_SIZE = 10;
const QUERY_LIMIT = PAGE_SIZE + 1;

export default function UsuariosPage() {
  const { user: currentUser, isLoading } = useAuth();
  const router = useRouter();
  const [offset, setOffset] = useState(0);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const isCurrentUserAdmin = canAccessUsersPage(currentUser);

  const usersQueryParams = useMemo(
    () => ({
      offset,
      limit: QUERY_LIMIT,
    }),
    [offset]
  );

  const usersQuery = useUsers(usersQueryParams);
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  const usersWithLookahead = usersQuery.data ?? [];
  const users = usersWithLookahead.slice(0, PAGE_SIZE);
  const hasMore = usersWithLookahead.length > PAGE_SIZE;
  const isFormSubmitting =
    createUserMutation.isPending || updateUserMutation.isPending;
  const isDeleteSubmitting = deleteUserMutation.isPending;
  const canEditEmail =
    editingUser === null ? true : isCurrentUserAdmin;

  useEffect(() => {
    if (!isLoading && !isCurrentUserAdmin) {
      router.replace("/");
    }
  }, [isLoading, isCurrentUserAdmin, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-zinc-600">Validando permissao...</p>
      </div>
    );
  }

  if (!isCurrentUserAdmin) {
    return null;
  }

  const handleFormDialogOpenChange = (open: boolean) => {
    setIsFormDialogOpen(open);

    if (!open) {
      setEditingUser(null);
      setSubmitError(null);
    }
  };

  const handleCreateClick = () => {
    setEditingUser(null);
    setSubmitError(null);
    setIsFormDialogOpen(true);
  };

  const handleEditClick = (user: User) => {
    if (!isCurrentUserAdmin) {
      return;
    }

    setEditingUser(user);
    setSubmitError(null);
    setIsFormDialogOpen(true);
  };

  const handleDeleteClick = (user: User) => {
    if (!isCurrentUserAdmin) {
      return;
    }

    setUserToDelete(user);
  };

  const buildUpdatePayload = (
    formValues: UserFormValues,
    currentUser: User,
    canEditEmail: boolean
  ): UpdateUserInput => {
    const payload: UpdateUserInput = {};

    if (formValues.name !== currentUser.name) {
      payload.name = formValues.name;
    }

    if (canEditEmail && formValues.email !== currentUser.email) {
      payload.email = formValues.email;
    }

    if (formValues.password.length > 0) {
      payload.password = formValues.password;
    }

    if (formValues.isAdmin !== currentUser.isAdmin) {
      payload.isAdmin = formValues.isAdmin;
    }

    if (formValues.avatar instanceof File) {
      payload.avatar = formValues.avatar;
    }

    return payload;
  };

  const handleSubmit = async (values: UserFormValues) => {
    setSubmitError(null);

    try {
      if (editingUser) {
        const payload = buildUpdatePayload(values, editingUser, canEditEmail);

        if (Object.keys(payload).length === 0) {
          toast.info("Nenhuma alteracao detectada.");
          handleFormDialogOpenChange(false);
          return;
        }

        await updateUserMutation.mutateAsync({
          id: editingUser.id,
          data: payload,
        });
      } else {
        await createUserMutation.mutateAsync({
          name: values.name,
          email: values.email,
          password: values.password,
        });
      }

      handleFormDialogOpenChange(false);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Nao foi possivel salvar os dados do usuario."
      );
    }
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete || !isCurrentUserAdmin) {
      return;
    }

    try {
      await deleteUserMutation.mutateAsync(userToDelete.id);
      setUserToDelete(null);
    } catch {
      // Keep dialog open and show error toast from hook.
    }
  };

  return (
    <main className="space-y-6">
      <PageHeader
        title="Usuarios"
        description="Gerencie contas, permissoes de administrador e avatar."
        action={
          <Button
            onClick={handleCreateClick}
            disabled={!isCurrentUserAdmin}
            title={
              isCurrentUserAdmin
                ? "Criar novo usuario"
                : "Apenas administradores podem criar usuarios"
            }
          >
            <Plus className="size-4" />
            Novo usuario
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Lista de usuarios</CardTitle>
          <CardDescription>
            Criacao, edicao com campos opcionais e upload de avatar via multipart.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <UserTable
            users={users}
            isLoading={usersQuery.isLoading}
            isFetching={usersQuery.isFetching}
            isError={usersQuery.isError}
            error={usersQuery.error}
            offset={offset}
            pageSize={PAGE_SIZE}
            hasMore={hasMore}
            onRetry={() => {
              void usersQuery.refetch();
            }}
            onOffsetChange={setOffset}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
            canEdit={() => isCurrentUserAdmin}
            canDelete={() => isCurrentUserAdmin}
          />
        </CardContent>
      </Card>

      <UserFormDialog
        open={isFormDialogOpen}
        onOpenChange={handleFormDialogOpenChange}
        editingUser={editingUser}
        canEditEmail={canEditEmail}
        isSubmitting={isFormSubmitting}
        submitError={submitError}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(userToDelete)}
        onOpenChange={(open) => {
          if (!open && !isDeleteSubmitting) {
            setUserToDelete(null);
          }
        }}
        title="Excluir usuario"
        description={
          userToDelete
            ? `Deseja excluir o usuario "${userToDelete.name}"?`
            : "Deseja excluir este usuario?"
        }
        confirmLabel="Excluir"
        isConfirming={isDeleteSubmitting}
        onConfirm={handleDeleteConfirm}
      />
    </main>
  );
}
