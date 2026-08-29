import { motion } from "framer-motion";
import { PersonaBackground } from "@/components/PersonaBackground";
import { Sparkles, ArrowRight } from "lucide-react";

export default function Login() {
  const handleLogin = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + "/dashboard";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-6">
      <PersonaBackground persona="default" />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="max-w-xl w-full text-center"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/15 bg-white/5 backdrop-blur-xl mb-8 font-mono text-[11px] tracking-[0.25em] uppercase text-zinc-300">
          <Sparkles className="h-3.5 w-3.5" style={{ color: "var(--theme-accent)" }} />
          Agent Forge
        </div>
        <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl tracking-tighter font-light text-white leading-[1.05]">
          Build a personal AI agent
          <br />
          <span className="text-zinc-400">that's always two steps ahead.</span>
        </h1>
        <p className="mt-6 text-base leading-relaxed font-light text-zinc-400 max-w-lg mx-auto">
          Configure the role, goal, background and voice of an assistant tailored to any
          project — or start from a powerful template and tweak it your way.
        </p>

        <motion.button
          data-testid="google-login-button"
          onClick={handleLogin}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="group mt-10 inline-flex items-center gap-3 px-8 py-4 rounded-full border border-white/20 bg-white/5 backdrop-blur-xl text-white transition-colors hover:bg-white/10"
          style={{ boxShadow: "0 0 30px var(--theme-glow)" }}
        >
          <img alt="" className="h-5 w-5" src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" />
          <span className="font-medium">Continue with Google</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </motion.button>

        <p className="mt-6 font-mono text-[11px] tracking-widest uppercase text-zinc-600">
          Interchangeable models · Zero setup
        </p>
      </motion.div>
    </div>
  );
}
