import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Dialogue, CreateDialogueData } from '../../types';
import * as dialogueService from '../../services/dialogues';

interface DialoguesState {
  items: Record<string, Dialogue>;
  ids: string[];
  byScenario: Record<string, string[]>;
  loading: boolean;
  error: string | null;
  lastFetch: Record<string, number>;
  selectedDialogueId: string | null;
}

const initialState: DialoguesState = {
  items: {},
  ids: [],
  byScenario: {},
  loading: false,
  error: null,
  lastFetch: {},
  selectedDialogueId: null,
};

// Async thunks
export const fetchAllDialogues = createAsyncThunk(
  'dialogues/fetchAllDialogues',
  async (_, { rejectWithValue }) => {
    try {
      const dialogues = await dialogueService.getAllDialogues();
      return dialogues || [];
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch dialogues');
    }
  }
);

export const fetchScenarioDialogues = createAsyncThunk(
  'dialogues/fetchScenarioDialogues',
  async (scenarioId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { dialogues: DialoguesState };
      
      // Return cached dialogues if they exist and are recent
      if (state.dialogues.byScenario[scenarioId] && 
          state.dialogues.lastFetch[scenarioId] && 
          Date.now() - state.dialogues.lastFetch[scenarioId] < 5 * 60 * 1000) {
        return {
          scenarioId,
          dialogues: state.dialogues.byScenario[scenarioId].map(id => state.dialogues.items[id])
        };
      }
      
      const dialogues = await dialogueService.getScenarioDialogues(scenarioId);
      return { scenarioId, dialogues: dialogues || [] };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch scenario dialogues');
    }
  }
);

export const fetchDialogueById = createAsyncThunk(
  'dialogues/fetchDialogueById',
  async (id: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { dialogues: DialoguesState };
      
      // Return cached dialogue if it exists and is recent
      if (state.dialogues.items[id] && state.dialogues.lastFetch[id] && 
          Date.now() - state.dialogues.lastFetch[id] < 5 * 60 * 1000) {
        return state.dialogues.items[id];
      }
      
      const dialogue = await dialogueService.getDialogueById(id);
      return dialogue;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch dialogue');
    }
  }
);

export const createDialogue = createAsyncThunk(
  'dialogues/createDialogue',
  async (data: CreateDialogueData, { rejectWithValue }) => {
    try {
      const dialogue = await dialogueService.createDialogue(data);
      return dialogue;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create dialogue');
    }
  }
);

export const updateDialogue = createAsyncThunk(
  'dialogues/updateDialogue',
  async ({ id, data }: { id: string; data: Partial<Dialogue> }, { rejectWithValue }) => {
    try {
      const dialogue = await dialogueService.updateDialogue(id, data);
      return dialogue;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update dialogue');
    }
  }
);

export const deleteDialogue = createAsyncThunk(
  'dialogues/deleteDialogue',
  async (id: string, { rejectWithValue }) => {
    try {
      await dialogueService.deleteDialogue(id);
      return id;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete dialogue');
    }
  }
);

