import React from "react";
import Navbar from "@/components/navbar";
import { AuthStoreProvider } from "@/stores/providers/authStore-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthStoreProvider>
      <Navbar />
      {children}
    </AuthStoreProvider>
  );
}
