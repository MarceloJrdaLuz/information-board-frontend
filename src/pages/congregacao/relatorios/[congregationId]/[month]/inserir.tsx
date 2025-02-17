import BreadCrumbs from "@/Components/BreadCrumbs"
import { IBreadCrumbs } from "@/Components/BreadCrumbs/types"
import Button from "@/Components/Button"
import ContentDashboard from "@/Components/ContentDashboard"
import AddPersonIcon from "@/Components/Icons/AddPersonIcon"
import Layout from "@/Components/Layout"
import PublisherList from "@/Components/PublishersList"
import PublisherListReports from "@/Components/PublishersListReports"
import { iconeAddPessoa } from "@/assets/icons"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { getAPIClient } from "@/services/axios"
import { useAtom, useAtomValue } from "jotai"
import { GetServerSideProps } from "next"
import Link from "next/link"
import Router, { useRouter } from "next/router"
import { parseCookies } from "nookies"
import { useEffect } from "react"

export default function Inserir() {

    const router = useRouter()
    const { month, congregationId } = router.query

    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)

    useEffect(() => {
        setPageActive('Relatórios')
    }, [setPageActive])

    useEffect(() => {
        setCrumbs((prevCrumbs) => {
            const updatedCrumbs = [...prevCrumbs, { label: `${month}`, link: `/congregacao/relatorios/${congregationId}/${month}` }]
            return updatedCrumbs
        })

        const removeCrumb = () => {
            setCrumbs((prevCrumbs) => prevCrumbs.slice(0, -1))
        }

        return () => {
            removeCrumb()
        }
    }, [setCrumbs, setPageActive, congregationId, month])

    return (
        <Layout pageActive="relatorios">
            <ContentDashboard>
                <BreadCrumbs crumbs={crumbs} pageActive={pageActive} />
                <PublisherListReports />
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

    if (!userRolesParse.includes('ADMIN_CONGREGATION') && !userRolesParse.includes('REPORTS_MANAGER')) {
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