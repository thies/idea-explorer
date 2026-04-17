import { CONDITIONS } from './Explorer'

export default function FilterPanel({ activeConditions, setActive, ideas }) {
  const counts = {}
  ideas.forEach(idea => {
    counts[idea.condition] = (counts[idea.condition] || 0) + 1
  })

  const toggle = (cond) => {
    setActive(prev => {
      const next = new Set(prev)
      next.has(cond) ? next.delete(cond) : next.add(cond)
      return next
    })
  }

  const allOn  = activeConditions.size === Object.keys(CONDITIONS).length
  const allOff = activeConditions.size === 0

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Generation conditions</span>
      </div>

      <div className="flex gap-1.5 mb-4">
        <button
          onClick={() => setActive(new Set(Object.keys(CONDITIONS)))}
          className={`text-xs px-2 py-1 rounded ${allOn ? 'bg-gray-200 text-gray-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-150'}`}
        >
          All
        </button>
        <button
          onClick={() => setActive(new Set())}
          className={`text-xs px-2 py-1 rounded ${allOff ? 'bg-gray-200 text-gray-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-150'}`}
        >
          None
        </button>
      </div>

      <div className="space-y-1.5">
        {Object.entries(CONDITIONS).map(([cond, { label, color }]) => {
          const active = activeConditions.has(cond)
          const n = counts[cond] || 0
          return (
            <label
              key={cond}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <span
                className="w-3 h-3 rounded-full flex-none border transition"
                style={{
                  backgroundColor: active ? color : 'transparent',
                  borderColor: color,
                }}
              />
              <input
                type="checkbox"
                className="sr-only"
                checked={active}
                onChange={() => toggle(cond)}
              />
              <span className={`text-xs flex-1 leading-tight transition ${active ? 'text-gray-700' : 'text-gray-400'}`}>
                {label}
              </span>
              <span className="text-xs text-gray-400 tabular-nums">{n}</span>
            </label>
          )
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-400 leading-relaxed">
          Each dot is one AI-generated research idea. The grey background shows {' '}
          corpus papers from REE, JUE, JF, RFS, and AER. Click any coloured dot to see
          full details and rate the idea.
        </p>
      </div>
    </div>
  )
}
