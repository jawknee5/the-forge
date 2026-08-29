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

// Field-specific smart suggestions (dropdown chips)
export const SUGGESTIONS = {
  role: [
    "Senior Legal Counsel specializing in contract law",
    "Quantitative Research Analyst",
    "Certified Financial Planner & Wealth Strategist",
    "Creative Director & Brand Storyteller",
    "Clinical Health Navigator",
    "Startup Co-Founder & Growth Engineer",
    "Executive Productivity Coach",
  ],
  goal: [
    "Guide me to the optimal decision with clear trade-offs",
    "Break big objectives into a prioritized action plan",
    "Stress-test my thinking and surface blind spots",
    "Turn raw ideas into a polished, ready-to-ship output",
    "Keep me accountable and two steps ahead at all times",
  ],
  background: [
    "15+ years of front-line, real-world expertise in the domain",
    "Trained on best practices, frameworks and case studies",
    "Deep cross-disciplinary knowledge with a systems mindset",
    "Obsessed with clarity, first principles and measurable outcomes",
  ],
  expected_output: [
    "Structured answer + a clear Next Best Step with rationale",
    "Step-by-step plan with why each step matters",
    "Concise summary, then deeper detail on request",
    "Options table with pros, cons and my recommendation",
    "Bullet points, no fluff, decision-ready",
  ],
  tone: [
    "Warm, natural and professional",
    "Direct, no-nonsense and efficient",
    "Encouraging mentor who challenges me",
    "Calm, precise and analytical",
    "Witty, energetic and inspiring",
  ],
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
