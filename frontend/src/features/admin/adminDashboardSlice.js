import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosClient from "../../app/axiosClient";

const initialState = {
  data: null,
  isLoading: false,
  error: null,
};

export const fetchAdminDashboard = createAsyncThunk(
  "adminDashboard/fetchAdminDashboard",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosClient.get("/admin/dashboard");
      return res.data;
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to load dashboard";
      return rejectWithValue(msg);
    }
  }
);

const adminDashboardSlice = createSlice({
  name: "adminDashboard",
  initialState,
  reducers: {
    clearAdminDashboardError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminDashboard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminDashboard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(fetchAdminDashboard.rejected, (state, action) => {
        state.isLoading = false;
        state.data = null;
        state.error = action.payload || "Failed to load dashboard";
      });
  },
});

export const { clearAdminDashboardError } = adminDashboardSlice.actions;
export default adminDashboardSlice.reducer;
