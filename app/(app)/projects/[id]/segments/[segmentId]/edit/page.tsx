import { createSupabaseServerClient } from '@/lib/supabase-server'
import { notFound, redirect } from 'next/navigation'

export default async function EditSegmentPage({
  params,
}: {
  params: Promise<{ id: string; segmentId: string }>
}) {
  const { id, segmentId } = await params
  const supabase = await createSupabaseServerClient()

  const { data: segment, error } = await supabase
    .from('project_segments')
    .select('*')
    .eq('id', segmentId)
    .eq('project_id', id)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!segment) {
    notFound()
  }

  async function updateSegment(formData: FormData) {
    'use server'

    const supabase = await createSupabaseServerClient()

    const name = String(formData.get('name') || '').trim()
    const color = String(formData.get('color') || '').trim()
    const estimatedFootageRaw = String(formData.get('estimated_footage') || '').trim()

    const estimatedFootage = estimatedFootageRaw
      ? Number(estimatedFootageRaw)
      : null

    const { error: updateError } = await supabase
      .from('project_segments')
      .update({
        name,
        color: color || null,
        estimated_footage:
          estimatedFootage !== null && !Number.isNaN(estimatedFootage)
            ? estimatedFootage
            : null,
      })
      .eq('id', segmentId)
      .eq('project_id', id)

    if (updateError) {
      throw new Error(updateError.message)
    }

    redirect(`/projects/${id}`)
  }

  return (
    <div className="space-y-6">
      <div>
        <a href={`/projects/${id}`} className="fyber-button-secondary">
  Back to Project
</a>

        <h1 className="fyber-page-title mt-4">Edit Segment</h1>
        <p className="fyber-page-subtitle">
          Update segment name, color, and estimated footage.
        </p>
      </div>

      <form action={updateSegment} className="fyber-card space-y-5 p-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-white/70">
            Segment Name
          </label>
          <input
            name="name"
            defaultValue={segment.name || ''}
            className="fyber-input"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-white/70">
            Color
          </label>
          <input
            name="color"
            defaultValue={segment.color || ''}
            className="fyber-input"
            placeholder="Blue, Red, Green, etc."
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-white/70">
            Estimated Footage
          </label>
          <input
            type="number"
            name="estimated_footage"
            defaultValue={segment.estimated_footage || ''}
            className="fyber-input"
            min="0"
            step="1"
          />
        </div>

        <div className="flex gap-3">
          <button type="submit" className="fyber-button-primary">
            Save Segment
          </button>

          <a href={`/projects/${id}`} className="fyber-button-secondary">
            Cancel
          </a>
        </div>
      </form>
    </div>
  )
}