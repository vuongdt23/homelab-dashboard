import { useCallback, useEffect, useState } from "react";
import type { WhaleFact } from "@homelab/shared";

const WAAS_URL = "https://vuongdt23.github.io/WaaS/api/facts.json";

export function useWhaleFact(): { fact: WhaleFact | null; reroll: () => void } {
  const [facts, setFacts] = useState<WhaleFact[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    fetch(WAAS_URL)
      .then((r) => r.json())
      .then((all: WhaleFact[]) => {
        setFacts(all);
        if (all.length > 0) setIndex(Math.floor(Math.random() * all.length));
      })
      .catch(() => setFacts([]));
  }, []);

  const reroll = useCallback(() => {
    if (facts.length > 0) setIndex(Math.floor(Math.random() * facts.length));
  }, [facts]);

  return { fact: facts[index] ?? null, reroll };
}
