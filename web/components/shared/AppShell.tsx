"use client";

import Link from "next/link";
import { SettingsMenu } from "@/components/shared/SettingsMenu";
import { DonationBanner } from "@/components/shared/DonationBanner";
import { PrivacyDisclaimer } from "@/components/shared/PrivacyDisclaimer";
import { useStore } from "@/store/useStore";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { layoutMode } = useStore();
  const sharedPadding = "px-4 md:px-8";
  const mainWrapperClass =
    layoutMode === "wide"
      ? `w-full max-w-screen-2xl mx-auto ${sharedPadding}`
      : `w-full max-w-5xl mx-auto ${sharedPadding}`;
  const headerWrapperClass =
    layoutMode === "wide"
      ? `w-full max-w-screen-2xl mx-auto flex h-14 items-center ${sharedPadding}`
      : `w-full max-w-5xl mx-auto flex h-14 items-center ${sharedPadding}`;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans antialiased">
      <DonationBanner />
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className={headerWrapperClass}>
          <div className="mr-4 hidden md:flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <span className="hidden font-bold tracking-tight sm:inline-block">
                Table Builder
              </span>
            </Link>
          </div>
          
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              {/* Profile Selector Placeholder */}
            </div>
            <nav className="flex items-center space-x-2">
               <SettingsMenu />
            </nav>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1">
        <div className={mainWrapperClass}>
            {children}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="py-0">
         <PrivacyDisclaimer />
      </footer>
    </div>
  );
}
