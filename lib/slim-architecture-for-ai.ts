/** Strip heavy fields before sending architecture JSON to LLM follow-up calls. */
export function slimArchitectureForAi(
  architecture: Record<string, unknown>,
): Record<string, unknown> {
  const { scaffoldPrompt, systemDesign, ...rest } = architecture
  void scaffoldPrompt
  void systemDesign

  const slim: Record<string, unknown> = { ...rest }

  if (slim.techStackAnalysis && typeof slim.techStackAnalysis === "object") {
    const tsa = slim.techStackAnalysis as Record<string, unknown>
    slim.techStackAnalysis = {
      selectedStack: tsa.selectedStack,
      selectedScale: tsa.selectedScale,
      selectedIndustry: tsa.selectedIndustry,
      stackSummary: tsa.stackSummary,
      layers: tsa.layers,
      axisRecommendations: Array.isArray(tsa.axisRecommendations)
        ? (tsa.axisRecommendations as Record<string, unknown>[]).map((a) => ({
            interfaceName: a.interfaceName,
            recommendedLibrary: a.recommendedLibrary,
          }))
        : [],
    }
  }

  if (Array.isArray(slim.volatilityAxes)) {
    slim.volatilityAxes = (slim.volatilityAxes as Record<string, unknown>[]).map((axis) => ({
      id: axis.id,
      name: axis.name,
      interfaceName: axis.interfaceName,
      reason: axis.reason,
    }))
  }

  if (Array.isArray(slim.coreServices)) {
    slim.coreServices = (slim.coreServices as Record<string, unknown>[]).map((svc) => ({
      name: svc.name,
      responsibility: svc.responsibility,
      dependsOn: svc.dependsOn,
    }))
  }

  return slim
}
