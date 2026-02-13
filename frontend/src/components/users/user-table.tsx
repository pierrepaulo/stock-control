import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { DataTablePagination } from "@/components/shared/data-table-pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { User } from "@/types/user";
import { Pencil, Trash2, Users } from "lucide-react";

interface UserTableProps {
  users: User[];
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: unknown;
  offset: number;
  pageSize: number;
  hasMore: boolean;
  onRetry: () => void;
  onOffsetChange: (offset: number) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  canEdit: (user: User) => boolean;
  canDelete: (user: User) => boolean;
}

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

const getInitials = (name: string) =>
  name
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase())
    .slice(0, 2)
    .join("");

export function UserTable({
  users,
  isLoading,
  isFetching,
  isError,
  error,
  offset,
  pageSize,
  hasMore,
  onRetry,
  onOffsetChange,
  onEdit,
  onDelete,
  canEdit,
  canDelete,
}: UserTableProps) {
  const columns: DataTableColumn<User>[] = [
    {
      id: "avatar",
      header: "Avatar",
      cell: (user) => {
        const initials = getInitials(user.name) || "SC";
        return (
          <Avatar size="sm">
            <AvatarImage src={user.avatar ?? undefined} alt={`Avatar de ${user.name}`} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        );
      },
      skeleton: <Skeleton className="size-6 rounded-full" />,
    },
    {
      id: "name",
      header: "Nome",
      cell: (user) => <span className="font-medium">{user.name}</span>,
      skeleton: <Skeleton className="h-4 w-32" />,
    },
    {
      id: "email",
      header: "E-mail",
      cell: (user) => user.email,
      skeleton: <Skeleton className="h-4 w-44" />,
    },
    {
      id: "isAdmin",
      header: "Perfil",
      cell: (user) =>
        user.isAdmin ? (
          <Badge variant="default">Admin</Badge>
        ) : (
          <Badge variant="secondary">Usuario</Badge>
        ),
      skeleton: <Skeleton className="h-5 w-16 rounded-full" />,
    },
    {
      id: "actions",
      header: "Acoes",
      headerClassName: "text-right",
      cellClassName: "text-right",
      cell: (user) => {
        const canEditCurrentUser = canEdit(user);
        const canDeleteCurrentUser = canDelete(user);

        return (
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              disabled={!canEditCurrentUser}
              title={
                canEditCurrentUser
                  ? `Editar usuario ${user.name}`
                  : "Sem permissao para editar este usuario"
              }
              onClick={() => {
                if (!canEditCurrentUser) return;
                onEdit(user);
              }}
              aria-label={`Editar usuario ${user.name}`}
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="icon-sm"
              disabled={!canDeleteCurrentUser}
              title={
                canDeleteCurrentUser
                  ? `Excluir usuario ${user.name}`
                  : "Apenas administradores podem excluir usuarios"
              }
              onClick={() => {
                if (!canDeleteCurrentUser) return;
                onDelete(user);
              }}
              aria-label={`Excluir usuario ${user.name}`}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        );
      },
      skeleton: (
        <div className="flex justify-end gap-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      ),
    },
  ];

  if (isError) {
    return (
      <EmptyState
        tone="danger"
        title="Nao foi possivel carregar os usuarios."
        description={getErrorMessage(error, "Erro inesperado ao consultar usuarios.")}
        action={
          <Button type="button" variant="outline" onClick={onRetry}>
            Tentar novamente
          </Button>
        }
      />
    );
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={users}
        getRowId={(user) => user.id}
        isLoading={isLoading}
        loadingRowCount={5}
        emptyState={
          <EmptyState
            icon={<Users className="size-5" />}
            title="Nenhum usuario cadastrado."
            description="Crie o primeiro usuario para iniciar o controle de acesso."
          />
        }
      />

      {!isLoading && users.length > 0 ? (
        <div className="mt-4">
          <DataTablePagination
            offset={offset}
            limit={pageSize}
            hasMore={hasMore}
            isLoading={isFetching}
            onOffsetChange={onOffsetChange}
          />
        </div>
      ) : null}
    </>
  );
}
