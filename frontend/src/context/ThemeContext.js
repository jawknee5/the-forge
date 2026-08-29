import { createContext, useContext, useEffect, useState } from "react";
import { personaOf } from "@/lib/personas";

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [persona, setPersona] = useState("default");

  useEffect(() => {
    const p = personaOf(persona);
    const root = document.documentElement;
    root.style.setProperty("--theme-accent", p.accent);
    root.style.setProperty("--theme-glow", p.glow);
  }, [persona]);

  return (
    <ThemeContext.Provider value={{ persona, setPersona }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
