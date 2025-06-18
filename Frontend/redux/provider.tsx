"use client"

import { Provider } from "react-redux"
import { store } from "./store"
import { useEffect } from "react"
import { getCurrentUser } from "./slices/authSlice"

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  // Get current user on app load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      store.dispatch(getCurrentUser())
    }
  }, [])
  
  return <Provider store={store}>{children}</Provider>
}
