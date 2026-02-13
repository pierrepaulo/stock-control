import type { AuthUser } from "@/types/auth";

type UserPermissionsContext = Pick<AuthUser, "id" | "isAdmin"> | null | undefined;

export const canAccessUsersPage = (currentUser: UserPermissionsContext): boolean => {
  return Boolean(currentUser?.isAdmin);
};
