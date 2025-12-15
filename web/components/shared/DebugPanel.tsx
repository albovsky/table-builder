"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bug, Gauge, Database } from "lucide-react";
import { runTravelBenchmarkWithOptions, type BenchmarkResult } from "@/lib/perfHarness";
import { db } from "@/db/db";
import { generateTravelEntries } from "@/lib/generateDataset";
import { Checkbox } from "@/components/ui/checkbox";
import { useStore } from "@/store/useStore";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export function DebugPanel() {
  const [open, setOpen] = useState(false);
  const [benchmark, setBenchmark] = useState<BenchmarkResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [seedInfo, setSeedInfo] = useState<string | null>(null);
  const [cleanAfter, setCleanAfter] = useState(false);
  const perfMode = useStore((s) => s.perfMode);
  const setPerfMode = useStore((s) => s.setPerfMode);
  const [benchMode, setBenchMode] = useState<"db" | "ui">("db");
  const [useTx, setUseTx] = useState(true);

  const handleBenchmark = async () => {
    setIsRunning(true);
    const res = await runTravelBenchmarkWithOptions({
      count: 2000,
      mode: benchMode,
      useTransaction: useTx,
    });
    if (cleanAfter) {
      await db.travel.clear();
    }
    setBenchmark(res);
    setIsRunning(false);
  };

  const handleSeed = async () => {
    setIsRunning(true);
    setSeedInfo(null);
    await db.travel.clear();
    const seedData = generateTravelEntries(2000);
    await db.travel.bulkAdd(seedData);
    if (cleanAfter) {
      await db.travel.clear();
    } else {
      setSeedInfo("Seeded 2000 travel rows.");
    }
    setIsRunning(false);
  };

  return (
    <Sheet modal={false} open={open} onOpenChange={setOpen}>
      <div className="fixed bottom-4 left-4 z-50">
        <SheetTrigger asChild>
          <Button variant="outline" className="rounded-full shadow-lg gap-2" size="lg">
            <Bug className="h-4 w-4" />
            Debug
          </Button>
        </SheetTrigger>
      </div>

      <SheetContent side="left" className="w-[360px] sm:w-[420px] p-0 flex flex-col">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5" />
            Debug / Benchmark
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="flex-1 p-4 space-y-4">
          <div className="space-y-2">
            <p className="ui-text-label text-muted-foreground">Performance mode</p>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={perfMode} onCheckedChange={(v) => setPerfMode(!!v)} />
              <span className="text-muted-foreground">Skip snapshots (dev only)</span>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={cleanAfter} onCheckedChange={(v) => setCleanAfter(!!v)} />
              <span className="text-muted-foreground">Clean seeded rows after run</span>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={useTx} onCheckedChange={(v) => setUseTx(!!v)} />
              <span className="text-muted-foreground">Use transaction for ops</span>
            </label>
          </div>

          <div className="space-y-2">
            <p className="ui-text-label text-muted-foreground">Data seeding</p>
            <Button variant="outline" onClick={handleSeed} disabled={isRunning} className="gap-2 w-full">
              <Database className="h-4 w-4" />
              {isRunning ? "Working..." : "Seed 2000 travel rows"}
            </Button>
            {seedInfo && <p className="text-xs text-muted-foreground">{seedInfo}</p>}
          </div>

          <div className="space-y-2">
            <p className="ui-text-label text-muted-foreground">Benchmark</p>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-[140px] justify-between">
                    <span>{benchMode === "db" ? "DB path" : "UI path"}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => setBenchMode("db")}>DB path</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setBenchMode("ui")}>UI path</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button onClick={handleBenchmark} disabled={isRunning} className="flex-1">
                {isRunning ? "Benchmarking..." : "Run benchmark (n=2000)"}
              </Button>
            </div>
            {benchmark && (
              <div className="text-sm leading-tight space-y-1 border rounded-lg p-3 bg-muted/30">
                <div className="font-semibold text-foreground">Benchmark (n={benchmark.count})</div>
                <div>Seed: {benchmark.seedMs.toFixed(1)} ms</div>
                <div>Add: {benchmark.addMs.toFixed(1)} ms</div>
                <div>Duplicate: {benchmark.duplicateMs.toFixed(1)} ms</div>
                <div>Delete: {benchmark.deleteMs.toFixed(1)} ms</div>
                <div>Render: {benchmark.renderMs.toFixed(1)} ms</div>
                <div>Total: {benchmark.total.toFixed(1)} ms</div>
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
