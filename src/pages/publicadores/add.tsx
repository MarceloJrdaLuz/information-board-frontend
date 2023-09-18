import BreadCrumbs from "@/Components/BreadCrumbs"
import { IBreadCrumbs } from "@/Components/BreadCrumbs/types"
import ContentDashboard from "@/Components/ContentDashboard"
import FormAddPublisher from "@/Components/FormAddPublisher"
import Layout from "@/Components/Layout"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { getAPIClient } from "@/services/axios"
import { useAtom } from "jotai"
import { GetServerSideProps } from "next"
import { parseCookies } from "nookies"
import { useEffect } from "react"

export default function AddPublicadores() {
    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)

    useEffect(() => {
        setCrumbs((prevCrumbs) => {
            const updatedCrumbs = [...prevCrumbs, { label: 'Publicadores', link: '/publicadores' }];
            return updatedCrumbs;
        })

        const removeCrumb = () => {
            setCrumbs((prevCrumbs) => prevCrumbs.slice(0, -1));
        };

        return () => {
            removeCrumb()
        }
    }, [setCrumbs])

    useEffect(() => {
        setPageActive('Adicionar pessoa')
    }, [setPageActive])

    return (
        <Layout pageActive="publicadores">
            <ContentDashboard>
                <BreadCrumbs crumbs={crumbs} pageActive={pageActive} />
                <section className="flex justify-center">
                    <FormAddPublisher />
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

    if (!userRolesParse.includes('ADMIN_CONGREGATION')) {
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