import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import axiosClient from "../../app/axiosClient";

const initialState = {
  isLoading: false,
  error: null,
};

// PUT /me
export const updateMyProfile = createAsyncThunk(
  "profile/updateMyProfile",
  async ({ name, email }, { rejectWithValue, dispatch }) => {
    try {
      const res = await axiosClient.put("/me", { name, email });
      toast.success(res.data?.message || "Profile updated");

      return res.data?.user || null;
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to update profile";
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

// PUT /me/password
export const changeMyPassword = createAsyncThunk(
  "profile/changeMyPassword",
  async ({ current_password, new_password }, { rejectWithValue }) => {
    try {
      const res = await axiosClient.put("/me/password", {
        current_password,
        new_password,
      });
      toast.success(res.data?.message || "Password updated");
      return true;
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to update password";
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearProfileError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const pending = (state) => {
      state.isLoading = true;
      state.error = null;
    };
    const rejected = (state, action) => {
      state.isLoading = false;
      state.error = action.payload || "Request failed";
    };

    builder
      .addCase(updateMyProfile.pending, pending)
      .addCase(updateMyProfile.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(updateMyProfile.rejected, rejected)

      .addCase(changeMyPassword.pending, pending)
      .addCase(changeMyPassword.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(changeMyPassword.rejected, rejected);
  },
});

export const { clearProfileError } = profileSlice.actions;
export default profileSlice.reducer;
