import { useState, useEffect } from "react";
import type { Achievement } from "../types";
import {
  Award,
  Brain,
  Calendar,
  Heart,
  Lightbulb,
  MessageSquare,
  Target,
  Zap,
} from "lucide-react";
import { useProgressStore } from "../store/useProgressStore";
import useStreakStore from "../store/useStreakStore";

export const useAchievements = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const { categoryScores, progress } = useProgressStore();
  const { streakData } = useStreakStore();
  useEffect(() => {
    setAchievements([
      {
        id: "1",
        name: "First Dialogue Completed",
        description: "Successfully completed your first dialogue scenario",
        icon: <MessageSquare />,
        category: "milestone",
        earned: true,
        earnedDate: "May 15, 2025",
      },
      {
        id: "2",
        name: "Empathy Expert",
        description: "Achieved a score of 25+ in Empathy",
        icon: <Heart />,
        category: "skill",
        earned: (categoryScores.empathy || 0) >= 25,
        earnedDate:
          (categoryScores.empathy || 0) >= 25 ? "May 18, 2025" : undefined,
      },
      {
        id: "3",
        name: "3-Day Streak",
        description: "Practiced for 3 consecutive days",
        icon: <Calendar />,
        category: "streak",
        earned: (streakData?.longestStreak || 0) >= 3,
        earnedDate: "May 20, 2025",
      },
      {
        id: "4",
        name: "Clarity Champion",
        description: "Achieved a score of 25+ in Clarity",
        icon: <Lightbulb />,
        category: "skill",
        earned: (categoryScores.clarity || 0) >= 25,
        earnedDate:
          (categoryScores.clarity || 0) >= 25 ? "May 22, 2025" : undefined,
      },
      {
        id: "5",
        name: "Social Butterfly",
        description: "Completed 5 different dialogue scenarios",
        icon: <Zap />,
        category: "milestone",
        earned: progress.length > 5,
      },
      {
        id: "6",
        name: "Assertiveness Ace",
        description: "Achieved a score of 25+ in Assertiveness",
        icon: <Target />,
        category: "skill",
        earned: (categoryScores.assertiveness || 0) >= 25,
        earnedDate:
          (categoryScores.assertiveness || 0) >= 25
            ? Date.now().toLocaleString()
            : undefined,
      },
      {
        id: "7",
        name: "Social Awareness Master",
        description: "Achieved a score of 40+ in Social Awareness",
        icon: <Brain />,
        category: "mastery",
        earned: (categoryScores.social_awareness || 0) >= 40,
        earnedDate:
          (categoryScores.social_awareness || 0) >= 40
            ? "May 28, 2025"
            : undefined,
      },
      {
        id: "8",
        name: "Self-Advocacy Star",
        description: "Achieved a score of 25+ in Self-Advocacy",
        icon: <Award />,
        category: "skill",
        earned: (categoryScores.self_advocacy || 0) >= 25,
        earnedDate:
          (categoryScores.self_advocacy || 0) >= 25
            ? "May 30, 2025"
            : undefined,
      },
    ]);
  }, [categoryScores, progress.length, streakData?.longestStreak]);
  return {
    achievements,
  };
};

export default useAchievements;
