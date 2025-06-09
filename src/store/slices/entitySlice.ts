import type {
  ActionReducerMapBuilder,
  AsyncThunk,
  PayloadAction,
} from "@reduxjs/toolkit";
import type { RootState } from "../index";
export interface EntityState {
  loading: boolean;
  error: string | null;
}
export type GenericThunk = AsyncThunk<
  unknown,
  unknown,
  { state: RootState; rejectValue: unknown }
>;

export const defaultReducers = {
  setError: (state: EntityState, action: PayloadAction<unknown>) => {
    state.error =
      action.payload instanceof Error
        ? action.payload.message
        : String(action.payload);
    state.loading = false;
  },
  clearError: (state: EntityState) => {
    state.error = null;
  },
  setLoading: (state: EntityState, action: PayloadAction<boolean>) => {
    state.loading = action.payload;
  },
};

const defaultThunkReducer =
  <T extends EntityState>(thunks: GenericThunk[]) =>
  (builder: ActionReducerMapBuilder<T>) => {
    thunks.forEach((thunk) => {
      builder
        .addCase(thunk.rejected, (state, action) => {
          state.loading = false;
          state.error =
            action.payload instanceof Error
              ? action.payload.message
              : String(action.payload);
        })
        .addCase(thunk.pending, (state) => {
          state.loading = true;
        });
    });
    return builder;
  };

export default defaultThunkReducer;
