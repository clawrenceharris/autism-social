import { Award, Heart, Sun, Target, Users } from "lucide-react";
import type { ScoreCategory } from "../types";

export const formatCategoryName = (category: ScoreCategory): string => {
  return category
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const getCategoryIcon = (category: ScoreCategory) => {
  switch (category) {
    case "clarity":
      return <Sun size={16} />;
    case "empathy":
      return <Heart size={16} />;
    case "assertiveness":
      return <Target size={16} />;
    case "social_awareness":
      return <Users size={16} />;
    case "self_advocacy":
      return <Award size={16} />;
    default:
      return <></>;
  }
};
