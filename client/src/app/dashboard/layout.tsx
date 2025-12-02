import React from "react";
import Navbar from "@/components/navbar";
import { DesktopSidebar } from "@/components/sidebar";
import { AuthStoreProvider } from "@/stores/providers/authStore-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthStoreProvider>
      <div className="flex min-h-screen">
        {/* Desktop Sidebar */}
        <DesktopSidebar />

        {/* Main Content */}
        <div className="flex flex-1 flex-col lg:pl-64">
          <Navbar />
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </AuthStoreProvider>
  );
}
