"use client"

import { Provider } from "react-redux"
import { store } from "./store"
import { useEffect } from "react"
import { getCurrentUser } from "./slices/authSlice"
import { fetchNotifications } from "./slices/notificationSlice"

export function ReduxProvider({ children }: { children: React.ReactNode }) {  // Get current user on app load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Get current user and then fetch notifications
      store.dispatch(getCurrentUser())
        .then((result) => {
          if (getCurrentUser.fulfilled.match(result)) {
            store.dispatch(fetchNotifications());
          }
        });
    }
  }, [])
  
  return <Provider store={store}>{children}</Provider>
}
