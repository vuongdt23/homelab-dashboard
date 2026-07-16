import { readFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { HostMetrics } from "@homelab/shared";

const execFileAsync = promisify(execFile);

/** Percentage of memory in use = (MemTotal - MemAvailable) / MemTotal. */
export function parseMemPercent(meminfo: string): number | null {
  const read = (key: string): number | null => {
    const m = meminfo.match(new RegExp(`^${key}:\\s+(\\d+)`, "m"));
    return m ? Number(m[1]) : null;
  };
  const total = read("MemTotal");
  const available = read("MemAvailable");
  if (total === null || available === null || total === 0) return null;
  return Math.round(((total - available) / total) * 100);
}

/** Parse the integer use% from the data line of `df -P <path>` output. */
export function parseDiskPercent(df: string): number | null {
  const line = df.trim().split("\n").at(-1) ?? "";
  const m = line.match(/(\d+)%/);
  return m ? Number(m[1]) : null;
}

export interface CpuTimes { total: number; idle: number; }

/** Parse the aggregate `cpu` line of /proc/stat into total and idle jiffies. */
export function parseCpuTimes(stat: string): CpuTimes | null {
  const line = stat.split("\n").find((l) => l.startsWith("cpu "));
  if (!line) return null;
  const nums = line.trim().split(/\s+/).slice(1).map(Number);
  if (nums.length < 5) return null;
  const total = nums.reduce((a, b) => a + b, 0);
  const idle = nums[3] + (nums[4] ?? 0); // idle + iowait
  return { total, idle };
}

/** Busy CPU % between two /proc/stat samples, or null if no time elapsed. */
export function cpuPercentBetween(a: CpuTimes, b: CpuTimes): number | null {
  const dTotal = b.total - a.total;
  const dIdle = b.idle - a.idle;
  if (dTotal <= 0) return null;
  return Math.round(((dTotal - dIdle) / dTotal) * 100);
}

/**
 * Read a full host metrics snapshot. `procDir` and `storagePath` are injectable
 * so the container can point them at the mounted host paths.
 */
export async function readHostMetrics(
  procDir = process.env.PROC_DIR ?? "/proc",
  storagePath = process.env.STORAGE_PATH ?? "/storage",
): Promise<HostMetrics> {
  const cpu = await readCpuPercent(procDir).catch(() => null);
  const ram = await readFile(`${procDir}/meminfo`, "utf8").then(parseMemPercent).catch(() => null);
  const uptimeSeconds = await readFile(`${procDir}/uptime`, "utf8")
    .then((t) => {
      const v = Number(t.split(/\s+/)[0]);
      return Number.isFinite(v) ? Math.round(v) : null;
    })
    .catch(() => null);
  const disk = await execFileAsync("df", ["-P", storagePath])
    .then(({ stdout }) => parseDiskPercent(stdout))
    .catch(() => null);
  return { cpu, ram, disk, uptimeSeconds };
}

async function readCpuPercent(procDir: string): Promise<number | null> {
  const a = parseCpuTimes(await readFile(`${procDir}/stat`, "utf8"));
  await new Promise((r) => setTimeout(r, 100));
  const b = parseCpuTimes(await readFile(`${procDir}/stat`, "utf8"));
  if (!a || !b) return null;
  return cpuPercentBetween(a, b);
}
