import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import type { LoginResponse, LoginUser, RegisterUser } from '../../types/requests/auth';
import type { User } from '../../types/db';
import errorHandling from '../../utils/errorHandling';
import api, { setAuthHeader } from '../apiCore';

export const getCurUserInfo = createAsyncThunk('user/getInfo', async (userId: string, thunkAPI) => {
  try {
    const response = await api.get<User>('/users/' + userId);
    return response.data;
  } catch (e) {
    if (axios.isAxiosError(e)) return errorHandling(e, thunkAPI);
    return thunkAPI.rejectWithValue({
      status: 500,
      message: 'Unexpected Error',
    });
  }
});

export const loginUser = createAsyncThunk('auth/login', async (payload: LoginUser, thunkAPI) => {
  try {
    const response = await api.post<LoginResponse>('/auth/login', payload);
    setAuthHeader(response.data.accessToken);
    thunkAPI.dispatch(getCurUserInfo(response.data.userId));
    return response.data;
  } catch (e) {
    if (axios.isAxiosError(e)) return errorHandling(e, thunkAPI);
    return thunkAPI.rejectWithValue({
      status: 500,
      message: 'Unexpected Error',
    });
  }
});

export const registerUser = createAsyncThunk(
  'auth/register',
  async (payload: RegisterUser, thunkAPI) => {
    try {
      const response = await api.post<User>('/auth/register', payload);

      thunkAPI.dispatch(loginUser({ email: payload.email, password: payload.password }));
      return response.data;
    } catch (e) {
      if (axios.isAxiosError(e)) return errorHandling(e, thunkAPI);
      return thunkAPI.rejectWithValue({
        status: 500,
        message: 'Unexpected Error',
      });
    }
  },
);

export const refreshUser = createAsyncThunk('auth/refresh', async (_, thunkAPI) => {
  try {
    const response = await api.post<LoginResponse>('/auth/refresh', {
      withCredentials: true,
    });
    setAuthHeader(response.data.accessToken);
    thunkAPI.dispatch(getCurUserInfo(response.data.userId));
    return response.data;
  } catch (e) {
    if (axios.isAxiosError(e)) return errorHandling(e, thunkAPI);
    return thunkAPI.rejectWithValue({
      status: 500,
      message: 'Unexpected Error',
    });
  }
});

export const logoutUser = createAsyncThunk('auth/logout', async (_, thunkAPI) => {
  try {
    await api.post('/auth/logout');
    setAuthHeader('');
  } catch (e) {
    if (axios.isAxiosError(e)) return errorHandling(e, thunkAPI);
    return thunkAPI.rejectWithValue({
      status: 500,
      message: 'Unexpected Error',
    });
  }
});
