"use client";

import { Settings, Heart, Bug, Keyboard } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { useStore } from "@/store/useStore";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DONATE_URL = "https://buymeacoffee.com";
const BUG_URL = "https://github.com/your-org/your-repo/issues/new?template=bug_report.md";

export function SettingsMenu() {
  const { resolvedTheme, setTheme } = useTheme();
  const { layoutMode, setLayoutMode } = useStore();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label="Open settings"
          title="Settings"
        >
          <Settings className="h-[1.1rem] w-[1.1rem]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[380px] p-4 space-y-4">
        <div className="bg-muted/40 rounded-xl border border-border/60 p-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground uppercase tracking-wide">Support the project</p>
            <p className="text-lg font-semibold leading-tight">Table Builder stays free with your help.</p>
            <p className="ui-text-label text-muted-foreground">
              Donate to keep hosting, maintenance, and new features coming.
            </p>
          </div>
          <Button asChild className="mt-4 gap-2">
            <a href={DONATE_URL} target="_blank" rel="noreferrer">
              <Heart className="h-4 w-4" />
              Donate
            </a>
          </Button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <span className="ui-text-label text-muted-foreground whitespace-nowrap">Theme</span>
            <Tabs
              value={resolvedTheme === "dark" ? "dark" : "light"}
              onValueChange={(val) => setTheme(val === "dark" ? "dark" : "light")}
              className="w-[260px]"
            >
              <TabsList className="bg-background gap-1 border p-1 w-full">
                <TabsTrigger
                  value="light"
                  className="data-[state=active]:bg-primary dark:data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:text-primary-foreground dark:data-[state=active]:border-transparent"
                >
                  Light
                </TabsTrigger>
                <TabsTrigger
                  value="dark"
                  className="data-[state=active]:bg-primary dark:data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:text-primary-foreground dark:data-[state=active]:border-transparent"
                >
                  Dark
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="ui-text-label text-muted-foreground whitespace-nowrap">Layout</span>
            <Tabs
              value={layoutMode === "wide" ? "wide" : "centered"}
              onValueChange={(val) => setLayoutMode(val as "centered" | "wide")}
              className="w-[260px]"
            >
              <TabsList className="bg-background gap-1 border p-1 w-full">
                <TabsTrigger
                  value="wide"
                  className="data-[state=active]:bg-primary dark:data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:text-primary-foreground dark:data-[state=active]:border-transparent"
                >
                  Wide
                </TabsTrigger>
                <TabsTrigger
                  value="centered"
                  className="data-[state=active]:bg-primary dark:data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:text-primary-foreground dark:data-[state=active]:border-transparent"
                >
                  Narrow
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <div className="space-y-2">
          <p className="ui-text-label text-muted-foreground">Shortcuts</p>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 gap-3 justify-between hover:bg-muted/70 focus:bg-muted/70 transition">
              <div className="flex items-center gap-3">
                <Keyboard className="h-4 w-4" />
                <span className="font-medium">Open cheatsheet</span>
              </div>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="p-3 w-[320px] space-y-2">
              <p className="ui-text-label text-muted-foreground">Shortcuts</p>
              <div className="grid grid-cols-1 gap-1 text-sm">
                <div className="flex items-center justify-between">
                  <span>Add entry</span>
                  <code className="px-2 py-1 rounded bg-muted text-xs">Shift + Cmd/Ctrl + N</code>
                </div>
                <div className="flex items-center justify-between">
                  <span>Undo</span>
                  <code className="px-2 py-1 rounded bg-muted text-xs">Cmd/Ctrl + Z</code>
                </div>
                <div className="flex items-center justify-between">
                  <span>Redo</span>
                  <code className="px-2 py-1 rounded bg-muted text-xs">Shift + Cmd/Ctrl + Z</code>
                </div>
                <div className="flex items-center justify-between">
                  <span>Delete last row</span>
                  <code className="px-2 py-1 rounded bg-muted text-xs">Cmd/Ctrl + ⌫</code>
                </div>
                <div className="flex items-center justify-between">
                  <span>Duplicate last row</span>
                  <code className="px-2 py-1 rounded bg-muted text-xs">Cmd/Ctrl + D</code>
                </div>
                <div className="flex items-center justify-between">
                  <span>Switch tab</span>
                  <code className="px-2 py-1 rounded bg-muted text-xs">Cmd/Ctrl + [ / ]</code>
                </div>
                <div className="flex items-center justify-between">
                  <span>Open validation</span>
                  <code className="px-2 py-1 rounded bg-muted text-xs">Shift + Cmd/Ctrl + V</code>
                </div>
              </div>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </div>

        <DropdownMenuSeparator />

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Bug className="h-4 w-4" />
            <span className="ui-text-label">Found a bug?</span>
          </div>
          <Button asChild variant="outline" className="gap-2">
            <a href={BUG_URL} target="_blank" rel="noreferrer">
              Report
            </a>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
