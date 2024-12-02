import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabaseClient'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        router.push('/') // or wherever you want to redirect after login
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [router])

  return <div>Loading...</div>
} 