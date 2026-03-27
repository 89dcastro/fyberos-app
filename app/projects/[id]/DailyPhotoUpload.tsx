'use client'

import { useState, FormEvent } from 'react'
import { supabase } from '../../../lib/supabase'

type DailyPhotoUploadProps = {
  dailyEntryId: string
  projectId: string
}

export default function DailyPhotoUpload({
  dailyEntryId,
  projectId,
}: DailyPhotoUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [photoType, setPhotoType] = useState('progress')
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleUpload(e: FormEvent) {
    e.preventDefault()

    if (!file) {
      setMessage('Please select a file.')
      return
    }

    try {
      setUploading(true)
      setMessage('')

      const fileExt = file.name.split('.').pop()
      const fileName = `${dailyEntryId}-${Date.now()}.${fileExt}`
      const filePath = `${projectId}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('daily-entry-photos')
        .upload(filePath, file)

      if (uploadError) {
        setMessage(uploadError.message)
        setUploading(false)
        return
      }

      const { data: publicUrlData } = supabase.storage
        .from('daily-entry-photos')
        .getPublicUrl(filePath)

      const photoUrl = publicUrlData.publicUrl

      const { error: insertError } = await supabase
        .from('daily_entry_photos')
        .insert({
          daily_entry_id: dailyEntryId,
          photo_url: photoUrl,
          photo_type: photoType,
        })

      if (insertError) {
        setMessage(insertError.message)
        setUploading(false)
        return
      }

      setMessage('Photo uploaded successfully.')
      setFile(null)
      window.location.reload()
    } catch (error) {
      console.error(error)
      setMessage('Unexpected error uploading photo.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <form
      onSubmit={handleUpload}
      className="space-y-4 rounded-2xl border border-white/10 bg-black/20 p-4"
    >
      <div>
        <p className="text-sm font-semibold text-white">Upload Photo</p>
        <p className="mt-1 text-xs text-white/45">
          Add field documentation to this daily entry.
        </p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-white/80">
          Photo Type
        </label>
        <select
          value={photoType}
          onChange={(e) => setPhotoType(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-[#091427] px-4 py-3 text-white outline-none transition focus:border-cyan-400/30"
        >
          <option value="progress">Progress</option>
          <option value="pipe">Pipe</option>
          <option value="box">Box / Handhole</option>
          <option value="map">Map Markup</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-white/80">
          Select Image
        </label>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white file:mr-4 file:rounded-lg file:border-0 file:bg-cyan-400/15 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-cyan-100 hover:file:bg-cyan-400/20"
        />
      </div>

      {file && (
        <div className="rounded-xl border border-cyan-400/10 bg-cyan-400/5 px-4 py-3 text-sm text-cyan-100">
          Selected file: {file.name}
        </div>
      )}

      <button
        type="submit"
        disabled={uploading}
        className="fyber-button-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
      >
        {uploading ? 'Uploading...' : 'Upload Photo'}
      </button>

      {message && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            message.toLowerCase().includes('success')
              ? 'border-lime-400/20 bg-lime-400/10 text-lime-200'
              : 'border-red-400/20 bg-red-400/10 text-red-200'
          }`}
        >
          {message}
        </div>
      )}
    </form>
  )
}