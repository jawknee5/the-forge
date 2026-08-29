import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { TEMPLATES, personaOf } from "@/lib/personas";
import { PersonaBackground } from "@/components/PersonaBackground";
import { AgentCard } from "@/components/AgentCard";
import { Plus, LogOut, Wand2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toDelete, setToDelete] = useState(null);

  const load = async () => {
    try {
      const res = await api.get("/agents");
      setAgents(res.data);
    } catch {
      toast.error("Could not load your agents");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const applyTemplate = (t) => {
    navigate("/builder", { state: { template: t } });
  };

  const doDelete = async () => {
    const a = toDelete;
    setToDelete(null);
    try {
      await api.delete(`/agents/${a.id}`);
      setAgents((prev) => prev.filter((x) => x.id !== a.id));
      toast.success(`${a.name} deleted`);
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="min-h-screen relative">
      <PersonaBackground persona="default" />

      <header className="sticky top-0 z-20 backdrop-blur-xl bg-zinc-950/60 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-heading text-lg tracking-tight text-white">
            <Wand2 className="h-5 w-5" style={{ color: "var(--theme-accent)" }} />
            Agent Forge
          </div>
          <div className="flex items-center gap-3">
            {user?.picture && (
              <img src={user.picture} alt="" className="h-8 w-8 rounded-full border border-white/20" />
            )}
            <span className="hidden sm:block text-sm text-zinc-300">{user?.name}</span>
            <button
              data-testid="logout-button"
              onClick={async () => { await logout(); navigate("/"); }}
              className="p-2 rounded-full border border-white/15 text-zinc-400 hover:bg-white/10 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Your agents */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="font-mono text-[11px] tracking-[0.25em] uppercase text-zinc-500">Your workspace</p>
            <h1 className="font-heading text-3xl sm:text-4xl tracking-tight font-light text-white mt-2">
              Your agents
            </h1>
          </div>
          <motion.button
            data-testid="new-agent-button"
            whileHover={{ scale: 1.03 }}
            onClick={() => navigate("/builder")}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white text-zinc-950 font-medium transition-transform"
          >
            <Plus className="h-4 w-4" /> New agent
          </motion.button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-[180px] rounded-2xl bg-white/5 border border-white/10 animate-pulse" />
            ))}
          </div>
        ) : agents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 backdrop-blur-xl p-12 text-center">
            <p className="text-zinc-300 font-light">No agents yet. Start from a template below, or build one from scratch.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="agents-grid">
            {agents.map((a) => (
              <AgentCard
                key={a.id}
                agent={a}
                onOpen={(ag) => navigate(`/chat/${ag.id}`)}
                onEdit={(ag) => navigate("/builder", { state: { agent: ag } })}
                onDelete={(ag) => setToDelete(ag)}
              />
            ))}
          </div>
        )}

        {/* Templates */}
        <div className="mt-20">
          <p className="font-mono text-[11px] tracking-[0.25em] uppercase text-zinc-500">Inspiration</p>
          <h2 className="font-heading text-2xl sm:text-3xl tracking-tight font-light text-white mt-2 mb-8">
            Powerful templates
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" data-testid="templates-grid">
            {TEMPLATES.map((t, i) => {
              const p = personaOf(t.persona);
              return (
                <motion.button
                  key={t.key}
                  data-testid={`template-${t.key}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -4 }}
                  onClick={() => applyTemplate(t)}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 text-left"
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                    style={{ backgroundImage: `url(${p.image})` }}
                  />
                  <div className="absolute inset-0 bg-zinc-950/80 group-hover:bg-zinc-950/60 transition-colors" />
                  <div className="relative p-6 min-h-[200px] flex flex-col justify-between">
                    <span className="font-mono text-[10px] tracking-[0.2em] uppercase" style={{ color: p.accent }}>
                      {p.label}
                    </span>
                    <div>
                      <h3 className="font-heading text-lg tracking-tight text-white">{t.name}</h3>
                      <p className="text-sm text-zinc-400 mt-2 font-light line-clamp-2">{t.description}</p>
                      <span
                        className="inline-flex items-center gap-1 mt-4 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ color: p.accent }}
                      >
                        Use template →
                      </span>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </main>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent className="bg-zinc-900 border border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this agent?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              {toDelete?.name} and its conversation will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-white/15 text-zinc-300 hover:bg-white/10">Cancel</AlertDialogCancel>
            <AlertDialogAction data-testid="confirm-delete" onClick={doDelete} className="bg-red-500 hover:bg-red-600 text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
