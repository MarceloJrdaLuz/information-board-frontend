import BreadCrumbs from "@/Components/BreadCrumbs"
import ContentDashboard from "@/Components/ContentDashboard"
import FormAddEmergencyContact from "@/Components/Forms/FormAddEmergencyContact"
import FormAddGroup from "@/Components/Forms/FormAddGroup"
import Layout from "@/Components/Layout"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { useCongregationContext } from "@/context/CongregationContext"
import { getAPIClient } from "@/services/axios"
import { useAtom } from "jotai"
import { GetServerSideProps } from "next"
import { parseCookies } from "nookies"
import { useEffect } from "react"

export default function AddEmergencyContact() {
     const { congregation } = useCongregationContext()
    const congregation_id = congregation?.id
    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)

    useEffect(() => {
        setCrumbs((prevCrumbs) => {
            const updatedCrumbs = [...prevCrumbs, { label: 'Contatos', link: '/congregacao/contatos-emergencia' }]
            return updatedCrumbs
        })

        const removeCrumb = () => {
            setCrumbs((prevCrumbs) => prevCrumbs.slice(0, -1))
        }

        return () => {
            removeCrumb()
        }
    }, [setCrumbs])

    useEffect(() => {
        setPageActive('Criar Contato de emergência')
    }, [setPageActive])

    return (
        <Layout pageActive="contatos-emergencia">
            <ContentDashboard>
                <BreadCrumbs crumbs={crumbs} pageActive={pageActive} />
                <section className="flex m-10 justify-center items-center">
                    <FormAddEmergencyContact congregation_id={congregation_id ?? ""} />
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

    if (!userRolesParse.includes('ADMIN_CONGREGATION') && !userRolesParse.includes('GROUPS_MANAGER')) {
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