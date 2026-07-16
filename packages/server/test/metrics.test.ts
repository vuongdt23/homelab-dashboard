import { describe, it, expect } from "vitest";
import {
  parseMemPercent,
  parseDiskPercent,
  parseCpuTimes,
  cpuPercentBetween,
} from "../src/metrics.js";

describe("parseMemPercent", () => {
  it("computes used memory percentage from /proc/meminfo text", () => {
    const meminfo = [
      "MemTotal:        8000000 kB",
      "MemFree:         1000000 kB",
      "MemAvailable:    2000000 kB",
      "Buffers:          100000 kB",
    ].join("\n");
    // used = total - available = 6,000,000 of 8,000,000 = 75%
    expect(parseMemPercent(meminfo)).toBe(75);
  });
});

describe("parseDiskPercent", () => {
  it("extracts the use% from `df -P` output", () => {
    const df = [
      "Filesystem     1024-blocks      Used Available Capacity Mounted on",
      "/dev/sdb1      12000000000 5600000000 6400000000      47% /storage",
    ].join("\n");
    expect(parseDiskPercent(df)).toBe(47);
  });
});

describe("parseCpuTimes", () => {
  it("sums total and idle jiffies from the aggregate cpu line", () => {
    // cpu  user nice system idle iowait irq softirq steal ...
    const stat = "cpu  100 0 50 800 20 0 30 0 0 0\ncpu0 1 2 3 4";
    const t = parseCpuTimes(stat);
    // total = 100+0+50+800+20+0+30 = 1000 ; idle = idle+iowait = 800+20 = 820
    expect(t).toEqual({ total: 1000, idle: 820 });
  });
});

describe("cpuPercentBetween", () => {
  it("computes busy percentage across two samples", () => {
    const a = { total: 1000, idle: 820 };
    const b = { total: 1100, idle: 830 }; // dTotal=100, dIdle=10 → busy 90/100 = 90%
    expect(cpuPercentBetween(a, b)).toBe(90);
  });

  it("returns null when there is no elapsed time", () => {
    const a = { total: 1000, idle: 820 };
    expect(cpuPercentBetween(a, a)).toBeNull();
  });
});
