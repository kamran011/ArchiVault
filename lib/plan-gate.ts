export type UserPlan = "free" | "blueprint" | "pro" | "team"

export function canAccessScaffoldPrompt(plan: UserPlan): boolean {
  return plan === "blueprint" || plan === "pro" || plan === "team"
}

export function canAccessTechStack(plan: UserPlan): boolean {
  return plan === "pro" || plan === "team"
}

export function canExportPdf(plan: UserPlan): boolean {
  return plan === "blueprint" || plan === "pro" || plan === "team"
}

export function canAccessSystemDesign(plan: UserPlan): boolean {
  return plan === "team"
}

export function redactArchitectureForPlan<T extends object>(arch: T, plan: UserPlan): T {
  const rest = { ...arch } as T & {
    scaffoldPrompt?: string
    techStackAnalysis?: unknown
    systemDesign?: unknown
  }
  if (!canAccessScaffoldPrompt(plan)) {
    delete rest.scaffoldPrompt
  }
  if (!canAccessTechStack(plan)) {
    delete rest.techStackAnalysis
  }
  if (!canAccessSystemDesign(plan)) {
    delete rest.systemDesign
  }
  if (
    canAccessScaffoldPrompt(plan) &&
    canAccessTechStack(plan) &&
    canAccessSystemDesign(plan)
  ) {
    return arch
  }
  return rest as T
}
