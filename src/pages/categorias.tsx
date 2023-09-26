import BreadCrumbs from "@/Components/BreadCrumbs"
import ContentDashboard from "@/Components/ContentDashboard"
import FormAddCategory from "@/Components/Forms/FormAddCategory"
import Layout from "@/Components/Layout"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { getAPIClient } from "@/services/axios"
import { useAtom } from "jotai"
import { GetServerSideProps } from "next"
import { parseCookies } from "nookies"
import { useEffect } from "react"

export default function Categorias() {
    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)

    useEffect(() => {
        setPageActive('Criar categoria')
    }, [setPageActive])

    return (
        <Layout pageActive="categorias">
            <ContentDashboard>
                <BreadCrumbs crumbs={crumbs} pageActive={pageActive} />
                <section className="flex justify-center">
                    <FormAddCategory />
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