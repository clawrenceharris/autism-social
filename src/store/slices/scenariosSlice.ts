import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Scenario, CreateScenarioData } from '../../types';
import * as scenarioService from '../../services/scenarios';

interface ScenariosState {
  items: Record<string, Scenario>;
  ids: string[];
  loading: boolean;
  error: string | null;
  lastFetch: number | null;
  selectedScenarioId: string | null;
}

const initialState: ScenariosState = {
  items: {},
  ids: [],
  loading: false,
  error: null,
  lastFetch: null,
  selectedScenarioId: null,
};

// Async thunks
export const fetchScenarios = createAsyncThunk(
  'scenarios/fetchScenarios',
  async (_, { rejectWithValue }) => {
    try {
      const scenarios = await scenarioService.getScenarios();
      return scenarios || [];
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch scenarios');
    }
  }
);

export const fetchScenarioById = createAsyncThunk(
  'scenarios/fetchScenarioById',
  async (id: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { scenarios: ScenariosState };
      
      // Return cached scenario if it exists and is recent
      if (state.scenarios.items[id] && state.scenarios.lastFetch && 
          Date.now() - state.scenarios.lastFetch < 5 * 60 * 1000) {
        return state.scenarios.items[id];
      }
      
      const scenario = await scenarioService.getScenarioById(id);
      return scenario;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch scenario');
    }
  }
);

export const createScenario = createAsyncThunk(
  'scenarios/createScenario',
  async (data: CreateScenarioData, { rejectWithValue }) => {
    try {
      const scenario = await scenarioService.createScenario(data);
      return scenario;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create scenario');
    }
  }
);

export const updateScenario = createAsyncThunk(
  'scenarios/updateScenario',
  async ({ id, data }: { id: string; data: Partial<Scenario> }, { rejectWithValue }) => {
    try {
      const scenario = await scenarioService.updateScenario(id, data);
      return scenario;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update scenario');
    }
  }
);

export const deleteScenario = createAsyncThunk(
  'scenarios/deleteScenario',
  async (id: string, { rejectWithValue }) => {
    try {
      await scenarioService.deleteScenario(id);
      return id;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete scenario');
    }
  }
);

const scenariosSlice = createSlice({
  name: 'scenarios',
  initialState,
  reducers: {
    setSelectedScenario: (state, action: PayloadAction<string | null>) => {
      state.selectedScenarioId = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    invalidateCache: (state) => {
      state.lastFetch = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch scenarios
      .addCase(fetchScenarios.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchScenarios.fulfilled, (state, action) => {
        state.loading = false;
        state.items = {};
        state.ids = [];
        
        action.payload.forEach((scenario) => {
          state.items[scenario.id] = scenario;
          state.ids.push(scenario.id);
        });
        
        state.lastFetch = Date.now();
      })
      .addCase(fetchScenarios.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch scenario by ID
      .addCase(fetchScenarioById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchScenarioById.fulfilled, (state, action) => {
        state.loading = false;
        const scenario = action.payload;
        state.items[scenario.id] = scenario;
        
        if (!state.ids.includes(scenario.id)) {
          state.ids.push(scenario.id);
        }
        
        state.lastFetch = Date.now();
      })
      .addCase(fetchScenarioById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create scenario
      .addCase(createScenario.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createScenario.fulfilled, (state, action) => {
        state.loading = false;
        const scenario = action.payload;
        state.items[scenario.id] = scenario;
        state.ids.unshift(scenario.id); // Add to beginning
      })
      .addCase(createScenario.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update scenario
      .addCase(updateScenario.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateScenario.fulfilled, (state, action) => {
        state.loading = false;
        const scenario = action.payload;
        state.items[scenario.id] = scenario;
      })
      .addCase(updateScenario.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Delete scenario
      .addCase(deleteScenario.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteScenario.fulfilled, (state, action) => {
        state.loading = false;
        const id = action.payload;
        delete state.items[id];
        state.ids = state.ids.filter(scenarioId => scenarioId !== id);
        
        if (state.selectedScenarioId === id) {
          state.selectedScenarioId = null;
        }
      })
      .addCase(deleteScenario.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedScenario, clearError, invalidateCache } = scenariosSlice.actions;

// Selectors
export const selectAllScenarios = (state: { scenarios: ScenariosState }) => 
  state.scenarios.ids.map(id => state.scenarios.items[id]);

export const selectScenarioById = (state: { scenarios: ScenariosState }, id: string) => 
  state.scenarios.items[id];

export const selectSelectedScenario = (state: { scenarios: ScenariosState }) => 
  state.scenarios.selectedScenarioId ? state.scenarios.items[state.scenarios.selectedScenarioId] : null;

export const selectScenariosLoading = (state: { scenarios: ScenariosState }) => 
  state.scenarios.loading;

export const selectScenariosError = (state: { scenarios: ScenariosState }) => 
  state.scenarios.error;

export const selectScenariosCount = (state: { scenarios: ScenariosState }) => 
  state.scenarios.ids.length;

export default scenariosSlice.reducer;