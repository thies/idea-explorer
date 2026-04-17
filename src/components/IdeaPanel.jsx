import { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { CONDITIONS } from './Explorer'
import FeedbackForm from './FeedbackForm'

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
  const [submitted, setSubmitted]   = useState(false)
  const [existing, setExisting]     = useState(null)
  const [checking, setChecking]     = useState(true)
  const [showReview, setShowReview] = useState(false)

  const cond = CONDITIONS[idea.condition] || { label: idea.condition, color: '#999' }

  // Reset state when idea changes
  useEffect(() => {
    setShowReview(false)
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
            style={{ backgroundColor: '#F21A00' }}
          />
          <span className="text-xs text-gray-500 truncate">{cond.label}</span>
          {idea.assigned_label && (
            <span className="text-xs text-gray-400 truncate">· {idea.assigned_label}</span>
          )}
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

        {/* Review section */}
        {!user ? (
          <p className="text-xs text-gray-400">
            <a
              href="#"
              onClick={e => { e.preventDefault(); import('../firebase').then(({ auth, googleProvider }) => { import('firebase/auth').then(({ signInWithPopup }) => signInWithPopup(auth, googleProvider)) }) }}
              className="text-blue-500 hover:underline"
            >
              Sign in
            </a>
            {' '}to review this idea.
          </p>
        ) : checking ? (
          <p className="text-xs text-gray-400">Checking…</p>
        ) : submitted ? (
          <div className="space-y-1">
            <p className="text-xs text-green-600 font-medium">Review submitted.</p>
            {existing && (
              <div className="text-xs text-gray-500 space-y-0.5 mt-2">
                <p>Originality: {existing.originality}/5</p>
                <p>Feasibility: {existing.feasibility}/5</p>
                <p>Relevance / impact: {existing.impact}/5</p>
                {existing.comments && <p>Comments: {existing.comments}</p>}
              </div>
            )}
          </div>
        ) : showReview ? (
          <FeedbackForm idea={idea} user={user} onSubmit={() => setSubmitted(true)} />
        ) : (
          <button
            onClick={() => setShowReview(true)}
            className="w-full py-2 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 transition"
          >
            Review this idea…
          </button>
        )}
      </div>
    </div>
  )
}
