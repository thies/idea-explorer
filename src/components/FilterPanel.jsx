import { CONDITIONS } from './Explorer'

export default function FilterPanel({ activeCondition, setActive, ideas }) {
  const counts = {}
  ideas.forEach(idea => {
    counts[idea.condition] = (counts[idea.condition] || 0) + 1
  })

  return (
    <div className="p-4">
      <div className="mb-3">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Generation condition
        </span>
      </div>

      <div className="space-y-1.5">
        {Object.entries(CONDITIONS).map(([cond, { label }]) => {
          const active = activeCondition === cond
          const n = counts[cond] || 0
          return (
            <label
              key={cond}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <span
                className="w-3 h-3 rounded-full flex-none border-2 transition"
                style={{
                  backgroundColor: active ? '#F21A00' : 'transparent',
                  borderColor: active ? '#F21A00' : '#cccccc',
                }}
              />
              <input
                type="radio"
                name="condition"
                className="sr-only"
                checked={active}
                onChange={() => setActive(cond)}
              />
              <span className={`text-xs flex-1 leading-tight transition ${active ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>
                {label}
              </span>
              <span className="text-xs text-gray-400 tabular-nums">{n}</span>
            </label>
          )
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-400 leading-relaxed">
          Blue dots: REE corpus. Grey dots: top journals (JUE, JF, RFS, AER).
          Red dots: AI-generated ideas for the selected condition.
          Click any red dot to see details and rate the idea.
        </p>
      </div>
    </div>
  )
}
