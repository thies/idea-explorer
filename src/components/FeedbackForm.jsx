import { useState } from 'react'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

const DIMENSIONS = [
  { key: 'originality', label: 'Originality',     desc: 'How novel is this research direction?' },
  { key: 'feasibility', label: 'Feasibility',      desc: 'Could this be executed with real data?' },
  { key: 'impact',      label: 'Relevance / impact', desc: 'How important is the research question?' },
]

function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          className="transition"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 20 20"
            fill={(hovered || value) >= n ? '#FBBF24' : 'none'}
            stroke={(hovered || value) >= n ? '#FBBF24' : '#D1D5DB'}
            strokeWidth="1.5"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  )
}

export default function FeedbackForm({ idea, user, onSubmit }) {
  const [scores, setScores]   = useState({ originality: 0, feasibility: 0, impact: 0 })
  const [comments, setComments] = useState('')
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')

  const ready = DIMENSIONS.every(d => scores[d.key] > 0)

  const submit = async (e) => {
    e.preventDefault()
    if (!ready) return
    setSaving(true)
    try {
      await setDoc(doc(db, 'feedback', `${user.uid}_${idea.id}`), {
        userId:      user.uid,
        ideaId:      idea.id,
        condition:   idea.condition,
        originality: scores.originality,
        feasibility: scores.feasibility,
        impact:      scores.impact,
        comments:    comments.trim(),
        timestamp:   serverTimestamp(),
      })
      onSubmit()
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {DIMENSIONS.map(({ key, label, desc }) => (
        <div key={key}>
          <label className="block text-xs font-medium text-gray-700 mb-0.5">{label}</label>
          <p className="text-xs text-gray-400 mb-1.5">{desc}</p>
          <StarRating value={scores[key]} onChange={v => setScores(s => ({ ...s, [key]: v }))} />
        </div>
      ))}

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Comments (optional)</label>
        <textarea
          value={comments}
          onChange={e => setComments(e.target.value)}
          rows={3}
          placeholder="Any thoughts on this idea…"
          className="w-full text-xs border border-gray-200 rounded-lg p-2 resize-none focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={!ready || saving}
        className="w-full py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:opacity-40 transition"
      >
        {saving ? 'Submitting…' : 'Submit rating'}
      </button>

      <p className="text-xs text-gray-400">Ratings cannot be edited after submission.</p>
    </form>
  )
}
