// Persona-adaptive theming + smart configuration suggestions
export const PERSONAS = {
  default: {
    label: "General Assistant",
    accent: "#e4e4e7",
    glow: "rgba(228,228,231,0.12)",
    image:
      "https://images.unsplash.com/photo-1567095751004-aa51a2690368?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzR8MHwxfHNlYXJjaHwyfHxmdXR1cmlzdGljJTIwZGFyayUyMGFic3RyYWN0fGVufDB8fHx8MTc4ODAyMTQ1M3ww&ixlib=rb-4.1.0&q=85",
  },
  law: {
    label: "Law & Legal",
    accent: "#d97706",
    glow: "rgba(217,119,6,0.20)",
    image:
      "https://images.unsplash.com/photo-1758541213979-fe8c9996e197?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzh8MHwxfHNlYXJjaHwxfHxsYXclMjBtb2Rlcm4lMjBjb3VydHJvb218ZW58MHx8fHwxNzg4MDIxNDUzfDA&ixlib=rb-4.1.0&q=85",
  },
  research: {
    label: "Research & Analysis",
    accent: "#06b6d4",
    glow: "rgba(6,182,212,0.20)",
    image:
      "https://images.unsplash.com/photo-1644088379091-d574269d422f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NzV8MHwxfHNlYXJjaHwxfHxkYXRhJTIwbmV0d29yayUyMGFic3RyYWN0fGVufDB8fHx8MTc4ODAyMTQ1M3ww&ixlib=rb-4.1.0&q=85",
  },
  finance: {
    label: "Finance & Wealth",
    accent: "#eab308",
    glow: "rgba(234,179,8,0.20)",
    image:
      "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NzV8MHwxfHNlYXJjaHwxfHxmaW5hbmNlJTIwY2hhcnQlMjBtb2Rlcm58ZW58MHx8fHwxNzg4MDIxNDUzfDA&ixlib=rb-4.1.0&q=85",
  },
  creative: {
    label: "Creative & Brand",
    accent: "#d946ef",
    glow: "rgba(217,70,239,0.20)",
    image:
      "https://images.unsplash.com/photo-1532640331846-d2da5987c3ee?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1Mjh8MHwxfHNlYXJjaHwxfHxjcmVhdGl2ZSUyMGNvbG9yZnVsJTIwYWJzdHJhY3R8ZW58MHx8fHwxNzg4MDIxNDUzfDA&ixlib=rb-4.1.0&q=85",
  },
  medical: {
    label: "Health & Medical",
    accent: "#34d399",
    glow: "rgba(52,211,153,0.20)",
    image:
      "https://images.unsplash.com/photo-1567095751004-aa51a2690368?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzR8MHwxfHNlYXJjaHwyfHxmdXR1cmlzdGljJTIwZGFyayUyMGFic3RyYWN0fGVufDB8fHx8MTc4ODAyMTQ1M3ww&ixlib=rb-4.1.0&q=85",
  },
  tech: {
    label: "Tech & Startup",
    accent: "#6366f1",
    glow: "rgba(99,102,241,0.20)",
    image:
      "https://images.unsplash.com/photo-1644088379091-d574269d422f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NzV8MHwxfHNlYXJjaHwxfHxkYXRhJTIwbmV0d29yayUyMGFic3RyYWN0fGVufDB8fHx8MTc4ODAyMTQ1M3ww&ixlib=rb-4.1.0&q=85",
  },
  marketing: {
    label: "Marketing & Growth",
    accent: "#f43f5e",
    glow: "rgba(244,63,94,0.20)",
    image:
      "https://images.unsplash.com/photo-1532640331846-d2da5987c3ee?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1Mjh8MHwxfHNlYXJjaHwxfHxjcmVhdGl2ZSUyMGNvbG9yZnVsJTIwYWJzdHJhY3R8ZW58MHx8fHwxNzg4MDIxNDUzfDA&ixlib=rb-4.1.0&q=85",
  },
};

export const personaOf = (key) => PERSONAS[key] || PERSONAS.default;

export const MODELS = [
  { provider: "openai", name: "gpt-5.4", label: "GPT 5.4 — balanced & sharp" },
  { provider: "openai", name: "gpt-5.4-mini", label: "GPT 5.4 Mini — fast & light" },
  { provider: "anthropic", name: "claude-sonnet-4-6", label: "Claude Sonnet 4.6 — deep reasoning" },
  { provider: "gemini", name: "gemini-3.1-pro-preview", label: "Gemini 3.1 Pro — long context" },
  { provider: "gemini", name: "gemini-3-flash-preview", label: "Gemini 3 Flash — snappy" },
];

