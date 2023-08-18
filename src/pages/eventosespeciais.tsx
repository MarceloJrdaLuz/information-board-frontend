import ContentDashboard from "@/Components/ContentDashboard";
import FileList from "@/Components/FileList";
import FormAddPublisher from "@/Components/FormAddPublisher";
import Layout from "@/Components/Layout";
import PublisherList from "@/Components/PublishersList";
import Upload from "@/Components/Upload";
import { iconeAddPessoa } from "@/assets/icons";
import { DocumentsContext } from "@/context/DocumentsContext";
import { Categories, ICategory } from "@/entities/types";
import { useFetch } from "@/hooks/useFetch";
import { getAPIClient } from "@/services/axios";
import { GetServerSideProps } from "next";
import Router from "next/router";
import { parseCookies } from "nookies";
import { useContext, useEffect, useState } from "react";

export default function EventosEspeciais() {

    const [category, setCategory] = useState<ICategory>()
    const { uploadedFiles, setDocumentCategoryId } = useContext(DocumentsContext)
    const { data: categories } = useFetch<ICategory[]>('/category')

    useEffect(() => {
        const categoryFilter = categories?.filter(category => category.name === Categories.eventos)
        if (categoryFilter) {
            setCategory(categoryFilter[0])
        }
        const categoryId = category?.id as string
        setDocumentCategoryId(categoryId)
    }, [categories, setDocumentCategoryId, category])

    return (
        <Layout pageActive="eventosespeciais">
            <ContentDashboard>
                <section className="flex flex-wrap w-full h-full p-5">
                    <div className="w-full h-full">
                        <div className="flex flex-col w-11/12 md:w-9/12 h-24 m-auto  justify-between items-center  cursor-pointer mb-3">
                            <Upload acceptFiles={{
                                'application/pdf': []
                            }} />
                        </div>
                        <FileList files={uploadedFiles} />
                    </div>
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