import { useEffect, useState } from "react";
import { getScenarios } from "../services/scenarios";
import type { Scenario } from "../types";

const useScenarios = () => {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
    fetchScenarios();
  }, []);

  return { scenarios, loading, error };
};

export default useScenarios;
