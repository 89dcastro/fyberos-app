import { getMyHoursSummary } from '../actions'

export default async function MyHoursPage() {
  const data = await getMyHoursSummary()

  return (
    <div className="space-y-6 p-6">

      <h1 className="text-2xl font-bold text-white">My Hours</h1>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 gap-4">
        
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-white/50">Today</p>
          <p className="text-xl font-bold text-cyan-300">
            {data.todayHours.toFixed(2)}h
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-white/50">This Week</p>
          <p className="text-xl font-bold text-cyan-300">
            {data.weekHours.toFixed(2)}h
          </p>
        </div>

      </div>

      {/* HISTORY */}
      <div>
        <p className="mb-2 text-sm text-white/50">History</p>

        <div className="space-y-2">
          {data.entries.slice(0, 10).map((entry: any) => (
            <div
              key={entry.id}
              className="flex justify-between rounded-lg border border-white/10 bg-white/5 p-3 text-sm"
            >
              <span>
                {new Date(`${entry.entry_date}T12:00:00`).toLocaleDateString()}
              </span>

              <span className="text-cyan-300">
                {entry.total_hours
                  ? `${entry.total_hours.toFixed(2)}h`
                  : 'Open'}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}