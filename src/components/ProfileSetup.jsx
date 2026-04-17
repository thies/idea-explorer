import { useState } from 'react'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

const ROLES = [
  { value: 'phd',      label: 'PhD student' },
  { value: 'postdoc',  label: 'Postdoc / research fellow' },
  { value: 'faculty',  label: 'Faculty / professor' },
  { value: 'industry', label: 'Industry / practice' },
  { value: 'other',    label: 'Other' },
]

export default function ProfileSetup({ user, onDone }) {
  const [role, setRole]           = useState('')
  const [hasReviewed, setHasReviewed] = useState('')
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState('')

  const submit = async (e) => {
    e.preventDefault()
    if (!role || hasReviewed === '') return
    setSaving(true)
    try {
      const profile = {
        email: user.email,
        displayName: user.displayName || '',
        role,
        hasReviewed: hasReviewed === 'yes',
        createdAt: serverTimestamp(),
      }
      await setDoc(doc(db, 'users', user.uid), profile)
      onDone(profile)
    } catch (e) {
      setError(e.message)
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-md p-10 max-w-sm w-full">
        <h2 className="text-xl font-semibold text-gray-800 mb-1">Tell us about yourself</h2>
        <p className="text-sm text-gray-500 mb-6">This helps contextualise the ratings.</p>

        <form onSubmit={submit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Academic role</label>
            <div className="space-y-2">
              {ROLES.map(r => (
                <label key={r.value} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value={r.value}
                    checked={role === r.value}
                    onChange={() => setRole(r.value)}
                    className="accent-blue-600"
                  />
                  {r.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Have you reviewed real estate papers or research proposals for academic journals before?
            </label>
            <div className="flex gap-4">
              {['yes', 'no'].map(v => (
                <label key={v} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="radio"
                    name="reviewed"
                    value={v}
                    checked={hasReviewed === v}
                    onChange={() => setHasReviewed(v)}
                    className="accent-blue-600"
                  />
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </label>
              ))}
            </div>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={!role || hasReviewed === '' || saving}
            className="w-full py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-40 transition"
          >
            {saving ? 'Saving…' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  )
}
