import { describe, it, expect, vi, afterEach } from "vitest";
import { checkService, checkAll } from "../src/health.js";
import type { Service } from "@homelab/shared";

const svc: Service = {
  id: "x", name: "X", role: "r", port: 9999, icon: "i", accent: "#000",
};

afterEach(() => vi.restoreAllMocks());

describe("checkService", () => {
  it("returns up when the endpoint responds with any HTTP status", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(null, { status: 401 })));
    const result = await checkService("localhost", svc, 2000);
    expect(result).toEqual({ id: "x", status: "up" });
  });

  it("returns down when the fetch rejects (connection refused)", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("ECONNREFUSED"); }));
    const result = await checkService("localhost", svc, 2000);
    expect(result).toEqual({ id: "x", status: "down" });
  });

  it("returns down when the request exceeds the timeout", async () => {
    vi.stubGlobal("fetch", vi.fn((_url: string, opts: { signal?: AbortSignal }) =>
      new Promise((_resolve, reject) => {
        opts.signal?.addEventListener("abort", () => reject(new Error("aborted")));
      })
    ));
    const result = await checkService("localhost", svc, 50);
    expect(result).toEqual({ id: "x", status: "down" });
  });
});

describe("checkAll", () => {
  it("fans out probes in parallel and returns one result per service", async () => {
    const svcA: Service = { id: "a", name: "A", role: "r", port: 1111, icon: "i", accent: "#111" };
    const svcB: Service = { id: "b", name: "B", role: "r", port: 2222, icon: "i", accent: "#222" };

    vi.stubGlobal("fetch", vi.fn(async (url: string) => {
      if (url.includes("1111")) return new Response(null, { status: 200 });
      throw new Error("ECONNREFUSED");
    }));

    const results = await checkAll("localhost", [svcA, svcB], 2000);
    expect(results).toEqual([
      { id: "a", status: "up" },
      { id: "b", status: "down" },
    ]);
  });
});
