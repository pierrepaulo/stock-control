"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProfileEditDialog } from "@/components/layout/profile-edit-dialog";
import { useAuth } from "@/hooks/use-auth";
import { ChevronsUpDown, LogOut, UserPen } from "lucide-react";
import { useState } from "react";

const getInitials = (name: string) =>
  name
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase())
    .slice(0, 2)
    .join("");

export function UserNav() {
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);

  if (!user) {
    return null;
  }

  const initials = getInitials(user.name) || "SC";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-auto gap-2 px-2 py-1.5">
            <Avatar size="sm">
              <AvatarImage src={user.avatar ?? undefined} alt={`Avatar de ${user.name}`} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>

            <div className="hidden text-left sm:grid">
              <span className="text-sm font-medium leading-none">{user.name}</span>
              <span className="text-muted-foreground text-xs">{user.email}</span>
            </div>

            <ChevronsUpDown className="text-muted-foreground size-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-60">
          <DropdownMenuLabel className="font-normal">
            <div className="grid gap-0.5">
              <span className="text-sm font-medium">{user.name}</span>
              <span className="text-muted-foreground text-xs">{user.email}</span>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onSelect={() => setProfileOpen(true)}
            className="cursor-pointer"
          >
            <UserPen className="size-4" />
            <span>Editar perfil</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              void logout();
            }}
            className="cursor-pointer"
          >
            <LogOut className="size-4" />
            <span>Sair</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ProfileEditDialog open={profileOpen} onOpenChange={setProfileOpen} />
    </>
  );
}
