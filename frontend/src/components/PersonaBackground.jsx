import { personaOf } from "@/lib/personas";
import { AnimatePresence, motion } from "framer-motion";

export const PersonaBackground = ({ persona }) => {
  const p = personaOf(persona);
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-zinc-950" data-testid="persona-background">
      <AnimatePresence mode="wait">
        <motion.div
          key={persona}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${p.image})` }}
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-zinc-950/80" />
      <div
        className="absolute inset-0 transition-colors duration-1000"
        style={{
          background: `radial-gradient(60% 60% at 80% 10%, ${p.glow}, transparent 70%), radial-gradient(50% 50% at 10% 90%, ${p.glow}, transparent 70%)`,
        }}
      />
    </div>
  );
};
