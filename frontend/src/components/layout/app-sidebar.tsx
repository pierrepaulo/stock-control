"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { canAccessUsersPage } from "@/lib/permissions/users";
import { ChartNoAxesColumn, FolderTree, House, Package, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";

interface NavigationItem {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  requiresAdmin?: boolean;
}

const navigationItems: NavigationItem[] = [
  { href: "/", label: "Dashboard", icon: House },
  { href: "/produtos", label: "Produtos", icon: Package },
  { href: "/categorias", label: "Categorias", icon: FolderTree },
  { href: "/movimentacoes", label: "Movimentacoes", icon: ChartNoAxesColumn },
  { href: "/usuarios", label: "Usuarios", icon: Users, requiresAdmin: true },
];

const isItemActive = (pathname: string, href: string) =>
  href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const canAccessUsers = canAccessUsersPage(user);

  return (
    <Sidebar collapsible="offcanvas" variant="inset">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md">
            <Package className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Stock Control</span>
            <span className="text-muted-foreground truncate text-xs">Painel administrativo</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegacao</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const isRestricted = item.requiresAdmin === true && !canAccessUsers;

                return (
                  <SidebarMenuItem key={item.href}>
                    {isRestricted ? (
                      <SidebarMenuButton
                        disabled
                        aria-disabled
                        title="Apenas administradores podem acessar esta pagina"
                      >
                        <item.icon className="size-4" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    ) : (
                      <SidebarMenuButton
                        asChild
                        isActive={isItemActive(pathname, item.href)}
                      >
                        <Link href={item.href}>
                          <item.icon className="size-4" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
