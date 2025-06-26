import type { UserRank } from "../types";
import { assets } from "./assets";

export const RANKS: UserRank[] = [
  {
    level: 1,
    title: "Beginner",
    minPoints: 0,
    maxPoints: 9,
    icon: <img src={assets.badge1} alt="Level 1 Badge" />,
    color: "#F9B200",
  },
  {
    level: 2,
    title: "Initiate",
    minPoints: 10,
    maxPoints: 49,
    icon: <img src={assets.badge2} alt="Level 2 Badge" />,
    color: "lightgreen",
  },
  {
    level: 2,
    title: "Apprentice",
    minPoints: 50,
    maxPoints: 79,
    icon: <img src={assets.badge3} alt="Level 3 Badge" />,
    color: "lightgreen",
  },
  {
    level: 4,
    title: "Adept",
    minPoints: 120,
    maxPoints: 199,
    icon: <img src={assets.badge4} alt="Level 4 Badge" />,
    color: "gold",
  },
  {
    level: 5,
    title: "Expert",
    minPoints: 200,
    maxPoints: 399,
    icon: <img src={assets.badge5} alt="Level 5 Badge" />,
    color: "#3b82f6",
  },
  {
    level: 6,
    title: "Master",
    minPoints: 400,
    maxPoints: 599,
    icon: <img src={assets.badge6} alt="Level 6 Badge" />,
    color: "#8b5cf6",
  },
  {
    level: 7,
    title: "Grandmaster",
    minPoints: 600,
    maxPoints: 799,
    icon: <img src={assets.badge7} alt="Level 7 Badge" />,
    color: "#a855f7",
  },
  {
    level: 9,
    title: "Virtuoso",
    minPoints: 1000,
    maxPoints: 1499,
    icon: <img src={assets.badge8} alt="Level 8 Badge" />,
    color: "#f59e0b",
  },

  {
    level: 10,
    title: "Luminary",
    minPoints: 2000,
    maxPoints: Infinity,
    icon: <img src={assets.badge9} alt="Level 9 Badge" />,
    color: "#c893fb",
  },
];
