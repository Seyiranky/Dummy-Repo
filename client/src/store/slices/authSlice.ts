import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { authApi, type AuthResponse } from '../../api/authApi';
import type { Role } from '../../types';

interface AuthState {
  userId: string | null;
  role: Role | null;
  token: string | null;
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
}

const initialState: AuthState = {
  userId: null,
  role: null,
  token: localStorage.getItem('token'),
  status: 'idle',
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (payload: { email: string; password: string }) => authApi.login(payload),
);

export const register = createAsyncThunk(
  'auth/register',
  async (payload: { name: string; email: string; password: string; role: Role }) =>
    authApi.register(payload),
);

const applyAuthResponse = (state: AuthState, action: PayloadAction<AuthResponse>) => {
  state.status = 'idle';
  state.userId = action.payload.userId;
  state.role = action.payload.role;
  state.token = action.payload.token;
  localStorage.setItem('token', action.payload.token);
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.userId = null;
      state.role = null;
      state.token = null;
      localStorage.removeItem('token');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, applyAuthResponse)
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Login failed';
      })
      .addCase(register.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(register.fulfilled, applyAuthResponse)
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Registration failed';
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
