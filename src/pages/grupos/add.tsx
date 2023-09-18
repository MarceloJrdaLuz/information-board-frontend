import BreadCrumbs from "@/Components/BreadCrumbs"
import ContentDashboard from "@/Components/ContentDashboard"
import FormAddCongregation from "@/Components/FormAddCongregation"
import FormAddGroup from "@/Components/FormAddGroup"
import FormAddRole from "@/Components/FormAddRole"
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

export default function AddGrupo() {
    const { user: getUser, roleContains } = useContext(AuthContext)

    const [congregations, setCongregations] = useState<ICongregation[]>()
    const [loading, setLoading] = useState(true)
    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)

    useEffect(() => {
        setCrumbs((prevCrumbs) => {
            const updatedCrumbs = [...prevCrumbs, { label: 'Grupos', link: '/grupos' }];
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
        setPageActive('Criar grupo')
    }, [setPageActive])

    return (
        <Layout pageActive="grupos">
            <ContentDashboard>
                <BreadCrumbs crumbs={crumbs} pageActive={pageActive} />
                <section className="flex m-10 justify-center items-center">
                    <FormAddGroup/>
                </section>
            </ContentDashboard>
        </Layout>
    )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {

    const apiClient = getAPIClient(ctx)
    const { ['quadro-token']: token } = parseCookies(ctx)
    const { ['user-roles']: userRoles } = parseCookies(ctx)

    if (!token) {
        return {
            redirect: {
                destination: '/login',
                permanent: false
            }
        }
    }

    const userRolesParse: string[] = JSON.parse(userRoles)

    if(!userRolesParse.includes('ADMIN_CONGREGATION')){
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