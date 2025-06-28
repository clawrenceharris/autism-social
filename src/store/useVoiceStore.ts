import { create } from "zustand";
import { persist } from "zustand/middleware";
import { elevenlabs } from "../lib/elevenlabs";
import type { Voice } from "@elevenlabs/elevenlabs-js/api";

interface VoiceStore {
  voices?: Record<string, Voice>;
  ids: string[];
  selectedVoice: Voice | null;
  setVoice: (voice: Voice) => void;
  fetchVoices: () => void;
  error: string | null;
  loading: boolean;
  getAudioUrl: (id: string, text: string) => Promise<string>;
}

export const useVoiceStore = create<VoiceStore>()(
  persist(
    (set, get) => ({
      voices: undefined,
      ids: [],
      error: null,
      selectedVoice: null,
      loading: false,
      fetchVoices: async () => {
        if (get().voices) return;
        try {
          const { voices } = await elevenlabs.voices.getAll();
          set({
            voices: voices.reduce<Record<string, Voice>>((acc, voice) => {
              acc[voice.voiceId] = voice;
              return acc;
            }, {}),
          });
        } catch {
          set({ error: "Failed to fetch voices" });
        }
      },

      setVoice: (voice: Voice) => {
        set({ selectedVoice: voice });
      },

      getAudioUrl: async (voiceId: string, text: string): Promise<string> => {
        try {
          set({ loading: true });

          const response = await fetch(
            `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
            {
              method: "POST",
              headers: {
                "xi-api-key": import.meta.env.VITE_ELEVENLABS_API_KEY!,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                text,
                model_id: "eleven_multilingual_v2",

                seed: 42,
              }),
            }
          );

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const blob = await response.blob();
          const audioUrl = URL.createObjectURL(blob);
          return audioUrl;
        } catch (err) {
          set({ error: "Could not create Dialogue voice." });
          throw new Error(
            `Could not create Dialogue voice: ${
              err instanceof Error
                ? err.message
                : String(err) || "An unknown error occurred."
            }`
          );
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: "voice-storage",
      partialize: (state) => ({
        voices: state.voices,
        selectedVoice: state.selectedVoice,
        ids: state.ids,
      }),
    }
  )
);
