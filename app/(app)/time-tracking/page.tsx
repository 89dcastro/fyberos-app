import { getOpenTimeEntry, clockIn, clockOut } from './actions'
import { getRecentEntries } from './actions'



export default async function TimeTrackingPage() {
  const openEntry = await getOpenTimeEntry()
  const recentEntries = await getRecentEntries()

  return (
    <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center text-center">
      <h1 className="text-xl font-semibold text-white mb-6">
        Time Tracking
      </h1>

      {openEntry ? (
       <>
       <p className="mb-2 text-lg font-semibold text-white">
  {openEntry ? 'Clocked In' : 'Ready to Clock In'}
</p>
       <p className="mb-6 text-2xl font-bold text-cyan-400">
  Clocked in at: {new Date(openEntry.clock_in).toLocaleTimeString()}
</p>
        <form action={clockOut}>
          <button className="rounded-2xl bg-cyan-500 px-12 py-6 text-xl font-bold text-black shadow-lg active:scale-95">
            Clock Out
          </button>
        </form>
        </>
      ) : (
        <form action={clockIn}>
          <button className="rounded-2xl bg-cyan-500 px-12 py-6 text-xl font-bold text-black shadow-lg active:scale-95">
            Clock In
          </button>
        </form>
      )}
      <div className="mt-10 w-full max-w-md">
  <p className="mb-2 text-sm text-white/50">Recent Activity</p>

  <div className="space-y-2">
    {recentEntries.map((entry) => (
      <div
        key={entry.id}
        className="flex justify-between rounded-lg border border-white/10 bg-white/5 p-3 text-sm"
      >
        <span>
          {new Date(entry.clock_in).toLocaleDateString()}
        </span>
        <span>
          {entry.total_hours
            ? `${entry.total_hours.toFixed(2)}h`
            : 'Active'}
        </span>
      </div>
    ))}
  </div>
</div>
    </div>
  )
}