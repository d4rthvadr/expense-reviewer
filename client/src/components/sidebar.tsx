"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  FileText,
  Settings,
  Menu,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const navigationItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Transactions",
    href: "/dashboard/transactions",
    icon: Receipt,
  },
  {
    name: "Budgets",
    href: "/dashboard/budgets",
    icon: Wallet,
  },
  {
    name: "Reports",
    href: "/dashboard/reports",
    icon: FileText,
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

function SidebarContent() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-2 p-4">
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}

// Desktop Sidebar
export function DesktopSidebar() {
  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r bg-background px-6 py-4">
        <div className="flex h-16 shrink-0 items-center">
          <Link href="/dashboard" className="text-2xl font-bold">
            ER
          </Link>
        </div>
        <SidebarContent />
      </div>
    </aside>
  );
}

// Mobile Sidebar
export function MobileSidebar() {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <div className="flex h-16 shrink-0 items-center px-6">
          <Link
            href="/dashboard"
            className="text-2xl font-bold"
            onClick={() => setOpen(false)}
          >
            ER
          </Link>
        </div>
        <div onClick={() => setOpen(false)}>
          <SidebarContent />
        </div>
      </SheetContent>
    </Sheet>
  );
}

DesktopSidebar.displayName = "DesktopSidebar";
MobileSidebar.displayName = "MobileSidebar";
