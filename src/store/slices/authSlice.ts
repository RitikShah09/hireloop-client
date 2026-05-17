import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AuthUser {
  userId: string;
  role: 'COMPANY' | 'CANDIDATE' | 'ADMIN';
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  companyName?: string;
  logoUrl?: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isLoading = false;
    },
    clearAuth: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setUser, clearAuth, setLoading } = authSlice.actions;

export const logout = clearAuth;
export const setCredentials = (payload: { user: AuthUser }) => setUser(payload.user);

export default authSlice.reducer;
