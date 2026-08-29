import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { api, streamChat } from "@/lib/api";
import { useTheme } from "@/context/ThemeContext";
import { PERSONAS, getSuggestions, MODELS, personaOf } from "@/lib/personas";
import { PersonaBackground } from "@/components/PersonaBackground";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Markdown } from "@/components/Markdown";
import { SpeakButton } from "@/components/SpeakButton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Send, Save, Sparkles, Upload, FileText, X } from "lucide-react";
import { toast } from "sonner";

const FIELD = ({ label, children, testid }) => (
  <div className="space-y-2" data-testid={testid}>
    <label className="font-mono text-[10px] tracking-[0.2em] uppercase text-zinc-400">{label}</label>
    {children}
  </div>
);

const Chips = ({ items, onPick }) => (
  <div className="flex flex-wrap gap-2 pt-1">
    {items.map((s, i) => (
      <button
        key={i}
        type="button"
        onClick={() => onPick(s)}
        className="font-mono text-[11px] px-3 py-1 rounded-full border border-white/10 bg-white/5 text-zinc-400 hover:text-white hover:border-white/30 transition-colors"
        style={{ boxShadow: "0 0 0 transparent" }}
        onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 0 12px var(--theme-glow)")}
        onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 0 0 transparent")}
      >
        {s}
      </button>
    ))}
  </div>
);

const inputCls =
  "bg-transparent border-0 border-b border-white/20 rounded-none px-0 focus-visible:ring-0 focus:border-[var(--theme-accent)] text-white text-base transition-colors";

