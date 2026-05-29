import { useAppSelector } from '../../../hooks/reduxForTypeScript';
import { selectIsLoggedIn, selectIsRefreshing } from '../../../redux/auth/selectors';
import { Navigate } from 'react-router-dom';

interface Props {
  children: React.ReactNode;
}

const PrivateRoute = ({ children }: Props) => {
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const isRefreshing = useAppSelector(selectIsRefreshing);

  if (isRefreshing) return null;

  return isLoggedIn ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
