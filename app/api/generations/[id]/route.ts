import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { getServiceRoleClient } from "@/lib/supabase"

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function DELETE(_req: Request, context: RouteContext) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await context.params
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 })
  }

  const supabase = getServiceRoleClient()
  if (supabase instanceof NextResponse) return supabase

  const { data, error: fetchErr } = await supabase
    .from("generations")
    .select("clerk_id")
    .eq("id", id)
    .maybeSingle()

  if (fetchErr) {
    console.error(fetchErr)
    return NextResponse.json({ error: "Database error" }, { status: 500 })
  }

  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  if (data.clerk_id !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { error: deleteErr } = await supabase.from("generations").delete().eq("id", id)

  if (deleteErr) {
    console.error(deleteErr)
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
