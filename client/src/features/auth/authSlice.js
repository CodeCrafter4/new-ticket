import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { AUTH_API_URL } from "../../config/api";

// Create axios instance with auth header
const api = axios.create({
  baseURL: AUTH_API_URL,
});

// Add interceptor to add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Check token and load user
export const checkToken = createAsyncThunk(
  "auth/checkToken",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        console.log("No token found");
        return rejectWithValue("No token found");
      }

      // Set the token in the axios instance
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
   
      const response = await api.get("/me");

      return {
        user: response.data.user,
        token: token,
      };
    } catch (error) {
      console.error("Token check error:", error);
      localStorage.removeItem("token");
      delete api.defaults.headers.common["Authorization"];
      return rejectWithValue(error.message || "Session expired");
    }
  }
);

export const login = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      
      const response = await api.post("/login", credentials);
      

      const { token, user } = response.data;

      // Save token to localStorage
      localStorage.setItem("token", token);
     

      // Set the token in the axios instance
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      

      return { user, token };
    } catch (error) {
      console.error("Login error:", error);
      localStorage.removeItem("token");
      delete api.defaults.headers.common["Authorization"];
      return rejectWithValue(error.response?.data?.error || "Login failed");
    }
  }
);

export const signup = createAsyncThunk(
  "auth/signup",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post("/signup", userData);
      const { token, user } = response.data;

      // Save token to localStorage
      localStorage.setItem("token", token);

      return { user, token };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Signup failed");
    }
  }
);

const initialState = {
  user: null,
  token: localStorage.getItem("token"),
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem("token");
      delete api.defaults.headers.common["Authorization"];
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
      state.loading = false;
    },
    resetLoading: (state) => {
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Check Token
      .addCase(checkToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkToken.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(checkToken.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload;
      })
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Signup
      .addCase(signup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(signup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearError, resetLoading } = authSlice.actions;
export default authSlice.reducer;
