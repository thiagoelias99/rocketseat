import { handleLogout } from "@/actions"
import { auth } from "@/lib/auth"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function Dashboard() {
  const session = await auth()

  console.log("Session:", session)

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p>Email: {session?.user?.email || "Sem email"}</p>
      <Link href="/pagamentos" className="text-blue-500 underline">
        Criar Pagamentos
      </Link>
      <form action={handleLogout}>
        <button>Logout</button>
      </form>
    </div>
  )
}
