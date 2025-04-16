import Link from "next/link"

export default function Home() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-bold">Landing Page</h1>

      <Link href="/login">Login</Link>
      <Link href="/dashboard">Dashboard</Link>
    </div>
  )
}