export type UserPlan = "free" | "pro" | "team"

export function canAccessScaffoldPrompt(plan: UserPlan): boolean {
  return plan === "pro" || plan === "team"
}

export function canExportPdf(plan: UserPlan): boolean {
  return plan === "pro" || plan === "team"
}

export function redactArchitectureForPlan<T extends { scaffoldPrompt?: string }>(
  arch: T,
  plan: UserPlan,
): T {
  if (canAccessScaffoldPrompt(plan)) return arch
  const rest = { ...arch }
  delete rest.scaffoldPrompt
  return rest
}
