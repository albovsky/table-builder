"use client";

import { ShieldCheck } from "lucide-react";

export function PrivacyDisclaimer() {
  return (
    <div className="py-4 text-center ui-text-label text-muted-foreground border-t bg-muted/20">
      <div className="container mx-auto flex items-center justify-center gap-2">
        <ShieldCheck className="ui-icon-sm" />
        <p>
          Your data is stored <strong>locally in your browser</strong>. 
          We do not transmit, analyze, or store your personal information on our servers.
        </p>
      </div>
    </div>
  );
}
