import { crumbsAtom } from "@/atoms/atom"
import ContentDashboard from "@/Components/ContentDashboard"
import Layout from "@/Components/Layout"
import { ProfileCard } from "@/Components/ProfileCard"
import { useAuthContext } from "@/context/AuthContext"
import { getAPIClient } from "@/services/axios"
import { useAtom } from "jotai"
import { GetServerSideProps } from "next"
import { parseCookies } from 'nookies'
import { useEffect, useState } from "react"

export default function Dashboard() {
    const { user: getUser } = useAuthContext()

    const [user, setUser] = useState(getUser)
    const [, setCrumbs] = useAtom(crumbsAtom)

    useEffect(() => {
        setUser(getUser)
    }, [getUser])

    useEffect(() => {
        setCrumbs([{ label: 'Início', link: '/dashboard' }])
    }, [setCrumbs])


    return (
        <Layout pageActive="dashboard">
            <ContentDashboard>
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