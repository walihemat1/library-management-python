import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosClient from "../../app/axiosClient";

const initialState = {
  userItems: [],
  viewingUserId: null,

  bookItems: [],
  viewingBookId: null,

  adminItems: [],

  isLoading: false,
  error: null,
};

export const fetchUserHistory = createAsyncThunk(
  "history/fetchUserHistory",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await axiosClient.get(`/users/history/${userId}`);
      return { userId, items: Array.isArray(res.data) ? res.data : [] };
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to load user history";
      return rejectWithValue(msg);
    }
  }
);

export const fetchBookHistory = createAsyncThunk(
  "history/fetchBookHistory",
  async (bookId, { rejectWithValue }) => {
    try {
      const res = await axiosClient.get(`/books/history/${bookId}`);
      return { bookId, items: Array.isArray(res.data) ? res.data : [] };
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to load book history";
      return rejectWithValue(msg);
    }
  }
);

// /admin/history (admin only)
export const fetchAllHistory = createAsyncThunk(
  "history/fetchAllHistory",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosClient.get(`/admin/history`);
      return Array.isArray(res.data) ? res.data : [];
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to load admin history";
      return rejectWithValue(msg);
    }
  }
);

const historySlice = createSlice({
  name: "history",
  initialState,
  reducers: {
    clearHistoryError: (state) => {
      state.error = null;
    },
    clearHistory: (state) => {
      state.userItems = [];
      state.viewingUserId = null;
      state.bookItems = [];
      state.viewingBookId = null;
      state.adminItems = [];
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // user history
      .addCase(fetchUserHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userItems = action.payload.items;
        state.viewingUserId = action.payload.userId;
      })
      .addCase(fetchUserHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.userItems = [];
        state.viewingUserId = null;
        state.error = action.payload || "Failed to load user history";
      })

      // book history
      .addCase(fetchBookHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBookHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bookItems = action.payload.items;
        state.viewingBookId = action.payload.bookId;
      })
      .addCase(fetchBookHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.bookItems = [];
        state.viewingBookId = null;
        state.error = action.payload || "Failed to load book history";
      })

      .addCase(fetchAllHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.adminItems = action.payload;
      })
      .addCase(fetchAllHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.adminItems = [];
        state.error = action.payload || "Failed to load admin history";
      });
  },
});

export const { clearHistoryError, clearHistory } = historySlice.actions;
export default historySlice.reducer;
