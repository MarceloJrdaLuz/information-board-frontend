import Head from 'next/head'
import { Inter } from '@next/font/google'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    router.push('/login')
  }, [router])

  return null
}
