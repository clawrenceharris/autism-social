import { createDialogueMachine } from "./createDialogueMachine";
import { meetSomeoneSteps } from "./steps";

export const meetSomeoneMachine = createDialogueMachine("1", meetSomeoneSteps);
