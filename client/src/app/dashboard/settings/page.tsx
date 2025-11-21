"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import CategoryWeightsManager from "@/components/category-weights-manager";
import { Toaster } from "@/components/ui/sonner";
import { Settings, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

type SettingsSection = "category-weights" | "notifications";

const settingsSections = [
  {
    id: "category-weights" as const,
    label: "Category Weights",
    icon: Settings,
    description: "Manage your account settings and set e-mail preferences.",
  },
  {
    id: "notifications" as const,
    label: "Notifications",
    icon: Bell,
    description: "Configure notification preferences.",
  },
];

function SettingsPage() {
  const searchParams = useSearchParams();
  const sectionParam = searchParams.get("section") as SettingsSection | null;
  
  const [activeSection, setActiveSection] =
    useState<SettingsSection>(sectionParam || "category-weights");

  // Update active section when URL parameter changes
  useEffect(() => {
    if (sectionParam && (sectionParam === "category-weights" || sectionParam === "notifications")) {
      setActiveSection(sectionParam);
    }
  }, [sectionParam]);

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and set e-mail preferences.
          </p>
        </div>

        {/* Layout: Sidebar + Content */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside className="w-full md:w-48 lg:w-56 flex-shrink-0">
            <nav className="space-y-1">
              {settingsSections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;

                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors text-left",
                      isActive
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {section.label}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 max-w-4xl">
            {activeSection === "category-weights" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold mb-2">
                    Category Weights
                  </h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    Manage your category spending preferences. These weights
                    help track how your actual spending compares to your
                    targets.
                  </p>
                </div>

                <div className="bg-card border rounded-lg p-6">
                  <CategoryWeightsManager />
                </div>
              </div>
            )}

            {activeSection === "notifications" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold mb-2">Notifications</h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    Configure how and when you receive notifications.
                  </p>
                </div>

                <div className="bg-card border rounded-lg p-6">
                  <p className="text-muted-foreground">
                    Notification settings coming soon...
                  </p>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;

SettingsPage.displayName = "SettingsPage";
