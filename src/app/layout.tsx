import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "MAIRA — Maternal & Infant Referral Assistance",
  description:
    "Government Healthcare Referral & Emergency Ambulance Coordination Operational Portal for Maternal & Neonatal Health.",
  icons: {
    icon: "/maira-icon.png",
    apple: "/maira-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#F4F6F8] text-[#172B3A] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
