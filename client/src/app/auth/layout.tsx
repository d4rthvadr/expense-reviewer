import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto">
      <div className="min-h-screen flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
