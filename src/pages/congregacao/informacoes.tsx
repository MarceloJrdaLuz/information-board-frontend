import BreadCrumbs from "@/Components/BreadCrumbs"
import ContentDashboard from "@/Components/ContentDashboard"
import FormUpdateCongregation from "@/Components/Forms/FormUpdateCongregation"
import Layout from "@/Components/Layout"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { AuthContext } from "@/context/AuthContext"
import { getAPIClient } from "@/services/axios"
import { useAtom } from "jotai"
import { GetServerSideProps } from "next"
import { parseCookies } from "nookies"
import { useContext, useEffect } from "react"

export default function InformacoesCongregacoes() {
    const { user: getUser, roleContains } = useContext(AuthContext)

    const isAdmincongregation = roleContains('ADMIN_CONGREGATION')

    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)

    useEffect(() => {
        setPageActive('Informações da congregação')
    }, [setPageActive])

    return (
        <Layout pageActive="informacoes-congregacoes">
            <ContentDashboard>
                <BreadCrumbs crumbs={crumbs} pageActive={pageActive} />
                <div className="flex justify-center items-center py-5">
                    {isAdmincongregation && <FormUpdateCongregation />}
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

    const { ['user-roles']: userRoles } = parseCookies(ctx)
    const userRolesParse: string[] = JSON.parse(userRoles)

    if (!userRolesParse.includes('ADMIN_CONGREGATION') && !userRolesParse.includes('ADMIN')) {
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