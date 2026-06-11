import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  isLoggedIn: boolean;
  userEmail: string | null;
  userName: string | null;
}

const initialState: AuthState = {
  isLoggedIn: false,
  userEmail: null,
  userName: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<{ email: string; name: string }>) => {
      state.isLoggedIn = true;
      state.userEmail = action.payload.email;
      state.userName = action.payload.name;
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.userEmail = null;
      state.userName = null;
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
