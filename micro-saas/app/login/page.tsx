import { handleGoogleAuth } from "@/actions"
import React from 'react'

export default function LoginPage() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-bold">Login</h1>

      <form
        action={handleGoogleAuth}
      >
        <button type="submit">Signin with Google</button>
      </form>
    </div>
  )
}
