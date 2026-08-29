import { useEffect, useRef, useState } from "react";
import { Volume2, Square } from "lucide-react";

const stripMarkdown = (md) =>
  (md || "")
    .replace(/```[\s\S]*?```/g, " code block ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/[#>*_~|-]/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();

const pickVoice = () => {
  const voices = window.speechSynthesis?.getVoices() || [];
  if (!voices.length) return null;
  const prefer = [
    /natural/i, /google us english/i, /samantha/i, /aria/i, /jenny/i,
    /google uk english female/i, /microsoft/i, /google/i,
  ];
  for (const re of prefer) {
    const v = voices.find((x) => x.lang?.startsWith("en") && re.test(x.name));
    if (v) return v;
  }
  return voices.find((x) => x.lang?.startsWith("en")) || voices[0];
};

export const SpeakButton = ({ text, accent }) => {
  const [speaking, setSpeaking] = useState(false);
  const uttRef = useRef(null);

  useEffect(() => {
    // warm up voice list
    if (window.speechSynthesis) window.speechSynthesis.getVoices();
    return () => { try { window.speechSynthesis?.cancel(); } catch {} };
  }, []);

  const toggle = () => {
    const synth = window.speechSynthesis;
    if (!synth) return;
    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }
    synth.cancel();
    const u = new SpeechSynthesisUtterance(stripMarkdown(text));
    const v = pickVoice();
    if (v) u.voice = v;
    u.rate = 1.0;
    u.pitch = 1.0;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    uttRef.current = u;
    setSpeaking(true);
    synth.speak(u);
  };

  return (
    <button
      type="button"
      data-testid="speak-button"
      onClick={toggle}
      title={speaking ? "Stop" : "Read aloud"}
      className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-zinc-400 hover:text-white hover:border-white/25 transition-colors font-mono text-[10px] tracking-widest uppercase"
      style={speaking ? { color: accent, borderColor: accent } : undefined}
    >
      {speaking ? <Square className="h-3 w-3" /> : <Volume2 className="h-3.5 w-3.5" />}
      {speaking ? "Stop" : "Listen"}
    </button>
  );
};
