import ContentDashboard from "@/Components/ContentDashboard";
import FormAddCongregation from "@/Components/FormAddCongregation";
import FormUpdateCongregation from "@/Components/FormUpdateCongregation";
import Layout from "@/Components/Layout";
import ListCongregations from "@/Components/ListCongregations";
import { AuthContext } from "@/context/AuthContext";
import { ICongregation } from "@/entities/types";
import { api } from "@/services/api";
import { getAPIClient } from "@/services/axios";
import { GetServerSideProps } from "next";
import { parseCookies } from "nookies";
import { useContext, useEffect, useState } from "react";

export default function InformacoesCongregacoes() {
    const { user: getUser, roleContains } = useContext(AuthContext)

    const isAdmincongregation = roleContains('ADMIN_CONGREGATION')

    // const [congregations, setCongregations] = useState<ICongregation[]>()
    // const [loading, setLoading] = useState(true)

    // const getCongregations = async () => {
    //     await api.get('/congregations').then(res => {
    //         const { data } = res
    //         setCongregations([...data])
    //         setLoading(false)
    //     }).catch(err => console.log(err))
    // }

    // useEffect(() => {
    //     getCongregations()
    // }, [])

    return (
        <Layout pageActive="informacoes-congregacoes">
            <ContentDashboard>
                <div className="flex justify-center items-center py-5">
                    {isAdmincongregation && <FormUpdateCongregation/>}
                </div>
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