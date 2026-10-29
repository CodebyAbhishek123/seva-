"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, role } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        if (role === "asha") {
          router.replace("/dashboard/asha");
        } else if (role === "dispatcher") {
          router.replace("/ambulances");
        } else if (role === "admin") {
          router.replace("/admin");
        } else {
          router.replace("/dashboard");
        }
      } else {
        router.replace("/login");
      }
    }
  }, [isAuthenticated, isLoading, role, router]);

  return (
    <div className="min-h-screen bg-[#F4F6F8] flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <div className="relative w-20 h-20 mx-auto rounded-full overflow-hidden shadow-lg ring-4 ring-[#163A5F]/10 bg-white">
          <Image
            src="/maira-logo.png"
            alt="MAIRA Gateway"
            width={80}
            height={80}
            className="w-full h-full object-cover"
            priority
          />
        </div>
        <div className="flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-[#163A5F] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-[#5B6875] font-medium tracking-wide">
            Connecting to MAIRA Operational Gateway...
          </p>
        </div>
      </div>
    </div>
  );
}
