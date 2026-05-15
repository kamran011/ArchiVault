import type { Architecture, VolatilityAxis } from "@/types/architecture"
import { stripLeadingListMarker } from "@/lib/utils"

function fileExt(techStack: string): string {
  if (techStack.includes("Python")) return ".py"
  if (techStack.includes("Java")) return ".java"
  if (techStack.includes("C#")) return ".cs"
  if (techStack.includes("Go")) return ".go"
  if (techStack.includes("PHP")) return ".php"
  if (techStack.includes("Ruby")) return ".rb"
  return ".ts"
}

function adapterClassName(axis: VolatilityAxis): string {
  const impl = axis.currentImplementation.trim()
  const word = impl.split(/[\s,]+/)[0]?.replace(/[^a-zA-Z0-9]/g, "") || ""
  const base = axis.interfaceName.replace(/^I/, "")
  if (word.length > 1) {
    const capped = word.charAt(0).toUpperCase() + word.slice(1)
    return `${capped}${base}Adapter`
  }
  return `${base}Adapter`
}

function adapterPath(axis: VolatilityAxis, techStack: string, ext: string): string {
  const domain = axis.id.replace(/([A-Z])/g, "-$1").toLowerCase().replace(/^-/, "") || "core"
  if (techStack.includes("NestJS")) {
    return `src/adapters/${domain}/${adapterClassName(axis)}${ext}`
  }
  if (techStack.includes("Next.js") || techStack.includes("Node.js")) {
    return `src/adapters/${domain}/${adapterClassName(axis)}${ext}`
  }
  if (techStack.includes("FastAPI") || techStack.includes("Django")) {
    return `adapters/${domain}/${adapterClassName(axis).toLowerCase()}${ext}`
  }
  return `src/adapters/${domain}/${adapterClassName(axis)}${ext}`
}

function interfacePath(interfaceName: string, techStack: string, ext: string): string {
  if (techStack.includes("NestJS") || techStack.includes("Next.js") || techStack.includes("Node.js")) {
    return `src/interfaces/${interfaceName}${ext}`
  }
  if (techStack.includes("FastAPI") || techStack.includes("Django")) {
    return `interfaces/${interfaceName.toLowerCase()}${ext}`
  }
  return `src/interfaces/${interfaceName}${ext}`
}

function servicePath(name: string, techStack: string, ext: string): string {
  const file = name.replace(/Service$/, "") + "Service"
  if (techStack.includes("NestJS")) {
    return `src/modules/${file.toLowerCase().replace(/service$/, "")}/${file}${ext}`
  }
  return `src/services/${file}${ext}`
}

function folderStructure(techStack: string): string {
  if (techStack.includes("NestJS")) {
    return `src/
├── interfaces/
├── adapters/
│   └── [domain]/
├── modules/
│   └── [feature]/
│       ├── [feature].module.ts
│       ├── [feature].service.ts
│       └── [feature].controller.ts
└── config/
    └── container.ts`
  }
  if (techStack.includes("Next.js")) {
    return `app/
src/
├── interfaces/
├── adapters/
├── services/
└── config/
    └── container.ts`
  }
  return `src/
├── interfaces/
├── adapters/
├── services/
└── config/
    └── container.ts`
}

function axisInstall(axis: VolatilityAxis, analysis?: Architecture["techStackAnalysis"]): string {
  const match = analysis?.axisRecommendations.find((a) => a.interfaceName === axis.interfaceName)
  return match?.installCommand ?? `install SDK for ${axis.currentImplementation}`
}

function axisLibrary(axis: VolatilityAxis, analysis?: Architecture["techStackAnalysis"]): string {
  const match = analysis?.axisRecommendations.find((a) => a.interfaceName === axis.interfaceName)
  return match?.recommendedLibrary ?? axis.currentImplementation
}

/**
 * Deterministic scaffold prompt from validated architecture — not token-budget limited.
 */
export function buildScaffoldPrompt(architecture: Architecture, techStack: string): string {
  const stack = architecture.techStackAnalysis?.selectedStack || techStack || "Any"
  const ext = fileExt(stack)
  const analysis = architecture.techStackAnalysis

  const interfaceBlocks = architecture.volatilityAxes
    .map((axis) => {
      const methods = axis.methods.map((m) => `  - ${m}`).join("\n")
      return `${interfacePath(axis.interfaceName, stack, ext)}\n${methods}`
    })
    .join("\n\n")

  const adapterBlocks = architecture.volatilityAxes
    .map((axis) => {
      return `${adapterPath(axis, stack, ext)}
- Implements: ${axis.interfaceName}
- Library: ${axisLibrary(axis, analysis)}
- Install: ${axisInstall(axis, analysis)}
- Stub all methods with TODO + console.log`
    })
    .join("\n\n")

  const serviceBlocks = architecture.coreServices
    .map((svc) => {
      const deps = svc.dependsOn.length ? svc.dependsOn.join(", ") : "(none)"
      return `${servicePath(svc.name, stack, ext)}
- Responsibility: ${svc.responsibility}
- Depends on: ${deps}
- Constructor injection only`
    })
    .join("\n\n")

  const depsBlock = analysis
    ? `Production dependencies:\n${analysis.packageJson}\n\nDev dependencies:\n${analysis.devDependencies}`
    : "Add package.json with dependencies inferred from adapters above."

  const layersBlock = analysis?.layers.length
    ? analysis.layers.map((l) => `- ${l.layer}: ${l.recommended} (${l.installCommand})`).join("\n")
    : ""

  return `## ROLE
You are an expert software architect implementing ${architecture.systemName} using Volatility-Based Decomposition (VBD).

## OBJECTIVE
Scaffold the complete project for "${architecture.systemName}" using ${stack}.
Create every interface, adapter, core service, and DI wiring from the architecture below.

## CONTEXT
${architecture.summary}

VBD rules:
- Interfaces (I-prefixed) are stable contracts — never change
- Adapters implement interfaces and can be swapped
- Core services depend ONLY on interfaces, never concrete adapters
- Wire all dependencies in one place (container / Nest modules)
- Never instantiate adapters inside services

Scale: ${analysis?.selectedScale ?? "not specified"}
Industry: ${analysis?.selectedIndustry ?? "not specified"}
${layersBlock ? `\nRecommended stack layers:\n${layersBlock}` : ""}

## DATA

### System: ${architecture.systemName}
### Tech stack: ${stack}

### Interfaces to create:
${interfaceBlocks}

### Adapters to create:
${adapterBlocks}

### Core services to create:
${serviceBlocks}

### Folder structure:
${folderStructure(stack)}

### Dependencies:
${depsBlock}

### Implementation order:
${architecture.implementationOrder.map((s, i) => `${i + 1}. ${stripLeadingListMarker(s)}`).join("\n")}

### Rules:
- Constructor injection throughout
- No direct adapter instantiation in services
- Add TODO comments where business logic goes
- Match ${stack} conventions (modules, providers, config)
- Use libraries from Tech Stack tab axisRecommendations where provided`
}
