import BreadCrumbs from "@/Components/BreadCrumbs"
import ContentDashboard from "@/Components/ContentDashboard"
import Layout from "@/Components/Layout"
import ListCongregations from "@/Components/ListCongregations"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { AuthContext } from "@/context/AuthContext"
import { ICongregation } from "@/entities/types"
import { api } from "@/services/api"
import { getAPIClient } from "@/services/axios"
import { useAtom } from "jotai"
import { GetServerSideProps } from "next"
import { parseCookies } from "nookies"
import { useContext, useEffect, useState } from "react"

export default function Congregacoes() {
    const { user: getUser, roleContains } = useContext(AuthContext)

    const isAdmin = roleContains('ADMIN')

    const [congregations, setCongregations] = useState<ICongregation[]>()
    const [loading, setLoading] = useState(true)
    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)


    useEffect(() => {
        setPageActive('Congregações')
    }, [setPageActive])


    const getCongregations = async () => {
        await api.get('/congregations').then(res => {
            const { data } = res
            setCongregations([...data])
            setLoading(false)
        }).catch(err => console.log(err))
    }

    useEffect(() => {
        getCongregations()
    }, [])

    return (
        <Layout pageActive="congregacoes">
            <ContentDashboard>
                <BreadCrumbs crumbs={crumbs} pageActive={pageActive} />
                {isAdmin && <ListCongregations />}
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

    const { ['user-roles']: userRoles } = parseCookies(ctx)
    const userRolesParse: string[] = JSON.parse(userRoles)

    if (!userRolesParse.includes('ADMIN')) {
        return {
            redirect: {
                destination: '/dashboard',
                permanent: false
            }
        }
    }

    return {
        props: {}
    }
}