import { z } from 'zod'
import { futureProofRationaleSchema } from './future-proof-rationale'

const volatilityAxisSchema = z.object({
  id: z.string(),
  name: z.string(),
  interfaceName: z.string(),
  reason: z.string(),
  changeScenario: z.string(),
  methods: z.array(z.string()),
  currentImplementation: z.string(),
  alternativeImplementations: z.array(z.string()),
})

const coreServiceSchema = z.object({
  name: z.string(),
  responsibility: z.string(),
  dependsOn: z.array(z.string()),
  stability: z.enum(['high', 'medium', 'low']),
})

const techStackAnalysisSchema = z.object({
  selectedStack: z.string(),
  selectedScale: z.string(),
  selectedIndustry: z.string(),
  stackSummary: z.string(),
  layers: z.array(
    z.object({
      layer: z.string(),
      recommended: z.string(),
      why: z.string(),
      installCommand: z.string(),
      alternatives: z.array(z.string()),
    }),
  ),
  axisRecommendations: z.array(
    z.object({
      interfaceName: z.string(),
      recommendedLibrary: z.string(),
      installCommand: z.string(),
      adapterBoilerplate: z.string(),
      alternatives: z.array(z.string()),
    }),
  ),
  packageJson: z.string(),
  devDependencies: z.string(),
})

export const architectureSchema = z.object({
  systemName: z.string(),
  summary: z.string(),
  futureProofScore: z.number(),
  futureProofRationale: futureProofRationaleSchema,
  futureProofExplanation: z.string().optional(),
  volatilityAxes: z.array(volatilityAxisSchema),
  coreServices: z.array(coreServiceSchema).min(3).max(10),
  mermaidDiagram: z.string(),
  implementationOrder: z.array(z.string()),
  technicalRecommendations: z.array(z.string()),
  scaffoldPrompt: z.string().min(1).optional(),
  techStackAnalysis: techStackAnalysisSchema.optional(),
})

/** Phase-1 architecture generation — no tech stack or scaffold (lazy-loaded later). */
export const architectureCoreSchema = architectureSchema.omit({
  scaffoldPrompt: true,
  techStackAnalysis: true,
})

export { techStackAnalysisSchema }

export type ParsedArchitecture = z.infer<typeof architectureSchema>
export type ParsedArchitectureCore = z.infer<typeof architectureCoreSchema>
