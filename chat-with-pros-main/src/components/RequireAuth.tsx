import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="flex min-h-[60vh] items-center justify-center font-pixel text-xs">
        Loading<span className="animate-blink">_</span>
      </div>
    );
  if (!user) return <Navigate to="/auth" replace />;
  return children;
};
