"use client"

import * as React from "react"
import { errorMessage } from "@/lib/normalize-error"
import { Button } from "@/components/ui/button"

type Props = {
  children: React.ReactNode
  title?: string
}

type State = {
  message: string | null
}

export class ChunkLoadErrorBoundary extends React.Component<Props, State> {
  state: State = { message: null }

  static getDerivedStateFromError(error: unknown): State {
    return { message: errorMessage(error) }
  }

  componentDidCatch(error: unknown) {
    console.error("[ChunkLoadErrorBoundary]", error)
  }

  render() {
    if (this.state.message) {
      return (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="text-lg font-semibold text-foreground">
            {this.props.title ?? "Could not load this view"}
          </p>
          <p className="max-w-md text-sm text-muted-foreground">{this.state.message}</p>
          <Button type="button" variant="outline" onClick={() => window.location.reload()}>
            Reload page
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