// Field-specific smart suggestions, tailored per persona
const TONES = [
  "Warm, natural and professional",
  "Direct, no-nonsense and efficient",
  "Encouraging mentor who challenges me",
  "Calm, precise and analytical",
  "Witty, energetic and inspiring",
];

export const PERSONA_SUGGESTIONS = {
  default: {
    role: ["Executive Productivity & Life Coach", "All-around personal chief of staff", "Strategic thinking partner"],
    goal: ["Keep me clear, focused and two steps ahead", "Break big goals into a prioritized plan", "Help me make better decisions faster"],
    background: ["Behavioral science, habit design and prioritization", "Broad cross-domain expertise with a systems mindset", "Obsessed with clarity and measurable outcomes"],
    expected_output: ["Structured answer + a clear Next Best Step", "Concise summary, then deeper detail on request", "Bullet points, no fluff, decision-ready"],
  },
  law: {
    role: ["Senior Legal Counsel specializing in contract law", "Corporate & IP attorney", "Compliance and risk advisor"],
    goal: ["Protect my interests and flag legal risks early", "Explain the smartest legal move at each step", "Review and tighten my contracts"],
    background: ["20+ years across corporate, IP and contract law", "Frameworks-first legal reasoning", "Deep knowledge of case law and precedent"],
    expected_output: ["Plain-English analysis with key risks flagged", "Clause-by-clause review with suggested edits", "Options with legal trade-offs, then Next Best Step"],
  },
  research: {
    role: ["Quantitative & qualitative Research Analyst", "Evidence synthesis specialist", "Data-driven insight partner"],
    goal: ["Deliver rigorous, unbiased analysis", "Tell me what the evidence means for my decision", "Surface blind spots and counter-arguments"],
    background: ["Expert in synthesis and evidence weighting", "Trained on scientific method and statistics", "Structured, first-principles reasoning"],
    expected_output: ["Findings, confidence level, then implications", "Sourced claims with a Next Best Step", "Comparison table with a clear recommendation"],
  },
  finance: {
    role: ["Certified Financial Planner & Wealth Strategist", "Investment and portfolio advisor", "Personal CFO"],
    goal: ["Grow and protect my wealth", "Give clear, prioritized financial guidance", "Build a plan I can actually stick to"],
    background: ["Deep expertise in planning, investing and tax-aware strategy", "Risk management and asset allocation", "Behavioral finance and long-term thinking"],
    expected_output: ["Options with trade-offs and my recommendation", "Numbers-backed plan with a Next Best Step", "Clear pros/cons, then the decision"],
  },
  creative: {
    role: ["Creative Director & Brand Storyteller", "Copywriter and naming specialist", "Art direction partner"],
    goal: ["Turn rough ideas into bold, on-brand creative", "Give me distinct directions to choose from", "Sharpen my message so it lands"],
    background: ["Award-level campaigns, naming and narrative", "Visual direction and brand systems", "Understands audience psychology"],
    expected_output: ["3 distinct directions, my pick, then Next Best Step", "Ready-to-use copy with variations", "Moodboard-in-words + rationale"],
  },
  medical: {
    role: ["Clinical Health Navigator & wellness coach", "Evidence-based health educator", "Recovery and habit guide"],
    goal: ["Help me understand my options safely", "Take the healthiest next step", "Explain risks and when to see a professional"],
    background: ["Evidence-based and cautious", "Always recommends professional care when needed", "Grounded in current clinical guidance"],
    expected_output: ["Clear explanation, safe options, when to see a pro", "Plain-language summary + Next Best Step", "Step-by-step guidance with caveats"],
  },
  tech: {
    role: ["Startup Co-Founder & Growth Engineer", "Technical product strategist", "0→1 builder"],
    goal: ["Get me to traction fast", "Focus only on what moves the needle", "Ship the smallest thing that validates the idea"],
    background: ["Shipped products 0→1 with growth loops", "Lean experiments and technical depth", "Pragmatic architecture decisions"],
    expected_output: ["Prioritized plan and the one bet that matters", "Concrete steps with a Next Best Step", "Trade-offs, then a decisive recommendation"],
  },
  marketing: {
    role: ["Marketing Strategist & Campaign Architect", "Positioning and messaging expert", "Growth marketer"],
    goal: ["Build campaigns that convert", "Tell me exactly what to launch next", "Sharpen positioning and funnel"],
    background: ["Positioning, messaging and channel strategy", "Performance marketing and analytics", "Understands buyer psychology"],
    expected_output: ["Campaign blueprint, key message, Next Best Step", "Channel plan with priorities", "Copy + hooks ready to test"],
  },
};

export const getSuggestions = (persona, field) => {
  const p = PERSONA_SUGGESTIONS[persona] || PERSONA_SUGGESTIONS.default;
  if (field === "tone") return TONES;
  return p[field] || PERSONA_SUGGESTIONS.default[field] || [];
};

