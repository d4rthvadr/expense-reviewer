import React from "react";
import Navbar from "@/components/navbar";
import BreadCrumb from "@/components/breadcrumb";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="">
      <Navbar />
      <main className="p-4">
        <BreadCrumb />
        {children}
      </main>
    </div>
  );
}
