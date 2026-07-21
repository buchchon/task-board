import { ref } from 'vue'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

// Module-level (not per-component) state: every component that calls useAuth()
// shares the same guest session, so there's one source of truth for "who am I."
const user = ref<User | null>(null)
const isReady = ref(false)

async function bootstrapGuestSession() {
  // supabase-js persists the session in localStorage by default, so a returning
  // guest gets their existing session back instead of a brand-new identity.
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    user.value = session.user
  } else {
    const { data, error } = await supabase.auth.signInAnonymously()
    if (error) throw error
    user.value = data.user
  }

  isReady.value = true
}

export function useAuth() {
  return { user, isReady, bootstrapGuestSession }
}
