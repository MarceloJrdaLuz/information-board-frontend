import { AuthContext } from "@/context/AuthContext"
import { GetServerSideProps } from "next"
import { useContext, useEffect, useState } from "react"
import { parseCookies } from 'nookies'
import { getAPIClient } from "@/services/axios"
import Layout from "@/Components/Layout"
import ContentDashboard from "@/Components/ContentDashboard"
import { useAtom } from "jotai"
import { crumbsAtom } from "@/atoms/atom"

export default function Dashboard() {
    const { user: getUser } = useContext(AuthContext)

    const [user, setUser] = useState(getUser)
    const [, setCrumbs] = useAtom(crumbsAtom)

    const rolesName = user?.roles.map(role => role.name)

    function roleContains(role: string) {
        const contain = rolesName?.includes(role)
        return contain
    }


    useEffect(() => {
        setCrumbs([{ label: 'Início', link: '/dashboard' }])
    }, [setCrumbs])


    return (
        <Layout pageActive="dashboard">
            <ContentDashboard>
                <div className="h-96">Dashboard</div>
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