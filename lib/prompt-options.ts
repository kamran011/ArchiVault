export const TECH_STACK_OPTIONS = [
  "Any",
  "TypeScript + Next.js",
  "TypeScript + Node.js",
  "TypeScript + NestJS",
  "Python + FastAPI",
  "Python + Django",
  "Java + Spring Boot",
  "C# + .NET Core",
  "Go + Gin",
  "PHP + Laravel",
  "Ruby + Rails",
] as const

export const SCALE_OPTIONS = [
  "Startup (0–10k users)",
  "Growth (10k–1M users)",
  "Enterprise (1M+ users)",
  "Agency / Client project",
] as const

export const INDUSTRY_OPTIONS = [
  "General",
  "E-commerce",
  "Marketplace",
  "SaaS",
  "Fintech",
  "Healthtech",
  "Edtech",
  "Proptech",
  "Legaltech",
  "Logistics",
  "Gaming",
  "Media & Streaming",
] as const

export const DEFAULT_TECH_STACK = TECH_STACK_OPTIONS[0]
export const DEFAULT_SCALE = SCALE_OPTIONS[0]
export const DEFAULT_INDUSTRY = INDUSTRY_OPTIONS[0]
