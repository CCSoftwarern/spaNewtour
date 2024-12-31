
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import Cards from './Cards';

const supabase = createClient('https://fbnksoaqkdblysrswdrr.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZibmtzb2Fxa2RibHlzcnN3ZHJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU1NzA3MzIsImV4cCI6MjA1MTE0NjczMn0.l1fT3s5gaOlqJ2r_Hza6KHPYyq0WZPKeX2Ly6xbqWug')

export default function App() {
  const [session, setSession] = useState(null)



    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    useEffect(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session)
      })

    return () => subscription.unsubscribe()
  }, [])

  if (!session) {
    return (<div class="container mt-4" style={{ width: '25rem' }}>
        <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} />  
    </div>)
  }
  else {
    return (<div><Cards /></div>)
  }
}