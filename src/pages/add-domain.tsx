import { AuthContext } from "@/context/AuthContext"
import { GetServerSideProps } from "next"
import { useContext, useEffect, useState } from "react"
import { parseCookies } from 'nookies'
import { getAPIClient } from "@/services/axios"
import Layout from "@/Components/Layout"
import ContentDashboard from "@/Components/ContentDashboard"
import FormAddDomain from "@/Components/FormAddDomain"
import { useAtom } from "jotai"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import BreadCrumbs from "@/Components/BreadCrumbs"

export default function AddDomain() {
    const { user: getUser, roleContains } = useContext(AuthContext)

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
                <FormAddDomain congregationNumber={isAdminCongregation ? congregationNumber : undefined} />
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