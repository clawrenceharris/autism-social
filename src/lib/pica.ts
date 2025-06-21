import { Pica } from "@picahq/ai";

export const pica = new Pica(import.meta.env.VITE_PICA_API_KEY, {
  connectors: ["*"],
});
