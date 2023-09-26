import BreadCrumbs from "@/Components/BreadCrumbs"
import ContentDashboard from "@/Components/ContentDashboard"
import FormNotice from "@/Components/Forms/FormNotice"
import Layout from "@/Components/Layout"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { CongregationContext } from "@/context/CongregationContext"
import { getAPIClient } from "@/services/axios"
import { useAtom } from "jotai"
import { GetServerSideProps } from "next"
import { parseCookies } from "nookies"
import { useContext, useEffect, useState } from "react"

export default function Notices() {
    const { congregation } = useContext(CongregationContext)
    const congregationNumber = congregation?.number as string

    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)

    useEffect(() => {
        setPageActive('Anúncios')
    }, [setPageActive])


    return (
        <Layout pageActive="anuncios">
            <ContentDashboard>
                <BreadCrumbs crumbs={crumbs} pageActive={pageActive} />
                <section className="flex justify-center">
                    <FormNotice congregationNumber={congregationNumber} />
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