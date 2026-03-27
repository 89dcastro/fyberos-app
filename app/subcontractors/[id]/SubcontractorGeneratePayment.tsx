'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { generateSubcontractorPayment } from './payment-actions'

export default function SubcontractorGeneratePayment({
  subcontractorId,
  fromDate,
  toDate,
  entries,
  footage,
  amount,
}: any) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleConfirm() {
    setLoading(true)

    await generateSubcontractorPayment({
        subcontractorId,
        fromDate,
        toDate,
        })

        router.refresh()
        setOpen(false)
        setLoading(false)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fyber-button-primary"
      >
        Generate Payment
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-lg rounded-2xl bg-[#091427] p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white">
              Confirm Payment
            </h2>

            <div className="mt-4 space-y-2 text-sm text-white/75">
              <p>Entries: {entries}</p>
              <p>Footage: {footage.toLocaleString()} ft</p>
              <p>
                Amount: $
                {amount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setOpen(false)}
                className="fyber-button-secondary w-full"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirm}
                disabled={loading}
                className="fyber-button-primary w-full"
              >
                {loading ? 'Processing...' : 'Confirm Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}