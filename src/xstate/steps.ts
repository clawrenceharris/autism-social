import { DialogueStep } from "../types";

export const meetSomeoneSteps: DialogueStep[] = [
  {
    id: "start",

    npc: "Hi! I don’t think we’ve met—I’m Alex.",
    options: [
      {
        label: "Hi Alex, I’m Jordan. Nice to meet you.",
        event: "GREET",
        next: "niceToMeet",
        scoreChanges: { clarity: 1, empathy: 1 },
      },
      {
        label: "Oh, yeah. I think I’ve seen you before maybe?",
        event: "VAGUE",
        next: "seenBefore",
        scoreChanges: { clarity: -1 },
      },
      {
        label: "[Stay silent]",
        event: "SILENT",
        next: "silentResponse",
        scoreChanges: { assertiveness: -1 },
      },
    ],
  },
  {
    id: "niceToMeet",
    npc: "Nice to meet you too! Are you new here?",
    options: [
      {
        label: "Yeah, just started last week.",
        event: "NEW_HERE",
        next: "end",
        scoreChanges: { clarity: 1, assertiveness: 1 },
      },
      {
        label: "No, I’ve been around, just quiet.",
        event: "BEEN_AROUND",
        next: "end",
        scoreChanges: { empathy: 1 },
      },
      {
        label: "Why do you ask?",
        event: "ASK_BACK",
        next: "end",
        scoreChanges: { clarity: -1 },
      },
    ],
  },
  {
    id: "seenBefore",
    npc: "Oh, maybe. What’s your name again?",
    options: [],
  },
  {
    id: "silentResponse",
    npc: "...Okay. Maybe I caught you at a bad time.",
    options: [],
  },
];
