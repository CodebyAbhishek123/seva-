"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  LayoutDashboard,
  GitPullRequest,
  BedDouble,
  Building2,
  Ambulance,
  History,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Info,
} from "lucide-react";

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const pathname = usePathname();
  const { role } = useAuth();

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["hospital", "dispatcher", "admin"],
      exact: true,
    },
    {
      name: "Referral Management",
      href: "/referrals",
      icon: GitPullRequest,
      roles: ["hospital", "dispatcher", "admin"],
      badge: "Active",
    },
    {
      name: "Hospital Readiness",
      href: "/facilities/readiness",
      icon: BedDouble,
      roles: ["hospital", "dispatcher", "admin"],
    },
    {
      name: "Facility Directory",
      href: "/facilities",
      icon: Building2,
      roles: ["hospital", "dispatcher", "admin"],
    },
    {
      name: "Ambulance Operations",
      href: "/ambulances",
      icon: Ambulance,
      roles: ["dispatcher", "hospital", "admin"],
      badge: role === "dispatcher" ? "Live" : undefined,
    },
    {
      name: "Notifications & Activity",
      href: "/activity",
      icon: History,
      roles: ["hospital", "dispatcher", "admin"],
    },
    {
      name: "Administration",
      href: "/admin",
      icon: ShieldCheck,
      roles: ["admin"], // STRICT: Admin role only!
    },
  ];

  // Filter based on user's active role
  const visibleNav = navigation.filter((item) =>
    role ? item.roles.includes(role) : false
  );

  const sidebarContent = (
    <aside
      className={`h-full flex flex-col bg-white border-r border-[#D9E0E7] transition-all duration-200 select-none ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Sidebar Header / Section Tag */}
      <div className="h-12 border-b border-[#E5EAF0] px-4 flex items-center justify-between bg-[#F8FAFC]">
        {!collapsed && (
          <span className="text-[11px] font-bold text-[#5B6875] tracking-wider uppercase">
            Operations Menu
          </span>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded text-[#5B6875] hover:text-[#172B3A] hover:bg-slate-200/60 hidden lg:flex items-center justify-center transition-colors mx-auto"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
        {visibleNav.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onCloseMobile}
              title={collapsed ? item.name : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded text-xs font-medium transition-colors ${
                isActive
                  ? "bg-[#163A5F] text-white shadow-xs"
                  : "text-[#172B3A] hover:bg-[#F1F4F8] hover:text-[#163A5F]"
              } ${collapsed ? "justify-center px-0" : ""}`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  isActive ? "text-white" : "text-[#5B6875]"
                }`}
              />
              {!collapsed && (
                <div className="flex-1 flex items-center justify-between">
                  <span className="truncate">{item.name}</span>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-blue-100 text-[#1D4ED8]"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Operational Protocol Footer info */}
      {!collapsed && (
        <div className="p-3 border-t border-[#E5EAF0] bg-[#F8FAFC] text-[11px] text-[#5B6875] space-y-1.5">
          <div className="flex items-center gap-1.5 font-semibold text-[#163A5F]">
            <Info className="w-3.5 h-3.5 text-[#1D4ED8] shrink-0" />
            <span>Gov SOP Directive</span>
          </div>
          <p className="leading-snug">
            All obstetric referrals must be reviewed within 15 minutes of logging.
          </p>
        </div>
      )}
    </aside>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <div className="hidden lg:block shrink-0">{sidebarContent}</div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 w-64 h-full bg-white shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
