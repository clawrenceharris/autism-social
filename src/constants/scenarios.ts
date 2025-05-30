import { Dialogue } from "../types";
import { meetSomeoneMachine } from "../xstate/machines";

export const scenarios: Dialogue[] = [
  {
    id: 1,
    actor: { name: "Alex" },
    description:
      "Meeting new people and knowing what exactly to say can sometimes be difficult. Practice introducing yourself to a new face.",
    name: "Meet Someone New",
    machine: meetSomeoneMachine,
  },
];
