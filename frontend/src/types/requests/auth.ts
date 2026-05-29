export interface RegisterUser {
  name: string;
  email: string;
  password: string;
}

export interface LoginUser {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  userId: string;
}
