import { AuthContext } from "@/context/AuthContext"
import { GetServerSideProps } from "next"
import { useContext, useState } from "react"
import { parseCookies } from 'nookies'
import { getAPIClient } from "@/services/axios"
import Layout from "@/Components/Layout"
import ContentDashboard from "@/Components/ContentDashboard"

export default function Dashboard() {
    const { user: getUser } = useContext(AuthContext)
    
    const [user, setUser] = useState(getUser)

    const rolesName = user?.roles.map(role => role.name)

    function roleContains(role: string) {
        const contain = rolesName?.includes(role)
        return contain
    }


    return (
        <Layout pageActive="dashboard">
            <ContentDashboard>
                <div className="h-96">Dashboard</div>
                <div className="h-96">Dashboard</div>
                <div className="h-96">Dashboard</div>
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