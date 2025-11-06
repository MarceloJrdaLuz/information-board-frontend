import { useRouter } from 'next/router'
import { useEffect } from 'react'

// const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    console.log(process.env.NEXT_PUBLIC_API_BASE)
    router.push('/login')
  }, [router])

  return null
}
