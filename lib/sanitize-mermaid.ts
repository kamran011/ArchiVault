/**
 * Fixes common invalid Mermaid from LLMs (labeled arrows, etc.) before render or persist.
 */
export function sanitizeMermaidDiagram(diagram: string): string {
  let s = diagram.replace(/\\n/g, "\n").replace(/\\t/g, "  ").trim()

  // Labeled arrows: -->|uses|> or -->|label| — invalid in graph TD for our parser
  s = s.replace(/-->\|[^|\n]*\|>?/g, "-->")
  s = s.replace(/==>\|[^|\n]*\|>?/g, "==>")
  s = s.replace(/---\|[^|\n]*\|---?>/g, "-->")

  // Edge text without pipes: A -- label --> B
  s = s.replace(/(--)\s+[^\n>-]+?\s+(-->)/g, "$1$2")

  // Stray pipe fragments from partial cleanup
  s = s.replace(/\|>/g, ">")

  if (!/^graph\s+/im.test(s)) {
    s = `graph TD\n${s}`
  }

  return s
}
