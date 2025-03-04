import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { USERS_API_URL } from "../../config/api";

// Create axios instance with auth header
const api = axios.create({
  baseURL: USERS_API_URL,
});

// Add interceptor to add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Fetch all users
export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      console.log("Fetching users from:", USERS_API_URL);
      const token = localStorage.getItem("token");
      console.log("Current token:", token);
      
      const response = await api.get("/");
      console.log("Users API response:", response.data);
      
      return response.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      console.error("Error response:", error.response);
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch users"
      );
    }
  }
);

const initialState = {
  users: [],
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
        state.error = null;
        console.log("Users state updated:", state.users);
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error("Users fetch rejected:", action.payload);
      });
  },
});

export const { clearError } = userSlice.actions;
export default userSlice.reducer;