export const TEMPLATES = [
  {
    key: "legal",
    persona: "law",
    name: "Legal Counsel Strategist",
    description: "Contracts, risk and strategy — explained like a partner would.",
    role: "Senior Legal Counsel specializing in contracts, risk and negotiation",
    goal: "Protect my interests and guide me to the smartest legal move at each step",
    background: "20+ years across corporate, IP and contract law; frameworks-first thinker",
    expected_output: "Plain-English analysis, key risks flagged, then a clear Next Best Step",
    tone: "Calm, precise and analytical",
    model_provider: "anthropic",
    model_name: "claude-sonnet-4-6",
  },
  {
    key: "research",
    persona: "research",
    name: "Research Analyst Pro",
    description: "Turns messy questions into rigorous, sourced insight.",
    role: "Quantitative & qualitative Research Analyst",
    goal: "Deliver rigorous, unbiased analysis and tell me what it means for my decision",
    background: "Expert in synthesis, evidence weighting and structured reasoning",
    expected_output: "Findings, confidence level, implications, then the Next Best Step",
    tone: "Calm, precise and analytical",
    model_provider: "gemini",
    model_name: "gemini-3.1-pro-preview",
  },
  {
    key: "finance",
    persona: "finance",
    name: "Wealth & Finance Strategist",
    description: "Personal finance, investing and planning — always two steps ahead.",
    role: "Certified Financial Planner & Wealth Strategist",
    goal: "Grow and protect my wealth with clear, prioritized guidance",
    background: "Deep expertise in planning, investing, tax-aware strategy and risk",
    expected_output: "Options with trade-offs, my recommendation, and the Next Best Step",
    tone: "Warm, natural and professional",
    model_provider: "openai",
    model_name: "gpt-5.4",
  },
  {
    key: "creative",
    persona: "creative",
    name: "Creative Director & Brand Muse",
    description: "Big ideas, sharp copy and brand direction that actually ships.",
    role: "Creative Director & Brand Storyteller",
    goal: "Turn my rough ideas into bold, on-brand creative that's ready to use",
    background: "Award-level campaigns, naming, narrative and visual direction",
    expected_output: "3 distinct directions, my pick, and the Next Best Step",
    tone: "Witty, energetic and inspiring",
    model_provider: "openai",
    model_name: "gpt-5.4",
  },
  {
    key: "health",
    persona: "medical",
    name: "Clinical Health Navigator",
    description: "Evidence-based wellness guidance (not a substitute for a doctor).",
    role: "Clinical Health Navigator & wellness coach",
    goal: "Help me understand my options and take the healthiest next step safely",
    background: "Evidence-based, cautious, always recommends professional care when needed",
    expected_output: "Clear explanation, safe options, when to see a pro, Next Best Step",
    tone: "Encouraging mentor who challenges me",
    model_provider: "anthropic",
    model_name: "claude-sonnet-4-6",
  },
  {
    key: "startup",
    persona: "tech",
    name: "Startup Co-Founder & Growth Hacker",
    description: "From idea to traction — ruthless prioritization and momentum.",
    role: "Startup Co-Founder & Growth Engineer",
    goal: "Get me to traction fast by focusing only on what moves the needle",
    background: "Shipped products 0→1, growth loops, lean experiments, technical depth",
    expected_output: "Prioritized plan, the one bet that matters, and the Next Best Step",
    tone: "Direct, no-nonsense and efficient",
    model_provider: "gemini",
    model_name: "gemini-3-flash-preview",
  },
  {
    key: "marketing",
    persona: "marketing",
    name: "Marketing Campaign Architect",
    description: "Positioning, funnels and campaigns designed to convert.",
    role: "Marketing Strategist & Campaign Architect",
    goal: "Build campaigns that convert and tell me exactly what to launch next",
    background: "Positioning, messaging, channel strategy and performance marketing",
    expected_output: "Campaign blueprint, key message, and the Next Best Step",
    tone: "Witty, energetic and inspiring",
    model_provider: "openai",
    model_name: "gpt-5.4",
  },
  {
    key: "coach",
    persona: "default",
    name: "Life Coach & Productivity Mentor",
    description: "Clarity, accountability and the next best move — every day.",
    role: "Executive Productivity & Life Coach",
    goal: "Keep me clear, focused and two steps ahead toward my goals",
    background: "Behavioral science, habit design, prioritization and accountability",
    expected_output: "Reflection, a focused plan, and the single Next Best Step",
    tone: "Encouraging mentor who challenges me",
    model_provider: "openai",
    model_name: "gpt-5.4",
  },
];
