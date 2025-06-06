import { useEffect, useState } from "react";
import { getScenarios } from "../services/scenarios";
import type { Scenario } from "../types";

const useScenarios = () => {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchScenarios = async () => {
    try {
      setLoading(true);
      const data = await getScenarios();
      setScenarios(data || []);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScenarios();
  }, []);

  const removeScenario = (id: string) => {
    setScenarios((prev) => prev.filter((scenario) => scenario.id !== id));
  };

  return { scenarios, loading, error, removeScenario };
};

export default useScenarios;
