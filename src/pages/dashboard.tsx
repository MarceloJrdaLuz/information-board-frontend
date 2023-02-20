import { AuthContext } from "@/context/AuthContext";
import { GetServerSideProps } from "next";
import Image from "next/image";
import { useContext, useEffect } from "react";
import { parseCookies } from 'nookies'
import { getAPIClient } from "@/services/axios";
import NavBar from "@/Components/NavBar";
import Layout from "@/Components/Layout";

export default function Dashboard() {

    const { user } = useContext(AuthContext)
    const rolesName = user?.roles.map(role => role.name)

    function roleContains(role: string) {
        const contain = rolesName?.includes(role)
        return contain
    }


    return (
        <Layout pageActive="dashboard">
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