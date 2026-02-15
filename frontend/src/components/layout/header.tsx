"use client";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { usePathname } from "next/navigation";
import { UserNav } from "./user-nav";

const routeTitles: Record<string, string> = {
  "/": "Dashboard",
  "/produtos": "Produtos",
  "/categorias": "Categorias",
  "/movimentacoes": "Movimentacoes",
  "/usuarios": "Usuarios",
};

const getRouteTitle = (pathname: string) => {
  if (pathname === "/") {
    return routeTitles["/"];
  }

  const firstSegment = `/${pathname.split("/")[1]}`;
  return routeTitles[firstSegment] ?? "Stock Control";
};

export function Header() {
  const pathname = usePathname();
  const title = getRouteTitle(pathname);

  return (
    <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-1 h-4" />
        <span className="text-base font-semibold leading-none">{title}</span>
      </div>

      <div className="ml-auto flex items-center gap-1">
        <ThemeToggle />
        <UserNav />
      </div>
    </header>
  );
}
