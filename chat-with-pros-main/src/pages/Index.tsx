import { useAuth } from "@/hooks/useAuth";
import Landing from "./Landing";
import { Navigate } from "react-router-dom";

const Index = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return <Landing />;
};

export default Index;
