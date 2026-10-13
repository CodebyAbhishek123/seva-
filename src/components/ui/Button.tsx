import React from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "navy" | "secondary" | "danger" | "ghost" | "success";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none select-none";

  const sizeClasses = {
    sm: "text-xs px-2.5 py-1.5 gap-1.5",
    md: "text-sm px-3.5 py-2 gap-2",
    lg: "text-sm px-5 py-2.5 gap-2.5 font-semibold",
  };

  const variantClasses = {
    primary:
      "bg-[#1D4ED8] hover:bg-[#1E40AF] text-white focus:ring-[#1D4ED8] shadow-sm",
    navy: "bg-[#163A5F] hover:bg-[#0F2742] text-white focus:ring-[#163A5F] shadow-sm",
    secondary:
      "bg-white hover:bg-[#F8FAFC] text-[#172B3A] border border-[#D9E0E7] focus:ring-[#1D4ED8] shadow-xs",
    danger:
      "bg-[#B42318] hover:bg-[#911D13] text-white focus:ring-[#B42318] shadow-sm",
    success:
      "bg-[#18794E] hover:bg-[#13613E] text-white focus:ring-[#18794E] shadow-sm",
    ghost:
      "bg-transparent hover:bg-[#EDF2F7] text-[#172B3A] focus:ring-slate-300",
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
}
