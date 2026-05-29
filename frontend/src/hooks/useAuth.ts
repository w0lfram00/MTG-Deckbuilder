import { selectUser } from '@/redux/auth/selectors';
import { useAppDispatch, useAppSelector } from './reduxForTypeScript';
import { LoginUser, RegisterUser } from '@/types/requests/auth';
import { loginUser, registerUser } from '@/redux/auth/operations';

export const useAuth = async () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);

  const login = async (payload: LoginUser) => {
    return dispatch(loginUser(payload)).unwrap();
  };

  const register = async (payload: RegisterUser) => {
    return dispatch(registerUser(payload)).unwrap();
  };

  return {
    user,
    login,
    register,
  };
};
