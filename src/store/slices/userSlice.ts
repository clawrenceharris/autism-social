import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { UserProfile, Goal, Interest } from "../../types";
import defaultThunkReducer, {
  defaultReducers,
  type EntityState,
  type GenericThunk,
} from "./entitySlice";
import { userThunks } from "../thunks/userThunks";

interface UserState extends EntityState {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  goals: Goal[];
  interests: Interest[];
}

const initialState: UserState = {
  user: null,
  loading: false,
  error: null,
  goals: [],
  interests: [],
};

const thunkReducer = defaultThunkReducer<UserState>(
  Object.values(userThunks) as GenericThunk[]
);
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserProfile | null>) => {
      state.user = action.payload;
    },
    ...defaultReducers,
  },
  extraReducers: (builder) => {
    thunkReducer(builder).addCase(
      userThunks.fetchUserById.fulfilled,
      (state: UserState, action: PayloadAction<UserProfile>) => {
        state.loading = false;
        state.error = null;
        state.user = action.payload;
      }
    );
  },
});

export const { setUser, setLoading, setError, clearError } = userSlice.actions;

export const selectUserGoalById = (
  state: { scenarios: UserState },
  id: string
) => state.scenarios.goals.find((g) => g.id === id);

export default userSlice.reducer;
