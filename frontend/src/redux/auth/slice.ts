import { createSlice } from '@reduxjs/toolkit';
import { getCurUserInfo, loginUser, logoutUser, refreshUser } from './operations';
import type { User } from '../../types/db';

export interface AuthSliceState {
  user: User | null;
  isLoggedIn: boolean;
  isRefreshing: boolean;
  accessToken: string | null;
}

const initialState: AuthSliceState = {
  user: null,
  isLoggedIn: false,
  accessToken: null,
  isRefreshing: true,
};

const slice = createSlice({
  name: 'categoriesReducer',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isRefreshing = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken;
        state.isLoggedIn = true;
        state.isRefreshing = false;
      })
      .addCase(loginUser.rejected, (state) => {
        state.isRefreshing = false;
      })
      .addCase(logoutUser.pending, () => {
        return { ...initialState, isRefreshing: false };
      })
      .addCase(refreshUser.pending, (state) => {
        state.isRefreshing = true;
      })
      .addCase(refreshUser.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken;
        state.isLoggedIn = true;
        state.isRefreshing = false;
      })
      .addCase(refreshUser.rejected, () => {
        return { ...initialState, isRefreshing: false };
      })
      .addCase(getCurUserInfo.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const authReducer = slice.reducer;
