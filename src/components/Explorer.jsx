import { useEffect, useState } from 'react'
import { signOut, signInWithPopup } from 'firebase/auth'
import { auth, googleProvider, githubProvider } from '../firebase'
import ScatterPlot from './ScatterPlot'
import FilterPanel from './FilterPanel'
import IdeaPanel from './IdeaPanel'

export const CONDITIONS = {
  A:       { label: 'Naive',                      color: '#4e79a7' },
  B:       { label: 'Full REE context',            color: '#f28e2b' },
  C:       { label: 'Cluster-seeded',              color: '#59a14f' },
  D_econ:  { label: 'Econ method transfer',        color: '#76b7b2' },
  D_psych: { label: 'Psych method transfer',       color: '#edc948' },
  E_econ:  { label: 'Econ paradigm transplant',    color: '#b07aa1' },
  E_psych: { label: 'Psych paradigm transplant',   color: '#ff9da7' },
  F:       { label: 'Citation-guided',             color: '#9c755f' },
}

export default function Explorer({ user, profile }) {
  const [corpus, setCorpus]             = useState([])
  const [ideas, setIdeas]               = useState([])
  const [loading, setLoading]           = useState(true)
  const [activeConditions, setActive]   = useState(new Set(Object.keys(CONDITIONS)))
  const [selectedIdea, setSelectedIdea] = useState(null)

  useEffect(() => {
    const base = import.meta.env.BASE_URL
    Promise.all([
      fetch(`${base}data/corpus.json`).then(r => r.json()),
      fetch(`${base}data/ideas.json`).then(r => r.json()),
    ]).then(([c, i]) => {
      setCorpus(c)
      setIdeas(i)
      setLoading(false)
    })
  }, [])

  const visibleIdeas = ideas.filter(idea => activeConditions.has(idea.condition))

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-400 text-sm">
        Loading data…
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-2.5 border-b border-gray-100 bg-white z-10">
        <div>
          <span className="font-semibold text-gray-800 text-sm">Research Idea Explorer</span>
          <span className="ml-3 text-xs text-gray-400">
            {ideas.length.toLocaleString()} ideas · {corpus.length.toLocaleString()} corpus papers
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          {user ? (
            <>
              <span>{user.email}</span>
              <button
                onClick={() => signOut(auth)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                Sign out
              </button>
            </>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => signInWithPopup(auth, googleProvider)}
                className="px-3 py-1 border border-gray-200 rounded text-gray-600 hover:bg-gray-50 transition"
              >
                Sign in to rate
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 min-h-0">
        {/* Left: filter panel */}
        <aside className="w-60 flex-none border-r border-gray-100 overflow-y-auto">
          <FilterPanel
            activeConditions={activeConditions}
            setActive={setActive}
            ideas={ideas}
          />
        </aside>

        {/* Centre: scatter */}
        <main className="flex-1 min-w-0 relative">
          <ScatterPlot
            corpus={corpus}
            ideas={visibleIdeas}
            selectedIdea={selectedIdea}
            onSelect={id => setSelectedIdea(ideas.find(i => i.id === id) || null)}
          />
        </main>

        {/* Right: idea detail panel */}
        {selectedIdea && (
          <aside className="w-96 flex-none border-l border-gray-100 overflow-y-auto">
            <IdeaPanel
              idea={selectedIdea}
              user={user}
              onClose={() => setSelectedIdea(null)}
            />
          </aside>
        )}
      </div>
    </div>
  )
}
