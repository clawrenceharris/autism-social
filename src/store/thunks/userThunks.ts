import { createAsyncThunk } from "@reduxjs/toolkit";
import type { Goal, Interest, UserProfile } from "../../types";
import * as userService from "../../services/user";

// Async thunks
const fetchUserById = createAsyncThunk<UserProfile, { userId: string }>(
  "user/fetchUser",
  async ({ userId }, { rejectWithValue }) => {
    try {
      const user = await userService.getUserById(userId);
      if (!user) {
        throw new Error("User not found");
      }
      return user;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch scenarios"
      );
    }
  }
);
const fetchUserGoals = createAsyncThunk<Goal[], { userId: string }>(
  "user/fetchUserGoals",
  async ({ userId }, { rejectWithValue }) => {
    try {
      const goals = await userService.getUserGoals(userId);

      return goals;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch user goals"
      );
    }
  }
);

const fetchUserInterests = createAsyncThunk<Interest[], { userId: string }>(
  "user/fetchUserInterests",
  async ({ userId }, { rejectWithValue }) => {
    try {
      const goals = await userService.getUserInterests(userId);

      return goals;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Failed to fetch user interests"
      );
    }
  }
);

const createUser = createAsyncThunk<
  UserProfile,
  { data: userService.CreateUserProfileData }
>("user/createUser", async ({ data }, { rejectWithValue }) => {
  try {
    const user = await userService.createUser(data);
    return user;
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : "Failed to create scenario"
    );
  }
});

const updateUser = createAsyncThunk<
  UserProfile,
  { id: string; data: userService.UpdateUserProfileData }
>("user/updateUser", async ({ id, data }, { rejectWithValue }) => {
  try {
    const user = await userService.updateUser(id, data);
    return user;
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : "Failed to update scenario"
    );
  }
});

const deleteUser = createAsyncThunk(
  "user/deleteUser",
  async (id: string, { rejectWithValue }) => {
    try {
      await userService.deleteUser(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to delete scenario"
      );
    }
  }
);

export const userThunks = {
  fetchUserById,
  updateUser,
  createUser,
  deleteUser,
  fetchUserGoals,
  fetchUserInterests,
};
