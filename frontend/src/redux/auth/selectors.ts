import type { StoreState } from "../store";

export const selectUser = (state: StoreState) => state.auth.user;
export const selectIsRefreshing = (state: StoreState) =>
  state.auth.isRefreshing;
export const selectIsLoggedIn = (state: StoreState) => state.auth.isLoggedIn;
