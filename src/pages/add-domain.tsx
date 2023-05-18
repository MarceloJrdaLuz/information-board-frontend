import { AuthContext } from "@/context/AuthContext";
import { GetServerSideProps } from "next";
import { useContext, useEffect, useState } from "react";
import { parseCookies } from 'nookies'
import { getAPIClient } from "@/services/axios";
import Layout from "@/Components/Layout";
import ContentDashboard from "@/Components/ContentDashboard";
import { api } from "@/services/api";
import FormAddDomain from "@/Components/FormAddDomain";

export default function AddDomain() {
    const { user: getUser } = useContext(AuthContext)

    const [user, setUser] = useState(getUser)

    const rolesName = user?.roles.map(role => role.name)

    function roleContains(role: string) {
        const contain = rolesName?.includes(role)
        return contain
    }


    return (
        <Layout pageActive="add-domain">
            <ContentDashboard>
                <FormAddDomain />
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