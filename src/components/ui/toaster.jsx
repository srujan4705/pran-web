import React from "react"
import { Toaster as HotToaster } from "react-hot-toast"

export function Toaster() {
  return (
    <HotToaster
      position="bottom-left"
      toastOptions={{
        className: "bg-white text-slate-900 border border-slate-200 shadow-xl rounded-2xl px-4 py-3 text-sm font-semibold",
        duration: 4000,
        success: {
          iconTheme: {
            primary: '#10b981',
            secondary: '#fff',
          },
          className: "bg-emerald-50 text-emerald-900 border-emerald-200",
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fff',
          },
          className: "bg-red-50 text-red-900 border-red-200",
        },
      }}
    />
  )
}
