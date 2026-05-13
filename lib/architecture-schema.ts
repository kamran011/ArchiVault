import { z } from 'zod'

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

export const architectureSchema = z.object({
  systemName: z.string(),
  summary: z.string(),
  futureProofScore: z.number(),
  futureProofExplanation: z.string(),
  volatilityAxes: z.array(volatilityAxisSchema),
  coreServices: z.array(coreServiceSchema).min(3).max(10),
  mermaidDiagram: z.string(),
  implementationOrder: z.array(z.string()),
  technicalRecommendations: z.array(z.string()),
  scaffoldPrompt: z.string().min(1),
})

export type ParsedArchitecture = z.infer<typeof architectureSchema>
