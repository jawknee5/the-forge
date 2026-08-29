import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const hash = window.location.hash;
    const sessionId = new URLSearchParams(hash.replace("#", "")).get("session_id");
    if (!sessionId) {
      navigate("/");
      return;
    }
    (async () => {
      try {
        const res = await api.post("/auth/session", { session_id: sessionId });
        setUser(res.data);
        window.history.replaceState({}, "", "/dashboard");
        navigate("/dashboard", { state: { user: res.data } });
      } catch {
        navigate("/");
      }
    })();
  }, [navigate, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-300">
      <div className="flex items-center gap-3 font-mono text-sm tracking-widest uppercase">
        <span className="h-2 w-2 rounded-full bg-white animate-ping" />
        Initializing your workspace
      </div>
    </div>
  );
}
