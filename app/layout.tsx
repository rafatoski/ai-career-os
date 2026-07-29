import type { Metadata } from "next";

import { AppNavigation } from "@/components/app-navigation";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "AI Career OS",
    template: "%s · AI Career OS",
  },
  description:
    "A local-first workspace for becoming an exceptional AI Product Engineer.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" data-scroll-behavior="smooth">
      <body>
        <AppNavigation />
        <main className="min-h-screen md:pl-[248px]">
          <div className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
