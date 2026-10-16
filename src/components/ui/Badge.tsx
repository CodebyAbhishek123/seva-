import React from "react";
import { ReferralStatus, UrgencyLevel, UserRole } from "@/types";

interface BadgeProps {
  children: React.ReactNode;
  variant?:
    | "default"
    | "primary"
    | "success"
    | "warning"
    | "critical"
    | "neutral"
    | "outline";
  size?: "sm" | "md";
  className?: string;
  icon?: React.ReactNode;
}

export function Badge({
  children,
  variant = "default",
  size = "md",
  className = "",
  icon,
}: BadgeProps) {
  const baseClasses =
    "inline-flex items-center font-medium rounded tracking-wide border";

  const sizeClasses =
    size === "sm"
      ? "text-xs px-2 py-0.5 gap-1"
      : "text-xs px-2.5 py-1 gap-1.5 font-semibold";

  const variantClasses = {
    default: "bg-[#F1F4F8] text-[#172B3A] border-[#D9E0E7]",
    primary: "bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]",
    success: "bg-[#EDFBF3] text-[#18794E] border-[#A6E9C5]",
    warning: "bg-[#FEF7EC] text-[#A15C00] border-[#FCE1B6]",
    critical: "bg-[#FEF3F2] text-[#B42318] border-[#FECDCA]",
    neutral: "bg-[#F8FAFC] text-[#5B6875] border-[#E2E8F0]",
    outline: "bg-transparent text-[#172B3A] border-[#D9E0E7]",
  };

  return (
    <span
      className={`${baseClasses} ${sizeClasses} ${variantClasses[variant]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
}

export function UrgencyBadge({ urgency }: { urgency: UrgencyLevel }) {
  if (urgency === "CRITICAL") {
    return (
      <Badge variant="critical">
        <span className="w-1.5 h-1.5 rounded-full bg-[#B42318] animate-pulse" />
        CRITICAL
      </Badge>
    );
  }
  if (urgency === "HIGH") {
    return (
      <Badge variant="warning">
        <span className="w-1.5 h-1.5 rounded-full bg-[#A15C00]" />
        HIGH PRIORITY
      </Badge>
    );
  }
  return (
    <Badge variant="neutral">
      <span className="w-1.5 h-1.5 rounded-full bg-[#5B6875]" />
      NORMAL
    </Badge>
  );
}

export function StatusBadge({ status }: { status: ReferralStatus }) {
  switch (status) {
    case "NEW":
      return (
        <Badge variant="primary">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1D4ED8]" />
          NEW
        </Badge>
      );
    case "NEEDS_REVIEW":
      return (
        <Badge variant="warning">
          <span className="w-1.5 h-1.5 rounded-full bg-[#A15C00]" />
          NEEDS REVIEW
        </Badge>
      );
    case "ACCEPTED":
      return (
        <Badge variant="success">
          <span className="w-1.5 h-1.5 rounded-full bg-[#18794E]" />
          ACCEPTED
        </Badge>
      );
    case "DECLINED":
      return (
        <Badge variant="critical">
          <span className="w-1.5 h-1.5 rounded-full bg-[#B42318]" />
          DECLINED
        </Badge>
      );
    case "AMBULANCE_ASSIGNED":
      return (
        <Badge variant="primary">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1D4ED8]" />
          AMBULANCE DISPATCHED
        </Badge>
      );
    case "PATIENT_ONBOARD":
      return (
        <Badge variant="warning">
          <span className="w-1.5 h-1.5 rounded-full bg-[#A15C00]" />
          PATIENT ONBOARD
        </Badge>
      );
    case "ARRIVED":
      return (
        <Badge variant="success">
          <span className="w-1.5 h-1.5 rounded-full bg-[#18794E]" />
          ARRIVED AT HOSPITAL
        </Badge>
      );
    case "COMPLETED":
      return (
        <Badge variant="neutral">
          <span className="w-1.5 h-1.5 rounded-full bg-[#5B6875]" />
          COMPLETED / HANDOVER
        </Badge>
      );
    default:
      return <Badge variant="neutral">{status}</Badge>;
  }
}

export function RoleBadge({ role }: { role: UserRole }) {
  switch (role) {
    case "hospital":
      return (
        <Badge variant="success" size="sm">
          Hospital / Doctor
        </Badge>
      );
    case "dispatcher":
      return (
        <Badge variant="primary" size="sm">
          Dispatcher / Coordinator
        </Badge>
      );
    case "admin":
      return (
        <Badge variant="warning" size="sm">
          System Administrator
        </Badge>
      );
    case "asha":
      return (
        <Badge variant="primary" size="sm">
          ASHA Community Worker
        </Badge>
      );
  }
}
