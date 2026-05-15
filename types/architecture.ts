export interface FutureProofDeduction {
  points: number
  reason: string
}

export interface FutureProofScenario {
  title: string
  trigger: string
  whatChanges: string
  whatStaysStable: string
}

export interface FutureProofRationale {
  headline: string
  axesCovered: string[]
  deductions: FutureProofDeduction[]
  scenarios: FutureProofScenario[]
}

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

export interface PatternRecommendation {
  patternName: string
  patternCategory:
    | 'storage'
    | 'caching'
    | 'communication'
    | 'reliability'
    | 'scaling'
    | 'data-processing'
    | 'api'
    | 'infrastructure'
    | 'consistency'
    | 'observability'
  priority: 'mandatory' | 'recommended' | 'optional'
  reason: string
  riskIfIgnored: string
  complexity: 'low' | 'medium' | 'high'
  appliesTo: string
}

export interface SystemDesign {
  infrastructureSummary: string
  patterns: PatternRecommendation[]
  dataFlowDescription: string
  scalingStrategy: string
  criticalFailurePoints: string[]
  estimatedInfrastructureCost: string
}

export interface TechChoice {
  layer: string
  recommended: string
  why: string
  installCommand: string
  alternatives: string[]
}

export interface AxisTechRecommendation {
  interfaceName: string
  recommendedLibrary: string
  installCommand: string
  adapterBoilerplate: string
  alternatives: string[]
}

export interface TechStackAnalysis {
  selectedStack: string
  selectedScale: string
  selectedIndustry: string
  stackSummary: string
  layers: TechChoice[]
  axisRecommendations: AxisTechRecommendation[]
  packageJson: string
  devDependencies: string
}

export interface Architecture {
  systemName: string
  summary: string
  futureProofScore: number
  futureProofRationale?: FutureProofRationale
  futureProofExplanation?: string
  volatilityAxes: VolatilityAxis[]
  coreServices: CoreService[]
  mermaidDiagram: string
  implementationOrder: string[]
  technicalRecommendations: string[]
  scaffoldPrompt?: string
  techStackAnalysis?: TechStackAnalysis
  systemDesign?: SystemDesign
}
