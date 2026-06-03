import { useAuth } from "../context/AuthContext";

type Props = {
  children: React.ReactNode;
  fallback: React.ReactNode;
};

export default function PrivateRoute({ children, fallback }: Props) {
  const { user } = useAuth();
  return user ? <>{children}</> : <>{fallback}</>;
}