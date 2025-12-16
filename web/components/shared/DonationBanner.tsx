"use client";

import { useState } from "react";
import { Heart, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const DISMISS_KEY = "table-builder-donation-dismissed";
const FOUR_HOURS_MS = 4 * 60 * 60 * 1000;

export function DonationBanner() {
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window === "undefined") return false;
    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (!dismissedAt) return true;
    const elapsed = Date.now() - Number(dismissedAt);
    if (Number.isNaN(elapsed)) return true;
    return elapsed > FOUR_HOURS_MS;
  });

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
  };

  if (!isVisible) return null;

  return (
    <div className="bg-primary/10 border-b border-primary/20 p-3 relative">
      <div className="container mx-auto flex items-center justify-between gap-4 ui-text-body">
        <div className="flex items-center gap-2 text-primary">
          <Heart className="ui-icon fill-current" />
          <span className="font-medium">Free & Open Source</span>
        </div>
        <div className="flex-1 text-center md:text-left text-muted-foreground">
          Table Builder is free to use. If it saves you time, please consider supporting its development!
        </div>
        <div className="flex items-center gap-2">
            <Button asChild>
              <a 
                  href="https://buymeacoffee.com" 
                  target="_blank" 
                  rel="noreferrer"
                  className="gap-2"
              >
                  <Heart className="ui-icon fill-current" />
                  Donate
              </a>
            </Button>
            <button 
                onClick={handleDismiss}
                className="hover:bg-primary/10 rounded-full p-2 transition-colors"
                aria-label="Dismiss"
            >
                <X className="ui-icon text-muted-foreground" />
            </button>
        </div>
      </div>
    </div>
  );
}