export default function Builder() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setPersona } = useTheme();
  const editing = location.state?.agent || null;
  const template = location.state?.template || null;

  const seed = editing || template || {};
  const [form, setForm] = useState({
    name: seed.name || "",
    description: seed.description || "",
    persona: seed.persona || "default",
    role: seed.role || "",
    goal: seed.goal || "",
    background: seed.background || "",
    expected_output: seed.expected_output || "",
    tone: seed.tone || "Warm, natural and professional",
    model_provider: seed.model_provider || "openai",
    model_name: seed.model_name || "gpt-5.4",
  });
  const [saving, setSaving] = useState(false);

  // preview chat
  const [previewId, setPreviewId] = useState(editing?.id || null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);
  const fileRef = useRef(null);

  // knowledge base
  const [docs, setDocs] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { setPersona(form.persona); }, [form.persona, setPersona]);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, sending]);
  useEffect(() => {
    if (!previewId) return;
    api.get(`/agents/${previewId}/documents`).then((r) => setDocs(r.data)).catch(() => {});
  }, [previewId]);

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));
  const p = personaOf(form.persona);
  const modelValue = `${form.model_provider}::${form.model_name}`;

  const saveAgent = async () => {
    if (!form.name.trim()) { toast.error("Give your agent a name first"); return null; }
    setSaving(true);
    try {
      let res;
      if (editing || previewId) {
        res = await api.put(`/agents/${editing?.id || previewId}`, form);
      } else {
        res = await api.post("/agents", form);
        setPreviewId(res.data.id);
      }
      toast.success("Agent saved");
      return res.data.id;
    } catch {
      toast.error("Save failed");
      return null;
    } finally {
      setSaving(false);
    }
  };

  const saveAndExit = async () => {
    const id = await saveAgent();
    if (id) navigate("/dashboard");
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    let id = previewId;
    if (!id) { id = await saveAgent(); if (!id) return; }
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await api.post(`/agents/${id}/documents`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setDocs((d) => [...d, res.data]);
      toast.success(`${file.name} added to knowledge base`);
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const removeDoc = async (docId) => {
    try {
      await api.delete(`/agents/${previewId}/documents/${docId}`);
      setDocs((d) => d.filter((x) => x.id !== docId));
    } catch {
      toast.error("Could not remove document");
    }
  };

  const sendPreview = async () => {
    if (!input.trim() || sending) return;
    let id = previewId;
    if (!id) {
      id = await saveAgent();
      if (!id) return;
    }
    const text = input.trim();
    setInput("");
    setMessages((m) => [...m, { role: "user", content: text }, { role: "assistant", content: "" }]);
    setSending(true);
    try {
      await streamChat(id, text, (delta) => {
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "assistant", content: copy[copy.length - 1].content + delta };
          return copy;
        });
      });
    } catch {
      toast.error("The agent couldn't respond. Try again.");
      setMessages((m) => m.slice(0, -2));
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      <PersonaBackground persona={form.persona} />

      <header className="sticky top-0 z-20 backdrop-blur-xl bg-zinc-950/60 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            data-testid="back-button"
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-2 text-sm text-zinc-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </button>
          <button
            data-testid="save-agent-button"
            onClick={saveAndExit}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-medium text-zinc-950 transition-transform hover:scale-[1.03] disabled:opacity-60"
            style={{ backgroundColor: p.accent }}
          >
            <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save agent"}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Config form */}
        <div className="lg:col-span-5">
          <div className="rounded-2xl backdrop-blur-xl bg-zinc-950/70 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-7 space-y-7">
            <div>
              <p className="font-mono text-[11px] tracking-[0.25em] uppercase" style={{ color: p.accent }}>
                {editing ? "Refine agent" : template ? "From template" : "New agent"}
              </p>
              <h1 className="font-heading text-2xl tracking-tight font-light text-white mt-1">Configure</h1>
            </div>

            <FIELD label="Name" testid="field-name">
              <Input data-testid="input-name" value={form.name} onChange={(e) => set("name")(e.target.value)}
                placeholder="e.g. Atlas, my strategy partner" className={inputCls} />
            </FIELD>

            <FIELD label="Specialty / Persona" testid="field-persona">
              <Select value={form.persona} onValueChange={set("persona")}>
                <SelectTrigger data-testid="select-persona" className="bg-zinc-900 border-white/15 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10 text-white">
                  {Object.entries(PERSONAS).map(([k, v]) => (
                    <SelectItem key={k} value={k} className="focus:bg-white/10">{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FIELD>

            <FIELD label="Short description" testid="field-description">
              <Input data-testid="input-description" value={form.description} onChange={(e) => set("description")(e.target.value)}
                placeholder="One line about what this agent does" className={inputCls} />
            </FIELD>

            <FIELD label="Role" testid="field-role">
              <Textarea data-testid="input-role" value={form.role} onChange={(e) => set("role")(e.target.value)}
                rows={2} placeholder="Who is this agent?" className={inputCls} />
              <Chips items={getSuggestions(form.persona, "role")} onPick={set("role")} />
            </FIELD>

            <FIELD label="Goal" testid="field-goal">
              <Textarea data-testid="input-goal" value={form.goal} onChange={(e) => set("goal")(e.target.value)}
                rows={2} placeholder="What should it help you achieve?" className={inputCls} />
              <Chips items={getSuggestions(form.persona, "goal")} onPick={set("goal")} />
            </FIELD>

            <FIELD label="Background & expertise" testid="field-background">
              <Textarea data-testid="input-background" value={form.background} onChange={(e) => set("background")(e.target.value)}
                rows={2} placeholder="What experience does it draw on?" className={inputCls} />
              <Chips items={getSuggestions(form.persona, "background")} onPick={set("background")} />
            </FIELD>

            <FIELD label="Expected output" testid="field-output">
              <Textarea data-testid="input-output" value={form.expected_output} onChange={(e) => set("expected_output")(e.target.value)}
                rows={2} placeholder="How should responses be shaped?" className={inputCls} />
              <Chips items={getSuggestions(form.persona, "expected_output")} onPick={set("expected_output")} />
            </FIELD>

            <FIELD label="Tone & personality" testid="field-tone">
              <Input data-testid="input-tone" value={form.tone} onChange={(e) => set("tone")(e.target.value)}
                className={inputCls} />
              <Chips items={getSuggestions(form.persona, "tone")} onPick={set("tone")} />
            </FIELD>

            <FIELD label="Model" testid="field-model">
              <Select
                value={modelValue}
                onValueChange={(v) => {
                  const [provider, name] = v.split("::");
                  setForm((f) => ({ ...f, model_provider: provider, model_name: name }));
                }}
              >
                <SelectTrigger data-testid="select-model" className="bg-zinc-900 border-white/15 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10 text-white">
                  {MODELS.map((m) => (
                    <SelectItem key={`${m.provider}::${m.name}`} value={`${m.provider}::${m.name}`} className="focus:bg-white/10">
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FIELD>

            <FIELD label="Knowledge base" testid="field-knowledge">
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.txt,.md,.docx"
                onChange={handleUpload}
                className="hidden"
                data-testid="doc-file-input"
              />
              <button
                type="button"
                data-testid="upload-doc-button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-white/20 text-zinc-300 hover:border-white/40 hover:text-white transition-colors disabled:opacity-60"
              >
                <Upload className="h-4 w-4" />
                {uploading ? "Reading document…" : "Upload a document the agent can reference"}
              </button>
              <p className="font-mono text-[10px] text-zinc-500">PDF, DOCX, TXT or MD · up to 5MB</p>
              {docs.length > 0 && (
                <div className="space-y-2 pt-1" data-testid="doc-list">
                  {docs.map((d) => (
                    <div key={d.id} data-testid={`doc-${d.id}`}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                      <FileText className="h-4 w-4 shrink-0" style={{ color: p.accent }} />
                      <span className="text-sm text-zinc-200 truncate flex-1">{d.filename}</span>
                      <span className="font-mono text-[10px] text-zinc-500">{(d.chars / 1000).toFixed(1)}k</span>
                      <button data-testid={`remove-doc-${d.id}`} onClick={() => removeDoc(d.id)}
                        className="p-1 rounded-full text-zinc-500 hover:text-red-300 hover:bg-red-500/20 transition-colors">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </FIELD>
          </div>
        </div>

        {/* Live preview */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl backdrop-blur-xl bg-zinc-950/70 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex flex-col h-[calc(100vh-160px)] min-h-[500px]">
            <div className="px-6 py-4 border-b border-white/10 flex items-center gap-2">
              <Sparkles className="h-4 w-4" style={{ color: p.accent }} />
              <span className="font-heading tracking-tight text-white">Live preview</span>
              <span className="ml-auto font-mono text-[10px] tracking-widest uppercase text-zinc-500">{form.model_name}</span>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-6" data-testid="preview-messages">
              {messages.length === 0 && !sending && (
                <div className="h-full flex items-center justify-center text-center">
                  <p className="text-zinc-500 font-light max-w-sm">
                    Send a message to preview how <span className="text-white">{form.name || "your agent"}</span> thinks —
                    it'll always guide you to the next best step.
                  </p>
                </div>
              )}
              {messages.map((m, i) =>
                m.role === "user" ? (
                  <div key={i} className="flex justify-end">
                    <div className="bg-white/5 rounded-2xl px-6 py-4 max-w-[85%] text-zinc-100 font-light whitespace-pre-wrap">
                      {m.content}
                    </div>
                  </div>
                ) : (
                  <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="pl-4 border-l-2" style={{ borderColor: p.accent }}>
                    <Markdown>{m.content}</Markdown>
                    {m.content && <SpeakButton text={m.content} accent={p.accent} />}
                  </motion.div>
                )
              )}
              {sending && messages[messages.length - 1]?.content === "" && (
                <div className="pl-4 border-l-2 flex gap-1.5 items-center" style={{ borderColor: p.accent }}>
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="h-2 w-2 rounded-full animate-bounce"
                      style={{ backgroundColor: p.accent, animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-white/10">
              <div className="flex items-end gap-3">
                <Textarea
                  data-testid="preview-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendPreview(); } }}
                  rows={1}
                  placeholder="Message your agent…"
                  className="bg-white/5 border-white/10 text-white resize-none rounded-xl focus-visible:ring-1 focus-visible:ring-[var(--theme-accent)]"
                />
                <button
                  data-testid="preview-send"
                  onClick={sendPreview}
                  disabled={sending}
                  className="p-3 rounded-xl text-zinc-950 transition-transform hover:scale-105 disabled:opacity-50"
                  style={{ backgroundColor: p.accent }}
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
