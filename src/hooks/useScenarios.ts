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
      const scenarios = await getScenarios();
      setScenarios(scenarios || []);
      setLoading(false);
    } catch (error: any) {
      setError(error);
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