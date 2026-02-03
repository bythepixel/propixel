import Head from 'next/head'
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect } from 'react'
import Header from '../components/Header'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
    if (status === "authenticated") {
      router.push("/admin/users")
    }
  }, [status, router])

  if (status === "loading") {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center">Loading...</div>
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-900 font-sans">
      <Head>
        <title>ProPixel Admin</title>
      </Head>
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 text-center">
          <h2 className="text-2xl font-bold text-slate-100">Redirecting...</h2>
          <p className="text-slate-500 mt-2">Opening user management.</p>
        </div>
      </div>
    </div>
  )
}
