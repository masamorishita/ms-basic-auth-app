import { useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

const LoginWithMicrosoft = () => {
  useEffect(() => {
    // Listen for authentication state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        console.log('Signed in:', session)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleMicrosoftLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'microsoft',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (error) throw error
    } catch (error) {
      console.error('Error logging in:', error)
    }
  }

  return (
    <button 
      onClick={handleMicrosoftLogin}
      className="login-button"
    >
      <img 
        src="https://www.microsoft.com/favicon.ico" 
        alt="Microsoft logo" 
      />
      Login with Microsoft
    </button>
  )
}

export default LoginWithMicrosoft 