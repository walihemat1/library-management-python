// src/features/auth/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../../app/axiosClient";
import toast from "react-hot-toast";

const storedAuth = localStorage.getItem("auth-library");
const initialAuth = storedAuth ? JSON.parse(storedAuth) : null;

const initialState = {
  user: initialAuth?.user || null,
  role: initialAuth?.role || null,
  isAuthenticated: !!initialAuth?.user,
  isLoading: false,
  error: null,
};

const persistAuth = (state) => {
  const authToStore = {
    user: state.user,
    role: state.role,
  };
  localStorage.setItem("auth-library", JSON.stringify(authToStore));
};

/* ===================== GET ME ===================== */
export const fetchMe = createAsyncThunk(
  "auth/fetchMe",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosClient.get("/me");
      return res.data;
    } catch (err) {
      return rejectWithValue({
        status: err.response?.status,
        message: err.response?.data?.message || "Not authenticated",
      });
    }
  }
);

/* ===================== REGISTER ===================== */
export const register = createAsyncThunk(
  "auth/register",
  async ({ name, email, password, role }, { rejectWithValue }) => {
    try {
      const res = await axiosClient.post("/register", {
        name,
        email,
        password,
        role,
      });
      toast.success(res.data?.message || "Registered successfully");
      return true;
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || "Registration failed";
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

/* ===================== LOGIN ===================== */
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }, { rejectWithValue, dispatch }) => {
    try {
      const res = await axiosClient.post("/login", { email, password });
      toast.success(res.data?.message || "Login successful");

      // If backend returns user object, use it
      const u = res.data?.user;
      if (u?.id) {
        return {
          user: {
            id: u.id,
            name: u.name,
            email: u.email,
            username: u.email?.split("@")?.[0],
            role: u.role,
          },
          role: u.role,
        };
      }

      // Otherwise fetch from /me using the session cookie
      const me = await dispatch(fetchMe()).unwrap();

      return {
        user: {
          id: me.id,
          name: me.name,
          email: me.email,
          username: me.email?.split("@")?.[0],
          role: me.role,
        },
        role: me.role,
      };
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Login failed";
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

/* ===================== LOGOUT ===================== */
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosClient.post("/logout");
      toast.success(res.data?.message || "Logged out");
      localStorage.removeItem("auth-library");
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Logout failed";
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    resetAuthState: (state) => {
      state.user = null;
      state.role = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      localStorage.removeItem("auth-library");
    },
    updateAuthUser: (state, action) => {
      const updated = action.payload || {};
      if (!state.user) state.user = {};
      state.user = { ...state.user, ...updated };
      if (updated.role) state.role = updated.role;
      persistAuth(state);
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchMe
      .addCase(fetchMe.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = {
          id: action.payload.id,
          name: action.payload.name,
          email: action.payload.email,
          username: action.payload.email?.split("@")?.[0],
          role: action.payload.role,
        };
        state.role = action.payload.role;
        state.isAuthenticated = true;
        persistAuth(state);
      })
      .addCase(fetchMe.rejected, (state, action) => {
        state.isLoading = false;
        const status = action.payload?.status;

        if (status === 401) {
          state.user = null;
          state.role = null;
          state.isAuthenticated = false;
          localStorage.removeItem("auth-library");
        }
      })

      // register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Registration failed";
      })

      // login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.role = action.payload.role;
        state.isAuthenticated = true;
        persistAuth(state);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Login failed";
        state.isAuthenticated = false;
      })

      // logout
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.role = null;
        state.isAuthenticated = false;
        state.error = null;
        localStorage.removeItem("auth-library");
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Logout failed";
      });
  },
});

export const { resetAuthState, updateAuthUser } = authSlice.actions;
export default authSlice.reducer;
