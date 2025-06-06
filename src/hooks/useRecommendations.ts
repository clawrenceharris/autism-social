import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getRecommendedScenarios, type RecommendedScenario } from "../services/recommendations";

export const useRecommendations = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<RecommendedScenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!user) {
        setRecommendations([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getRecommendedScenarios(user.id);
        setRecommendations(data);
      } catch (err) {
        setError("Failed to load recommendations. Please try again.");
        console.error("Error fetching recommendations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [user]);

  return { recommendations, loading, error };
};