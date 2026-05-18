import { execSync } from "node:child_process"
import { rmSync } from "node:fs"
import { join } from "node:path"

const root = join(import.meta.dirname, "..")
const nextDir = join(root, ".next")

function killPort(port) {
  try {
    if (process.platform === "win32") {
      const out = execSync(`netstat -ano | findstr :${port}`, { encoding: "utf8" })
      const pids = new Set()
      for (const line of out.split("\n")) {
        const trimmed = line.trim()
        if (!trimmed.includes("LISTENING")) continue
        const pid = trimmed.split(/\s+/).pop()
        if (pid && /^\d+$/.test(pid)) pids.add(pid)
      }
      for (const pid of pids) {
        try {
          execSync(`taskkill /PID ${pid} /F`, { stdio: "ignore" })
        } catch {
          // already gone
        }
      }
    } else {
      execSync(`lsof -ti:${port} | xargs kill -9`, { stdio: "ignore" })
    }
  } catch {
    // port not in use
  }
}

killPort(3000)
killPort(3001)

try {
  rmSync(nextDir, { recursive: true, force: true })
} catch {
  // ignore
}

console.log("Cleared .next and freed ports 3000/3001. Starting dev server…\n")
execSync("npm run dev", { cwd: root, stdio: "inherit" })
