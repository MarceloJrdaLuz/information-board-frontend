import ContentDashboard from "@/Components/ContentDashboard"
import FileList from "@/Components/FileList"
import FormNotice from "@/Components/FormNotice"
import Layout from "@/Components/Layout"
import Upload from "@/Components/Upload"
import { CongregationContext } from "@/context/CongregationContext"
import { DocumentsContext } from "@/context/DocumentsContext"
import { Categories, ICategory } from "@/entities/types"
import { useFetch } from "@/hooks/useFetch"
import { getAPIClient } from "@/services/axios"
import { GetServerSideProps } from "next"
import { parseCookies } from "nookies"
import { useContext, useEffect, useState } from "react"

export default function Notices() {
    const { congregation } = useContext(CongregationContext)
    const congregationNumber = congregation?.number as string

    return (
        <Layout pageActive="anuncios">
            <ContentDashboard>
            <section className="flex justify-center">
                <FormNotice congregationNumber={congregationNumber}/>
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

    return {
        props: {}
    }
}