import ContentDashboard from "@/Components/ContentDashboard";
import FormAddPermission from "@/Components/FormAddPermission";
import FormAddRole from "@/Components/FormAddRole";
import FormUserRoles from "@/Components/FormUserRoles";
import Layout from "@/Components/Layout";
import { getAPIClient } from "@/services/axios";
import { GetServerSideProps } from "next";
import { parseCookies } from "nookies";

export default function Permissoes(){
    return (
        <Layout pageActive="permissoes">
            <ContentDashboard>
               <div className="p-5">
                   <FormAddPermission/>
                   <FormAddRole/>
                   <FormUserRoles/>
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

    return {
        props: {}
    }
}