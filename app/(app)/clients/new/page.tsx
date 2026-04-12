import Link from 'next/link'
import { createClient } from './actions'

export default function NewClientPage() {
  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="fyber-page-title">Create Client</h1>
          <p className="fyber-page-subtitle">
            Add a new customer company and save its main contact details.
          </p>
        </div>

        <Link href="/clients" className="fyber-button-secondary">
          Back to Clients
        </Link>
      </section>

      <section className="fyber-card max-w-4xl p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white">Client Details</h2>
          <p className="mt-1 text-sm text-white/45">
            Enter the main information required to create a client.
          </p>
        </div>

        <form action={createClient} className="space-y-6">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">
                Company Name
              </label>
              <input
                name="company_name"
                type="text"
                placeholder="Pauley Construction"
                required
                className="fyber-input"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">
                Contact Name
              </label>
              <input
                name="contact_name"
                type="text"
                placeholder="John Smith"
                className="fyber-input"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">
                Contact Email
              </label>
              <input
                name="contact_email"
                type="email"
                placeholder="john@company.com"
                className="fyber-input"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">
                Contact Phone
              </label>
              <input
                name="contact_phone"
                type="text"
                placeholder="(555) 555-5555"
                className="fyber-input"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">
                Status
              </label>
              <select
                name="status"
                defaultValue="active"
                className="fyber-input"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" className="fyber-button-primary">
              Create Client
            </button>

            <Link href="/clients" className="fyber-button-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </section>
    </div>
  )
}