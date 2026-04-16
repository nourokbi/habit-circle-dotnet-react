import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { PageLoader } from "../ui/PageLoader";

export default function GuestRoute() {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  return !user ? <Outlet /> : <Navigate to="/dashboard" replace />;
}
