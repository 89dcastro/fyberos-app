import Link from 'next/link'
import { createSubcontractor } from './actions'

export default function NewSubcontractorPage() {
  return (
    <div className="space-y-6">
      <section className="flex justify-between">
        <div>
          <h1 className="fyber-page-title">Create Subcontractor</h1>
          <p className="fyber-page-subtitle">
            Register an external contractor company.
          </p>
        </div>

        <Link href="/subcontractors" className="fyber-button-secondary">
          Back
        </Link>
      </section>

      <section className="fyber-card max-w-5xl p-6">
        <form action={createSubcontractor} className="space-y-6">

          <div className="grid gap-5 md:grid-cols-2">

            <input name="company_name" placeholder="Company Name" required className="fyber-input" />

            <input name="contact_name" placeholder="Contact Name" className="fyber-input" />

            <input name="email" placeholder="Email" className="fyber-input" />

            <input name="phone" placeholder="Phone" className="fyber-input" />

            <input name="address" placeholder="Address" className="fyber-input" />

            <select name="status" className="fyber-input">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

          </div>

          <textarea name="notes" placeholder="Notes" rows={5} className="fyber-input" />

          <button className="fyber-button-primary">
            Create Subcontractor
          </button>

        </form>
      </section>
    </div>
  )
}