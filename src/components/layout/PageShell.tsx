"use client";

import React, { useState } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

interface PageShellProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
  statusBanner?: React.ReactNode;
}

export function PageShell({
  children,
  title,
  description,
  actions,
  breadcrumbs = [],
  statusBanner,
}: PageShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F6F8]">
      {/* Official Government Header */}
      <Header
        onToggleSidebar={() => setMobileOpen(true)}
        breadcrumbs={breadcrumbs}
      />

      {/* Main Workspace: Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />

        <main className="flex-1 overflow-y-auto">
          {/* Status banner if present */}
          {statusBanner}

          {/* Page Title & Action Bar */}
          <div className="border-b border-[#D9E0E7] bg-white px-4 lg:px-8 py-4 sm:py-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#163A5F]">
                  {title}
                </h1>
                {description && (
                  <p className="text-xs sm:text-sm text-[#5B6875] mt-1 max-w-3xl">
                    {description}
                  </p>
                )}
              </div>
              {actions && (
                <div className="flex items-center gap-2.5 shrink-0">
                  {actions}
                </div>
              )}
            </div>
          </div>

          {/* Content Area */}
          <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
