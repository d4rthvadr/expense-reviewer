"use client";
import React from "react";
import { UserButton } from "@clerk/nextjs";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import NotificationBell from "./notification-bell";
import { MobileSidebar } from "./sidebar";

const Navbar = () => {
  const { setTheme } = useTheme();

  return (
    <nav className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 lg:px-6">
      {/* Mobile Sidebar Toggle */}
      <MobileSidebar />

      {/* Logo (hidden on desktop, shown on mobile) */}
      <div className="flex items-center gap-2 lg:hidden">
        <span className="text-lg font-bold">ER</span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right side items */}
      <div className="flex items-center gap-4">
        {/* NOTIFICATION BELL */}
        <NotificationBell />

        {/* THEME MENU */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              Dark
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: "w-9 h-9",
            },
          }}
        />
      </div>
    </nav>
  );
};

Navbar.displayName = "Navbar";

export default Navbar;
