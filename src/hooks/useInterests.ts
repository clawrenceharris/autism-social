import { useState, useEffect } from "react";
import { getInterests } from "../services/interests";
import type { Interest } from "../types";

export const useInterests = () => {
  const [interests, setInterests] = useState<Interest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInterests = async () => {
      try {
        setLoading(true);
        const data = await getInterests();
        setInterests(data);
      } catch (err) {
        setError("Failed to load interests. Please try again.");
        console.error("Error fetching interests:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInterests();
  }, []);

  return { interests, loading, error };
};