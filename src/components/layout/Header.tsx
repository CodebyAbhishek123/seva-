"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  Activity,
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  ShieldAlert,
  User as UserIcon,
  CheckCircle2,
} from "lucide-react";
import { RoleBadge } from "@/components/ui/Badge";
import { UserRole } from "@/types";

interface HeaderProps {
  onToggleSidebar?: () => void;
  breadcrumbs?: { label: string; href?: string }[];
}

export function Header({ onToggleSidebar, breadcrumbs = [] }: HeaderProps) {
  const { user, role, logout, switchRole, isDemoMode } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleRoleChange = (newRole: UserRole) => {
    switchRole(newRole);
    setRoleMenuOpen(false);
    // Role-based routing adjustments
    if (newRole !== "admin" && pathname.startsWith("/admin")) {
      router.push("/dashboard");
    }
    if (newRole === "asha" && !pathname.startsWith("/dashboard/asha")) {
      router.push("/dashboard/asha");
    }
    if (newRole !== "asha" && pathname.startsWith("/dashboard/asha")) {
      router.push("/dashboard");
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#163A5F] text-white border-b border-[#0F2742] shadow-xs">
      {/* Top Government Portal Identity Bar */}
      <div className="px-4 lg:px-6 h-14 flex items-center justify-between">
        {/* Left: Mobile menu toggle + Wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-1.5 rounded text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="relative w-9 h-9 rounded-full overflow-hidden border border-white/30 shadow-xs shrink-0 bg-white group-hover:scale-105 transition-transform flex items-center justify-center">
              <Image
                src="/maira-logo.png"
                alt="MAIRA Official Emblem"
                width={36}
                height={36}
                className="w-full h-full object-cover"
                priority
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-wider text-white group-hover:text-emerald-300 transition-colors">
                  MAIRA
                </span>
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded bg-white/15 text-white/90 border border-white/20">
                  GOV PORTAL
                </span>
              </div>
              <span className="text-[11px] text-white/70 font-normal tracking-tight hidden sm:inline">
                Maternal & Infant Referral Assistance
              </span>
            </div>
          </Link>
        </div>

        {/* Center / Right: Demo Environment Flag, Role Switcher & Account */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Demo mode status indicator */}
          {isDemoMode && (
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/15 border border-amber-400/30 text-amber-200 text-xs">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="font-medium">Operational Drill / Demo Mode</span>
            </div>
          )}

          {/* Quick Role Switcher for seamless testing */}
          <div className="relative">
            <button
              onClick={() => {
                setRoleMenuOpen(!roleMenuOpen);
                setAccountMenuOpen(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded bg-white/10 hover:bg-white/15 border border-white/20 text-white transition-colors"
              title="Switch operational role for testing"
            >
              <span className="hidden sm:inline text-white/70">Role:</span>
              <span className="capitalize font-semibold">
                {role === "hospital"
                  ? "Hospital"
                  : role === "dispatcher"
                  ? "Dispatcher"
                  : role === "asha"
                  ? "ASHA Worker"
                  : "Admin"}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-white/70" />
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-2 w-60 bg-white text-[#172B3A] rounded-md shadow-lg border border-[#D9E0E7] py-1 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1.5 border-b border-[#E5EAF0] text-[11px] font-semibold text-[#5B6875] uppercase tracking-wider">
                  Select Active Persona
                </div>
                <button
                  onClick={() => handleRoleChange("hospital")}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-[#F8FAFC] transition-colors ${
                    role === "hospital" ? "bg-blue-50 font-semibold text-[#1D4ED8]" : ""
                  }`}
                >
                  <div>
                    <div className="text-sm">Hospital / Doctor</div>
                    <div className="text-[11px] text-[#5B6875]">Review, accept & handover</div>
                  </div>
                  {role === "hospital" && <CheckCircle2 className="w-4 h-4 text-[#1D4ED8]" />}
                </button>
                <button
                  onClick={() => handleRoleChange("dispatcher")}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-[#F8FAFC] transition-colors ${
                    role === "dispatcher" ? "bg-blue-50 font-semibold text-[#1D4ED8]" : ""
                  }`}
                >
                  <div>
                    <div className="text-sm">108 Dispatcher</div>
                    <div className="text-[11px] text-[#5B6875]">Fleet dispatch & GPS tracking</div>
                  </div>
                  {role === "dispatcher" && <CheckCircle2 className="w-4 h-4 text-[#1D4ED8]" />}
                </button>
                <button
                  onClick={() => handleRoleChange("asha")}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-[#F8FAFC] transition-colors ${
                    role === "asha" ? "bg-blue-50 font-semibold text-[#1D4ED8]" : ""
                  }`}
                >
                  <div>
                    <div className="text-sm">ASHA Field Worker</div>
                    <div className="text-[11px] text-[#5B6875]">Maternal tracking & Village SOS</div>
                  </div>
                  {role === "asha" && <CheckCircle2 className="w-4 h-4 text-[#1D4ED8]" />}
                </button>
                <button
                  onClick={() => handleRoleChange("admin")}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-[#F8FAFC] transition-colors ${
                    role === "admin" ? "bg-blue-50 font-semibold text-[#1D4ED8]" : ""
                  }`}
                >
                  <div>
                    <div className="text-sm">System Administrator</div>
                    <div className="text-[11px] text-[#5B6875]">Audit logs & user control</div>
                  </div>
                  {role === "admin" && <CheckCircle2 className="w-4 h-4 text-[#1D4ED8]" />}
                </button>
              </div>
            )}
          </div>

          {/* Activity / Notifications Icon */}
          <Link
            href="/activity"
            className="p-1.5 rounded text-white/80 hover:text-white hover:bg-white/10 transition-colors relative"
            aria-label="View activity logs and notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400" />
          </Link>

          {/* User Account Menu */}
          <div className="relative">
            <button
              onClick={() => {
                setAccountMenuOpen(!accountMenuOpen);
                setRoleMenuOpen(false);
              }}
              className="flex items-center gap-2 py-1 px-2 rounded hover:bg-white/10 transition-colors text-left"
            >
              <div className="w-7 h-7 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-xs font-semibold">
                {user?.name?.charAt(0) || "U"}
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-semibold leading-tight line-clamp-1">
                  {user?.name || "Dr. Priya Sharma"}
                </span>
                <span className="text-[10px] text-white/70 leading-tight">
                  {user?.facilityName || user?.designation || "Government User"}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-white/70 hidden sm:inline" />
            </button>

            {accountMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white text-[#172B3A] rounded-md shadow-lg border border-[#D9E0E7] py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-4 py-2 border-b border-[#E5EAF0]">
                  <p className="text-xs font-semibold text-[#163A5F]">
                    {user?.name}
                  </p>
                  <p className="text-[11px] text-[#5B6875] truncate">
                    {user?.email}
                  </p>
                  <div className="mt-1.5">
                    {role && <RoleBadge role={role} />}
                  </div>
                </div>

                <div className="py-1 border-b border-[#E5EAF0]">
                  <Link
                    href="/dashboard"
                    onClick={() => setAccountMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-[#172B3A] hover:bg-[#F8FAFC]"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-[#5B6875]" />
                    My Dashboard
                  </Link>
                  <Link
                    href="/activity"
                    onClick={() => setAccountMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-[#172B3A] hover:bg-[#F8FAFC]"
                  >
                    <Activity className="w-3.5 h-3.5 text-[#5B6875]" />
                    System Activity & Notifications
                  </Link>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs text-[#B42318] hover:bg-red-50 text-left font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Breadcrumb sub-bar */}
      {breadcrumbs.length > 0 && (
        <div className="bg-[#0F2742] px-4 lg:px-6 py-1.5 text-[11px] text-white/70 flex items-center gap-1.5 border-t border-white/10">
          <Link href="/dashboard" className="hover:text-white transition-colors">
            Portal Home
          </Link>
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              <span className="text-white/40">/</span>
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="hover:text-white transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-white font-medium">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </div>
      )}
    </header>
  );
}
