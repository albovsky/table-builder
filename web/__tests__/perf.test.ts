import { describe, it, expect, beforeEach } from "vitest";
import { db } from "@/db/db";
import { runTravelBenchmark } from "@/lib/perfHarness";

describe("Performance harness", () => {
  beforeEach(async () => {
    await db.travel.clear();
  });

  it("runs benchmark and returns timings", async () => {
    const result = await runTravelBenchmark(20);
    expect(result.count).toBe(20);
    expect(result.seedMs).toBeGreaterThanOrEqual(0);
    expect(result.total).toBeGreaterThan(0);
    expect(await db.travel.count()).toBeGreaterThan(0);
  });
});
