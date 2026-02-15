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
    <Sidebar collapsible="offcanvas" className="border-r-0">
      <SidebarHeader className="p-5 pb-4">
        <div className="flex items-center gap-3.5">
          <div className="bg-sidebar-primary text-sidebar-primary-foreground flex size-11 items-center justify-center rounded-xl shadow-lg shadow-sidebar-primary/25">
            <Package className="size-6" />
          </div>
          <div className="grid flex-1 text-left leading-tight">
            <span className="truncate text-base font-bold tracking-tight text-sidebar-foreground">
              Stock Control
            </span>
            <span className="truncate text-xs text-sidebar-foreground/50">
              Gestao de estoque
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-1 pt-2">
        <SidebarGroup>
          <SidebarGroupLabel className="mb-1 px-3 text-[11px] uppercase tracking-widest text-sidebar-foreground/40">
            Navegacao
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {navigationItems.map((item) => {
                const isRestricted = item.requiresAdmin === true && !canAccessUsers;

                return (
                  <SidebarMenuItem key={item.href}>
                    {isRestricted ? (
                      <SidebarMenuButton
                        size="lg"
                        disabled
                        aria-disabled
                        title="Apenas administradores podem acessar esta pagina"
                        className="h-11 gap-3 rounded-lg px-3 text-[15px] [&>svg]:size-5"
                      >
                        <item.icon />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    ) : (
                      <SidebarMenuButton
                        size="lg"
                        asChild
                        isActive={isItemActive(pathname, item.href)}
                        className="h-11 gap-3 rounded-lg px-3 text-[15px] [&>svg]:size-5"
                      >
                        <Link href={item.href}>
                          <item.icon />
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

    </Sidebar>
  );
}
