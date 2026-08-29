import { motion } from "framer-motion";
import { personaOf } from "@/lib/personas";
import { MessageSquare, Settings2, Trash2 } from "lucide-react";

export const AgentCard = ({ agent, onOpen, onEdit, onDelete }) => {
  const p = personaOf(agent.persona);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative overflow-hidden rounded-2xl border border-white/10"
      data-testid={`agent-card-${agent.id}`}
    >
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
        style={{ backgroundImage: `url(${p.image})` }}
      />
      <div className="absolute inset-0 bg-zinc-950/80 transition-colors group-hover:bg-zinc-950/70" />
      <div className="relative p-6 min-h-[180px] flex flex-col justify-between">
        <div>
          <span
            className="font-mono text-[10px] tracking-[0.2em] uppercase"
            style={{ color: p.accent }}
          >
            {p.label}
          </span>
          <h3 className="font-heading text-xl tracking-tight text-white mt-1">{agent.name}</h3>
          <p className="text-sm text-zinc-400 mt-2 line-clamp-2 font-light">
            {agent.description || agent.role || "Custom AI agent"}
          </p>
        </div>
        <div className="flex items-center gap-2 mt-5">
          <button
            data-testid={`chat-agent-${agent.id}`}
            onClick={() => onOpen(agent)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-zinc-950 transition-transform hover:scale-[1.03]"
            style={{ backgroundColor: p.accent }}
          >
            <MessageSquare className="h-4 w-4" /> Chat
          </button>
          <button
            data-testid={`edit-agent-${agent.id}`}
            onClick={() => onEdit(agent)}
            className="p-2 rounded-full border border-white/15 text-zinc-300 hover:bg-white/10 transition-colors"
          >
            <Settings2 className="h-4 w-4" />
          </button>
          <button
            data-testid={`delete-agent-${agent.id}`}
            onClick={() => onDelete(agent)}
            className="p-2 rounded-full border border-white/15 text-zinc-400 hover:bg-red-500/20 hover:text-red-300 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
