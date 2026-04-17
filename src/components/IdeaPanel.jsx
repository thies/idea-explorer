import { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { CONDITIONS } from './Explorer'
import FeedbackForm from './FeedbackForm'

function Score({ label, value }) {
  if (value == null) return null
  const pct = Math.round(value * 100)
  return (
    <div>
      <div className="flex justify-between text-xs mb-0.5">
        <span className="text-gray-500">{label}</span>
        <span className="font-medium text-gray-700">{value.toFixed(2)}</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-400 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function Field({ label, text }) {
  if (!text) return null
  return (
    <div>
      <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">{label}</dt>
      <dd className="text-sm text-gray-700 leading-relaxed">{text}</dd>
    </div>
  )
}

export default function IdeaPanel({ idea, user, onClose }) {
  const [submitted, setSubmitted] = useState(false)
  const [existing, setExisting]   = useState(null)
  const [checking, setChecking]   = useState(true)

  const cond = CONDITIONS[idea.condition] || { label: idea.condition, color: '#999' }

  // Check if user already rated this idea
  useEffect(() => {
    if (!user) { setChecking(false); return }
    setChecking(true)
    setSubmitted(false)
    setExisting(null)
    const ref = doc(db, 'feedback', `${user.uid}_${idea.id}`)
    getDoc(ref).then(snap => {
      if (snap.exists()) {
        setExisting(snap.data())
        setSubmitted(true)
      }
      setChecking(false)
    })
  }, [idea.id, user?.uid])

  return (
    <div className="flex flex-col h-full">
      {/* Panel header */}
      <div className="flex items-start justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full flex-none mt-0.5"
            style={{ backgroundColor: cond.color }}
          />
          <span className="text-xs text-gray-500 truncate">{cond.label}</span>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition flex-none ml-2"
          aria-label="Close"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Scores bar */}
        <div className="space-y-2">
          <Score label="Atypicality" value={idea.atypicality_score} />
          <Score label="Feasibility"  value={idea.feasibility_score} />
          <Score label="Composite"    value={idea.composite_score} />
        </div>

        {/* Cluster */}
        {idea.assigned_label && (
          <div className="text-xs text-gray-400">
            Cluster: <span className="text-gray-600">{idea.assigned_label}</span>
          </div>
        )}

        <hr className="border-gray-100" />

        {/* Idea fields */}
        <dl className="space-y-4">
          <Field label="Research question" text={idea.research_question} />
          <Field label="Method"            text={idea.method} />
          <Field label="Data"              text={idea.data} />
          <Field label="Expected finding"  text={idea.key_finding} />
          <Field label="Novelty rationale" text={idea.novelty_rationale} />
        </dl>

        {/* Nearest neighbour */}
        {idea.nn_title && (
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-0.5">Nearest corpus paper</p>
            <p className="text-xs text-gray-600 leading-relaxed">{idea.nn_title}</p>
            {idea.nn_dist != null && (
              <p className="text-xs text-gray-400 mt-1">Distance: {idea.nn_dist.toFixed(3)}</p>
            )}
          </div>
        )}

        <hr className="border-gray-100" />

        {/* Feedback section */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Your rating
          </h3>
          {!user ? (
            <p className="text-xs text-gray-400">
              <a
                href="#"
                onClick={e => { e.preventDefault(); import('../firebase').then(({ auth, googleProvider }) => { import('firebase/auth').then(({ signInWithPopup }) => signInWithPopup(auth, googleProvider)) }) }}
                className="text-blue-500 hover:underline"
              >
                Sign in
              </a>
              {' '}to rate this idea.
            </p>
          ) : checking ? (
            <p className="text-xs text-gray-400">Checking…</p>
          ) : submitted ? (
            <div className="space-y-1">
              <p className="text-xs text-green-600 font-medium">Rating submitted.</p>
              {existing && (
                <div className="text-xs text-gray-500 space-y-0.5 mt-2">
                  <p>Originality: {existing.originality}/5</p>
                  <p>Feasibility: {existing.feasibility}/5</p>
                  <p>Relevance/Impact: {existing.impact}/5</p>
                  {existing.comments && <p>Comments: {existing.comments}</p>}
                </div>
              )}
            </div>
          ) : (
            <FeedbackForm idea={idea} user={user} onSubmit={() => setSubmitted(true)} />
          )}
        </div>
      </div>
    </div>
  )
}