const dialoguesSlice = createSlice({
  name: 'dialogues',
  initialState,
  reducers: {
    setSelectedDialogue: (state, action: PayloadAction<string | null>) => {
      state.selectedDialogueId = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    invalidateCache: (state, action: PayloadAction<string | undefined>) => {
      if (action.payload) {
        // Invalidate specific scenario cache
        delete state.lastFetch[action.payload];
      } else {
        // Invalidate all cache
        state.lastFetch = {};
      }
    },
    addDialogueToScenario: (state, action: PayloadAction<{ scenarioId: string; dialogue: Dialogue }>) => {
      const { scenarioId, dialogue } = action.payload;
      state.items[dialogue.id] = dialogue;
      
      if (!state.ids.includes(dialogue.id)) {
        state.ids.push(dialogue.id);
      }
      
      if (!state.byScenario[scenarioId]) {
        state.byScenario[scenarioId] = [];
      }
      
      if (!state.byScenario[scenarioId].includes(dialogue.id)) {
        state.byScenario[scenarioId].unshift(dialogue.id);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all dialogues
      .addCase(fetchAllDialogues.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllDialogues.fulfilled, (state, action) => {
        state.loading = false;
        state.items = {};
        state.ids = [];
        state.byScenario = {};
        
        action.payload.forEach((dialogue) => {
          state.items[dialogue.id] = dialogue;
          state.ids.push(dialogue.id);
          
          if (!state.byScenario[dialogue.scenario_id]) {
            state.byScenario[dialogue.scenario_id] = [];
          }
          state.byScenario[dialogue.scenario_id].push(dialogue.id);
        });
        
        state.lastFetch['all'] = Date.now();
      })
      .addCase(fetchAllDialogues.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch scenario dialogues
      .addCase(fetchScenarioDialogues.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchScenarioDialogues.fulfilled, (state, action) => {
        state.loading = false;
        const { scenarioId, dialogues } = action.payload;
        
        // Clear existing scenario dialogues
        if (state.byScenario[scenarioId]) {
          state.byScenario[scenarioId].forEach(id => {
            delete state.items[id];
            state.ids = state.ids.filter(dialogueId => dialogueId !== id);
          });
        }
        
        state.byScenario[scenarioId] = [];
        
        dialogues.forEach((dialogue) => {
          state.items[dialogue.id] = dialogue;
          
          if (!state.ids.includes(dialogue.id)) {
            state.ids.push(dialogue.id);
          }
          
          state.byScenario[scenarioId].push(dialogue.id);
        });
        
        state.lastFetch[scenarioId] = Date.now();
      })
      .addCase(fetchScenarioDialogues.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch dialogue by ID
      .addCase(fetchDialogueById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDialogueById.fulfilled, (state, action) => {
        state.loading = false;
        const dialogue = action.payload;
        state.items[dialogue.id] = dialogue;
        
        if (!state.ids.includes(dialogue.id)) {
          state.ids.push(dialogue.id);
        }
        
        // Add to scenario mapping
        if (!state.byScenario[dialogue.scenario_id]) {
          state.byScenario[dialogue.scenario_id] = [];
        }
        if (!state.byScenario[dialogue.scenario_id].includes(dialogue.id)) {
          state.byScenario[dialogue.scenario_id].push(dialogue.id);
        }
        
        state.lastFetch[dialogue.id] = Date.now();
      })
      .addCase(fetchDialogueById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create dialogue
      .addCase(createDialogue.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDialogue.fulfilled, (state, action) => {
        state.loading = false;
        const dialogue = action.payload;
        state.items[dialogue.id] = dialogue;
        state.ids.unshift(dialogue.id);
        
        if (!state.byScenario[dialogue.scenario_id]) {
          state.byScenario[dialogue.scenario_id] = [];
        }
        state.byScenario[dialogue.scenario_id].unshift(dialogue.id);
      })
      .addCase(createDialogue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update dialogue
      .addCase(updateDialogue.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDialogue.fulfilled, (state, action) => {
        state.loading = false;
        const dialogue = action.payload;
        state.items[dialogue.id] = dialogue;
      })
      .addCase(updateDialogue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Delete dialogue
      .addCase(deleteDialogue.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteDialogue.fulfilled, (state, action) => {
        state.loading = false;
        const id = action.payload;
        const dialogue = state.items[id];
        
        if (dialogue) {
          // Remove from scenario mapping
          if (state.byScenario[dialogue.scenario_id]) {
            state.byScenario[dialogue.scenario_id] = state.byScenario[dialogue.scenario_id]
              .filter(dialogueId => dialogueId !== id);
          }
        }
        
        delete state.items[id];
        state.ids = state.ids.filter(dialogueId => dialogueId !== id);
        
        if (state.selectedDialogueId === id) {
          state.selectedDialogueId = null;
        }
      })
      .addCase(deleteDialogue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  setSelectedDialogue, 
  clearError, 
  invalidateCache, 
  addDialogueToScenario 
} = dialoguesSlice.actions;

// Selectors
export const selectAllDialogues = (state: { dialogues: DialoguesState }) => 
  state.dialogues.ids.map(id => state.dialogues.items[id]);

export const selectDialogueById = (state: { dialogues: DialoguesState }, id: string) => 
  state.dialogues.items[id];

export const selectDialoguesByScenario = (state: { dialogues: DialoguesState }, scenarioId: string) => 
  (state.dialogues.byScenario[scenarioId] || []).map(id => state.dialogues.items[id]);

export const selectSelectedDialogue = (state: { dialogues: DialoguesState }) => 
  state.dialogues.selectedDialogueId ? state.dialogues.items[state.dialogues.selectedDialogueId] : null;

export const selectDialoguesLoading = (state: { dialogues: DialoguesState }) => 
  state.dialogues.loading;

export const selectDialoguesError = (state: { dialogues: DialoguesState }) => 
  state.dialogues.error;

export const selectDialoguesCount = (state: { dialogues: DialoguesState }) => 
  state.dialogues.ids.length;

export const selectDialoguesCountByScenario = (state: { dialogues: DialoguesState }, scenarioId: string) => 
  (state.dialogues.byScenario[scenarioId] || []).length;

export default dialoguesSlice.reducer;