import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import axiosClient from "../../app/axiosClient";

const initialState = {
  users: [],
  isLoading: false,
  error: null,
};

// GET /admin/users
export const fetchAdminUsers = createAsyncThunk(
  "adminUsers/fetchAdminUsers",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosClient.get("/admin/users");
      return Array.isArray(res.data) ? res.data : [];
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to load users";
      return rejectWithValue(msg);
    }
  }
);

// POST /admin/users
export const adminCreateUser = createAsyncThunk(
  "adminUsers/adminCreateUser",
  async ({ name, email, password, role }, { rejectWithValue, dispatch }) => {
    try {
      const res = await axiosClient.post("/admin/users", {
        name,
        email,
        password,
        role,
      });
      toast.success(res.data?.message || "User created");
      dispatch(fetchAdminUsers());
      return true;
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to create user";
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

// PUT /admin/users/:id/role
export const adminUpdateUserRole = createAsyncThunk(
  "adminUsers/adminUpdateUserRole",
  async ({ userId, role }, { rejectWithValue, dispatch }) => {
    try {
      const res = await axiosClient.put(`/admin/users/${userId}/role`, {
        role,
      });
      toast.success(res.data?.message || "Role updated");
      dispatch(fetchAdminUsers());
      return { userId, role };
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to update role";
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

// PUT /admin/users/:id/status
export const adminUpdateUserStatus = createAsyncThunk(
  "adminUsers/adminUpdateUserStatus",
  async ({ userId, is_active }, { rejectWithValue, dispatch }) => {
    try {
      const res = await axiosClient.put(`/admin/users/${userId}/status`, {
        is_active,
      });
      toast.success(res.data?.message || "Status updated");
      dispatch(fetchAdminUsers());
      return { userId, is_active };
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to update status";
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

export const adminResetUserPassword = createAsyncThunk(
  "adminUsers/adminResetUserPassword",
  async ({ userId, password }, { rejectWithValue }) => {
    try {
      const res = await axiosClient.put(`/admin/users/${userId}/password`, {
        password,
      });
      toast.success(res.data?.message || "Password reset");
      return true;
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to reset password";
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

const adminUsersSlice = createSlice({
  name: "adminUsers",
  initialState,
  reducers: {
    clearAdminUsersError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch users
      .addCase(fetchAdminUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchAdminUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to load users";
      })

      // create user
      .addCase(adminCreateUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(adminCreateUser.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(adminCreateUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to create user";
      })

      // update role
      .addCase(adminUpdateUserRole.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(adminUpdateUserRole.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(adminUpdateUserRole.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to update role";
      })

      // update status
      .addCase(adminUpdateUserStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(adminUpdateUserStatus.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(adminUpdateUserStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to update status";
      });
  },
});

export const { clearAdminUsersError } = adminUsersSlice.actions;
export default adminUsersSlice.reducer;
