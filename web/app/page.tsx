import Link from "next/link";
import { ArrowUpRight, Download, Lock, Sparkles, Table2, Wand2, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const featureCards = [
  {
    title: "Continuous timelines, no surprises",
    description:
      "Live gap and overlap detection with clear ranges, plus one-click filler rows when something is missing.",
    icon: Wand2,
  },
  {
    title: "Travel + Address in one workspace",
    description:
      "Switch modes instantly, paste multi-row data, duplicate patterns, and keep both histories aligned.",
    icon: Table2,
  },
  {
    title: "Exports that match IRCC attachments",
    description:
      "Deterministic CSV and PDF with repeated headers, profile metadata, and clean typography.",
    icon: Download,
  },
  {
    title: "Local-first privacy",
    description:
      "Runs entirely in your browser with optional encrypted storage — no accounts, no uploads.",
    icon: Lock,
  },
];

const workflow = [
  {
    label: "01",
    title: "Build or import fast",
    description:
      "Start from blank, paste rows from a spreadsheet, or duplicate templates. Keyboard shortcuts stay familiar.",
  },
  {
    label: "02",
    title: "Resolve gaps instantly",
    description:
      "The validator highlights missing ranges, overlaps, and invalid dates so you can patch them before exporting.",
  },
  {
    label: "03",
    title: "Export ready-to-attach files",
    description:
      "Download CSV and PDF that match IRCC expectations — stable columns, page headers, and consistent footnotes.",
  },
];

const sampleTimeline = [
  {
    label: "Travel · Barcelona ➝ Calgary",
    range: "Jan 12 – Feb 02, 2024",
    status: "Validated",
  },
  {
    label: "Address · Calgary, AB",
    range: "Feb 03 – Present",
    status: "Continuous",
  },
  {
    label: "Travel · Montreal conference",
    range: "Mar 10 – Mar 16, 2024",
    status: "No gaps",
  },
];

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-32 h-80 bg-[radial-gradient(circle_at_top,_rgba(12,12,12,0.16),_transparent_60%)] dark:bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_60%)] blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-10 h-80 w-80 rounded-full bg-gradient-to-br from-primary/20 via-primary/5 to-transparent blur-3xl"
      />
      <header className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-6 lg:px-10">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-foreground/10 bg-primary/10 text-primary shadow-sm">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
              PR Document Helper
            </p>
            <p className="text-lg font-semibold">Table Builder</p>
          </div>
        </div>
        <div className="hidden items-center gap-2 md:flex">
          <Button asChild variant="ghost" size="sm">
            <Link href="#features">Features</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="#workflow">How it works</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/builder">
              Launch builder
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="md:hidden flex items-center gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href="/builder">Launch builder</Link>
          </Button>
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl px-6 pb-20 lg:px-10">
        <section className="grid items-center gap-12 pb-20 pt-8 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-foreground/5 px-4 py-2 text-sm font-medium text-foreground/80 backdrop-blur">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-primary">
                <Zap className="h-4 w-4" />
              </div>
              Fast, offline, export-ready
            </div>
            <div className="space-y-4">
              <h1 className="display-font text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                IRCC-ready tables without the spreadsheet grind.
              </h1>
              <p className="max-w-2xl text-lg text-muted-foreground">
                Build Travel and Address History side by side, catch gaps before they become problems, and export clean CSV/PDF files you can attach with confidence.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/builder">
                  Start building
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="#workflow">See how it works</Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-foreground/10 bg-card/70 p-4 shadow-sm backdrop-blur">
                <p className="text-sm text-muted-foreground">Performance</p>
                <p className="text-2xl font-semibold">2k+ rows</p>
                <p className="text-sm text-muted-foreground">Virtualized, keyboard-friendly editing.</p>
              </div>
              <div className="rounded-2xl border border-foreground/10 bg-card/70 p-4 shadow-sm backdrop-blur">
                <p className="text-sm text-muted-foreground">Validator</p>
                <p className="text-2xl font-semibold">Deterministic</p>
                <p className="text-sm text-muted-foreground">ISO dates, gaps and overlaps flagged instantly.</p>
              </div>
              <div className="rounded-2xl border border-foreground/10 bg-card/70 p-4 shadow-sm backdrop-blur">
                <p className="text-sm text-muted-foreground">Privacy</p>
                <p className="text-2xl font-semibold">Local-first</p>
                <p className="text-sm text-muted-foreground">No accounts, optional encrypted storage.</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-primary/20 via-primary/5 to-transparent blur-2xl" />
            <div className="absolute -right-6 bottom-6 h-40 w-40 rounded-full bg-gradient-to-br from-foreground/10 via-transparent to-transparent blur-3xl" />
            <div className="relative overflow-hidden rounded-3xl border border-foreground/10 bg-card/80 p-6 shadow-[0_20px_80px_-40px_rgba(0,0,0,0.45)] backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Profile coverage</p>
                  <p className="text-xl font-semibold">Continuous · 100%</p>
                </div>
                <Badge className="bg-primary/15 text-primary ring-1 ring-inset ring-primary/20">
                  Gap-free
                </Badge>
              </div>
              <div className="mt-6 space-y-3">
                {sampleTimeline.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-foreground/10 bg-background/60 px-4 py-3 shadow-xs"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                        {item.label}
                      </div>
                      <span className="text-xs uppercase tracking-wide text-muted-foreground">
                        {item.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{item.range}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-foreground/10 bg-foreground/5 p-4">
                  <p className="text-xs text-muted-foreground">Travel rows</p>
                  <p className="text-2xl font-semibold">243</p>
                  <p className="text-xs text-muted-foreground">Pasted from CSV in seconds.</p>
                </div>
                <div className="rounded-xl border border-foreground/10 bg-foreground/5 p-4">
                  <p className="text-xs text-muted-foreground">Validation checks</p>
                  <p className="text-2xl font-semibold">Gap, overlap, range</p>
                  <p className="text-xs text-muted-foreground">Deterministic ISO handling.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="space-y-8 pb-16">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Why this builder</p>
              <h2 className="display-font text-3xl font-semibold tracking-tight sm:text-4xl">
                Everything geared toward IRCC-style tables.
              </h2>
              <p className="max-w-2xl text-base text-muted-foreground">
                The app focuses on correctness and export quality — not generic spreadsheet features. Every control keeps timelines tight and exports predictable.
              </p>
            </div>
            <div className="rounded-full border border-foreground/10 bg-foreground/5 px-4 py-2 text-sm text-foreground/70">
              <span className="font-medium">Static-first</span> · deploy anywhere, no backend required
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {featureCards.map((feature) => (
              <div
                key={feature.title}
                className="group relative overflow-hidden rounded-2xl border border-foreground/10 bg-card/70 p-6 shadow-sm backdrop-blur transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="relative flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-foreground/10 bg-primary/10 text-primary shadow-xs">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-semibold leading-snug">{feature.title}</h3>
                </div>
                <p className="relative mt-3 text-base text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section
          id="workflow"
          className="relative overflow-hidden rounded-3xl border border-foreground/10 bg-gradient-to-br from-background via-foreground/[0.02] to-foreground/[0.04] px-6 py-10 shadow-[0_24px_120px_-60px_rgba(0,0,0,0.45)] sm:px-10"
        >
          <div className="absolute -left-10 top-6 h-24 w-24 rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute -right-12 -bottom-10 h-36 w-36 rounded-full bg-foreground/5 blur-3xl" />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Workflow</p>
              <h2 className="display-font text-3xl font-semibold tracking-tight sm:text-4xl">
                Built for continuous histories.
              </h2>
              <p className="max-w-xl text-base text-muted-foreground">
                From first row to final export, every step keeps your Travel and Address History aligned with IRCC expectations.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/builder">
                Launch builder
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="relative mt-8 grid gap-4 md:grid-cols-3">
            {workflow.map((step) => (
              <div
                key={step.label}
                className="rounded-2xl border border-foreground/10 bg-background/70 p-5 shadow-sm backdrop-blur"
              >
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  {step.label}
                </div>
                <h3 className="text-xl font-semibold">{step.title}</h3>
                <p className="mt-2 text-base text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="pt-16">
          <div className="relative overflow-hidden rounded-3xl border border-foreground/10 bg-card/80 px-6 py-10 shadow-[0_24px_120px_-60px_rgba(0,0,0,0.45)] sm:px-12">
            <div className="absolute -left-12 top-0 h-32 w-32 rounded-full bg-gradient-to-br from-primary/20 via-primary/5 to-transparent blur-3xl" />
            <div className="absolute right-0 -bottom-10 h-32 w-32 rounded-full bg-gradient-to-br from-foreground/10 via-transparent to-transparent blur-3xl" />
            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
                  Ready to submit
                </p>
                <h3 className="display-font text-3xl font-semibold tracking-tight sm:text-4xl">
                  Open the builder and finish your tables today.
                </h3>
                <p className="max-w-xl text-base text-muted-foreground">
                  Stay offline, validate continuously, and export attachment-ready files when you are done.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="/builder">
                    Launch builder
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="#features">Review features</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
