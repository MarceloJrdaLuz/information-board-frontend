import { useAuthContext } from "@/context/AuthContext"
import { GetServerSideProps } from "next"
import { useEffect, useState } from "react"
import { parseCookies } from 'nookies'
import { getAPIClient } from "@/services/axios"
import Layout from "@/Components/Layout"
import ContentDashboard from "@/Components/ContentDashboard"
import { useAtom } from "jotai"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import BreadCrumbs from "@/Components/BreadCrumbs"
import FormAddDomain from "@/Components/Forms/FormAddDomain"

export default function AddDomain() {
    const { user: getUser, roleContains } = useAuthContext()

    const [user, setUser] = useState(getUser)
    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)


    useEffect(() => {
        setPageActive('Adicionar ao domínio')
    }, [setPageActive])

    useEffect(() => {
        setUser(getUser)
    }, [getUser])

    const congregationNumber = user?.congregation?.number

    const rolesName = user?.roles.map(role => role.name)

    const isAdminCongregation = roleContains('ADMIN_CONGREGATION')

    return (
        <Layout pageActive="add-domain">
            <ContentDashboard>
                <BreadCrumbs crumbs={crumbs} pageActive={pageActive} />
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