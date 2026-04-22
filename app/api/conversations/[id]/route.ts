import { createClient } from "@/lib/supabase/server"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data, error } = await supabase
    .from("conversations")
    .select("id, title, source_type, source_url, source_title, messages, created_at")
    .eq("id", id)
    .single()

  if (error || !data) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }

  return Response.json({ conversation: data })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { error } = await supabase.from("conversations").delete().eq("id", id)
  if (error) {
    return Response.json({ error: "Could not delete" }, { status: 500 })
  }
  return Response.json({ ok: true })
}
