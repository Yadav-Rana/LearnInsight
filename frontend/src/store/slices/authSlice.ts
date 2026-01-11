import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/api";
import type {
  AuthState,
  LoginCredentials,
  RegisterCredentials,
  User,
  AuthResponse,
} from "@/types";

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true, // Start with loading to check for existing session
  error: null,
};

// Async thunks
export const register = createAsyncThunk<
  AuthResponse,
  RegisterCredentials,
  { rejectValue: string }
>("auth/register", async (credentials, { rejectWithValue }) => {
  try {
    const response = await api.post<AuthResponse>("/auth/register", credentials);

    // Store token in localStorage
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }

    return response.data;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Registration failed";
    return rejectWithValue(message);
  }
});

export const login = createAsyncThunk<
  AuthResponse,
  LoginCredentials,
  { rejectValue: string }
>("auth/login", async (credentials, { rejectWithValue }) => {
  try {
    const response = await api.post<AuthResponse>("/auth/login", credentials);

    // Store token in localStorage
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }

    return response.data;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Login failed";
    return rejectWithValue(message);
  }
});

export const logout = createAsyncThunk<void, void, { rejectValue: string }>(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await api.post("/auth/logout");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } catch (error) {
      // Still clear local storage even if API call fails
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      const message = error instanceof Error ? error.message : "Logout failed";
      return rejectWithValue(message);
    }
  }
);

export const getMe = createAsyncThunk<
  { user: User },
  void,
  { rejectValue: string }
>("auth/getMe", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get<{ success: boolean; user: User }>("/auth/me");
    return { user: response.data.user };
  } catch (error) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    const message = error instanceof Error ? error.message : "Failed to get user";
    return rejectWithValue(message);
  }
});

export const updateProfile = createAsyncThunk<
  { user: User },
  Partial<User>,
  { rejectValue: string }
>("auth/updateProfile", async (data, { rejectWithValue }) => {
  try {
    const response = await api.put<{ success: boolean; user: User }>(
      "/auth/update-profile",
      data
    );
    localStorage.setItem("user", JSON.stringify(response.data.user));
    return { user: response.data.user };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update profile";
    return rejectWithValue(message);
  }
});

export const changePassword = createAsyncThunk<
  { message: string },
  { currentPassword: string; newPassword: string },
  { rejectValue: string }
>("auth/changePassword", async (data, { rejectWithValue }) => {
  try {
    const response = await api.put<{ success: boolean; message: string }>(
      "/auth/change-password",
      data
    );
    return { message: response.data.message };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to change password";
    return rejectWithValue(message);
  }
});

// Check for existing session on app load
export const checkAuth = createAsyncThunk<
  { user: User; token: string } | null,
  void,
  { rejectValue: string }
>("auth/checkAuth", async (_, { dispatch, rejectWithValue }) => {
  try {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!token || !userStr) {
      return null;
    }

    // Verify token is still valid by calling /me
    const result = await dispatch(getMe()).unwrap();
    return { user: result.user, token };
  } catch {
    return null;
  }
});

// Slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user || null;
        state.token = action.payload.token || null;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Registration failed";
      })
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user || null;
        state.token = action.payload.token || null;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Login failed";
      })
      // Logout
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = null;
      })
      .addCase(logout.rejected, (state) => {
        // Still logout even if API call fails
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })
      // Get Me
      .addCase(getMe.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(getMe.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload || null;
      })
      // Update Profile
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload.user;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.error = action.payload || "Failed to update profile";
      })
      // Check Auth
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.isAuthenticated = true;
          state.user = action.payload.user;
          state.token = action.payload.token;
        } else {
          state.isAuthenticated = false;
          state.user = null;
          state.token = null;
        }
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      });
  },
});

export const { clearError, setCredentials } = authSlice.actions;
export default authSlice.reducer;
