import type { GetThunkAPI } from "@reduxjs/toolkit";
import type { AxiosError } from "axios";

const errorHandling = (
  e: AxiosError<{ message?: string }>,
  thunkAPI: GetThunkAPI<{}>
) => {
  return thunkAPI.rejectWithValue({
    status: e.status,
    message: e.response?.data.message,
  });
};

export default errorHandling;
