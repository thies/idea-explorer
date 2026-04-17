import { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from './firebase'
import LoginPage from './components/LoginPage'
import ProfileSetup from './components/ProfileSetup'
import Explorer from './components/Explorer'

export default function App() {
  const [user, setUser]       = useState(undefined) // undefined = loading
  const [profile, setProfile] = useState(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (u) {
        const snap = await getDoc(doc(db, 'users', u.uid))
        setProfile(snap.exists() ? snap.data() : null)
      } else {
        setProfile(null)
      }
      setChecking(false)
    })
    return unsub
  }, [])

  if (checking) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-400 text-sm">
        Loading…
      </div>
    )
  }

  if (!user) return <LoginPage />
  if (!profile) return <ProfileSetup user={user} onDone={setProfile} />
  return <Explorer user={user} profile={profile} />
}
