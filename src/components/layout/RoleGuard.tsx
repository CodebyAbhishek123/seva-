"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { UserRole } from "@/types";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallbackTitle?: string;
  fallbackMessage?: string;
}

export function RoleGuard({
  children,
  allowedRoles,
  fallbackTitle = "Access Restricted — Insufficient Privileges",
  fallbackMessage = "You do not have the required role privileges to access this operational module. This access attempt has been logged in the audit trail.",
}: RoleGuardProps) {
  const { role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center p-8">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#163A5F] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#5B6875] font-medium">
            Verifying credential permissions...
          </p>
        </div>
      </div>
    );
  }

  if (!role || !allowedRoles.includes(role)) {
    return (
      <div className="p-8 max-w-xl mx-auto my-12 bg-white border border-[#D9E0E7] rounded-lg shadow-sm text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-100 border border-red-200 flex items-center justify-center mx-auto text-[#B42318]">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-[#163A5F]">
            {fallbackTitle}
          </h2>
          <p className="text-xs text-[#5B6875] leading-relaxed">
            {fallbackMessage}
          </p>
        </div>
        <div className="bg-[#F8FAFC] border border-[#E5EAF0] rounded p-3 text-xs text-[#5B6875] text-left space-y-1">
          <div>
            <span className="font-semibold text-[#172B3A]">Your Current Role:</span>{" "}
            <span className="capitalize">{role || "Unauthenticated"}</span>
          </div>
          <div>
            <span className="font-semibold text-[#172B3A]">Required Role(s):</span>{" "}
            {allowedRoles.map((r) => r.toUpperCase()).join(", ")}
          </div>
        </div>
        <div className="pt-2 flex justify-center gap-3">
          <Link href="/dashboard">
            <Button variant="navy" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
              Return to Permitted Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
