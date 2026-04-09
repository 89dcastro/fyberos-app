import { getOpenTimeEntry, clockIn, clockOut, getUnpaidDailySummary } from './actions'
import LocalTime from '@/components/local-time'



export default async function TimeTrackingPage() {
  const openEntry = await getOpenTimeEntry()
  const unpaidSummary = await getUnpaidDailySummary()
const unpaidDays = unpaidSummary.days

  return (
    <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center text-center">
      <h1 className="mb-2 text-2xl font-bold text-white">
        My Time
      </h1>
      <p className="mb-6 text-sm text-white/50">
        Clock in, clock out, and review unpaid hours.
      </p>

      <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 px-6 py-4">
          <p className="text-sm text-white/50">Current Status</p>
          <p className={`mt-2 text-2xl font-bold ${openEntry ? 'text-emerald-300' : 'text-amber-300'}`}>
            {openEntry ? 'Working' : 'Not Clocked In'}
          </p>
        </div>

      {openEntry ? (
       <>
       <p className="mb-2 text-lg font-semibold text-white">
  {openEntry ? 'Clocked In' : 'Ready to Clock In'}
</p>
       <p className="mb-6 text-2xl font-bold text-cyan-400">
 Clocked in at: <LocalTime value={openEntry.clock_in} />
</p>

        

        <form action={clockOut}>
          <button className="w-full max-w-md rounded-3xl bg-cyan-500 px-12 py-8 text-2xl font-bold text-black shadow-lg transition active:scale-95">
            Clock Out
          </button>
        </form>
        </>
      ) : (
        <form action={clockIn}>
          <button className="w-full max-w-md rounded-3xl bg-cyan-500 px-12 py-8 text-2xl font-bold text-black shadow-lg transition active:scale-95">
            Clock In
          </button>
        </form>
      )}

      <a
  href="/time-tracking/my-hours"
  className="mt-6 text-sm text-cyan-300 underline"
>
  View My Hours
</a>
      <div className="mt-8 mb-6 w-full max-w-md rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-400/10 to-transparent p-5 shadow-[0_0_25px_rgba(34,211,238,0.15)]">

        <div className="flex items-center gap-4">
          
          {/* ICON */}
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-400/20 text-cyan-300">
            ⏱
          </div>

          {/* TEXT */}
          <div>
            <p className="text-xs text-white/50">Total Unpaid Hours</p>
            <p className="text-2xl font-bold text-cyan-300">
              {unpaidSummary.totalUnpaidHours.toFixed(2)}h
            </p>
          </div>

        </div>

      </div>
     <div className="mt-10 w-full max-w-md text-left">
  <p className="mb-2 text-sm text-white/50">Unpaid Hours</p>

  <div className="space-y-2">
    {unpaidDays.length === 0 ? (
      <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white/50">
        No unpaid hours pending.
      </div>
    ) : (
      unpaidDays.map((day) => (
        <div
          key={day.date}
          className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3 text-sm"
        >
          <div>
            <p className="font-medium text-white">
              {new Date(`${day.date}T12:00:00`).toLocaleDateString()}
            </p>
            {day.hasOpen && (
              <p className="text-xs text-amber-300">Open entry still running</p>
            )}
          </div>

          <div className="text-right">
            <p className="font-semibold text-cyan-300">
              {day.hours.toFixed(2)}h
            </p>
            <p className="text-xs text-white/45">Unpaid</p>
          </div>
        </div>
      ))
    )}
  </div>
</div>
    </div>
  )
}