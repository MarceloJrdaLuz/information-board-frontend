import { crumbsAtom } from "@/atoms/atom"
import ContentDashboard from "@/Components/ContentDashboard"
import Layout from "@/Components/Layout"
import { ProfileCard } from "@/Components/ProfileCard"
import { ProtectedRoute } from "@/Components/ProtectedRoute"
import { useAuthContext } from "@/context/AuthContext"
import { useAtom } from "jotai"
import { useEffect } from "react"

export default function Dashboard() {
    const { user } = useAuthContext()
    const [, setCrumbs] = useAtom(crumbsAtom)

    useEffect(() => {
        setCrumbs([{ label: 'Início', link: '/dashboard' }])
    }, [setCrumbs])

    return (
        <ProtectedRoute>
                <ContentDashboard>
                    <section className="flex w-full h-full justify-center items-center">
                        {user && <ProfileCard user={user} fullName={user.fullName} email={user.email} avatar_url={user.profile?.avatar_url} />}
                    </section>
                </ContentDashboard>
        </ProtectedRoute>
    )
}