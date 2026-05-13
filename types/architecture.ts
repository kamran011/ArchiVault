export interface VolatilityAxis {
  id: string
  name: string
  interfaceName: string
  reason: string
  changeScenario: string
  methods: string[]
  currentImplementation: string
  alternativeImplementations: string[]
}

export interface CoreService {
  name: string
  responsibility: string
  dependsOn: string[]
  stability: 'high' | 'medium' | 'low'
}

export interface Architecture {
  systemName: string
  summary: string
  futureProofScore: number
  futureProofExplanation: string
  volatilityAxes: VolatilityAxis[]
  coreServices: CoreService[]
  mermaidDiagram: string
  implementationOrder: string[]
  technicalRecommendations: string[]
  scaffoldPrompt?: string
}
