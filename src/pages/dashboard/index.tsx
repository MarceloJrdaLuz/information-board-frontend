import { useAuthContext } from "@/context/AuthContext"
import { GetServerSideProps } from "next"
import { useEffect, useState } from "react"
import { parseCookies } from 'nookies'
import { getAPIClient } from "@/services/axios"
import Layout from "@/Components/Layout"
import ContentDashboard from "@/Components/ContentDashboard"
import { useAtom } from "jotai"
import { crumbsAtom } from "@/atoms/atom"
import { ProfileCard } from "@/Components/ProfileCard"

export default function Dashboard() {
    const { user: getUser } = useAuthContext()

    const [user, setUser] = useState(getUser)
    const [, setCrumbs] = useAtom(crumbsAtom)

    const rolesName = user?.roles.map(role => role.name)

    function roleContains(role: string) {
        const contain = rolesName?.includes(role)
        return contain
    }

    useEffect(() => {
        setUser(getUser)
    }, [getUser])

    useEffect(() => {
        setCrumbs([{ label: 'Início', link: '/dashboard' }])
    }, [setCrumbs])


    return (
        <Layout pageActive="dashboard">
            <ContentDashboard>
                {/* <div className="h-96">Dashboard</div> */}
                <section className="flex w-full h-full justify-center items-center">
                    {user && <ProfileCard user={user} fullName={user.fullName} email={user.email} avatar_url={user.profile?.avatar_url} />}
                </section>
            </ContentDashboard>
        </Layout>
    )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {

    const apiClient = getAPIClient(ctx)
    const { ['quadro-token']: token } = parseCookies(ctx)

    if (!token) {
        return {
            redirect: {
                destination: '/login',
                permanent: false
            }
        }
    }

    return {
        props: {}
    }
}