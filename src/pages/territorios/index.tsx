import BreadCrumbs from "@/Components/BreadCrumbs"
import Button from "@/Components/Button"
import ContentDashboard from "@/Components/ContentDashboard"
import Layout from "@/Components/Layout"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { getAPIClient } from "@/services/axios"
import { useAtom } from "jotai"
import { GetServerSideProps } from "next"
import Router, { useRouter } from "next/router"
import { parseCookies } from "nookies"
import { useEffect, useState } from "react"
import 'moment/locale/pt-br'
import { getYearService } from "@/functions/meses"
import TerritoriesList from "@/Components/TerritoriesList"
import TerritoryIcon from "@/Components/Icons/TerritoryIcon"

export default function Territory() {
    const router = useRouter()
    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)
    const [pdfGenerating, setPdfGenerating] = useState(false)
    const [yearService, setYearService] = useState(getYearService().toString())
    const [yearServiceSelected, setYearServiceSelected] = useState(getYearService().toString())

    useEffect(() => {
        setPdfGenerating(true)
    }, [])


    useEffect(() => {
        setPageActive('Territórios')
    }, [setPageActive])


    // const PdfLinkComponent = () => (
    //     <PDFDownloadLink
    //         document={
    //             <Document>
    //                 <S88
    //                     meetingAssistance={data}
    //                     yearsServices={[yearServiceSelected, (Number(yearServiceSelected) - 1).toString()]}
    //                 />
    //             </Document>
    //         }
    //         fileName={"Assistência às reuniões.pdf"}
    //     >
    //         {({ blob, url, loading, error }) =>
    //             loading ? "" :
    //                 <Button className="bg-white text-primary-200 p-1 md:p-3 border-gray-300 rounded-none hover:opacity-80">
    //                     <PdfIcon />
    //                     <span className="text-primary-200 font-semibold">
    //                         Salvar S-88
    //                     </span>
    //                 </Button>
    //         }
    //     </PDFDownloadLink>
    // )
    return (
        <Layout pageActive="territorios">
            <ContentDashboard>
                <BreadCrumbs crumbs={crumbs} pageActive={pageActive} />
                <section className="flex flex-wrap w-full h-full p-5 ">
                    <h1 className="flex w-full h-10 text-lg sm:text-xl md:text-2xl text-primary-200 font-semibold">Registros de territórios</h1>
                    <Button
                        onClick={() => {
                            Router.push('/territorios/add')
                        }}
                        className="bg-white text-primary-200 p-3 border-gray-300 rounded-none hover:opacity-80">
                        <TerritoryIcon />
                        <span className="text-primary-200 font-semibold">Adicionar território</span>
                    </Button>
                    <div className="w-full h-full my-5">
                        <TerritoriesList />
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

    const { ['user-roles']: userRoles } = parseCookies(ctx)
    const userRolesParse: string[] = JSON.parse(userRoles)

    if (!userRolesParse.includes('ADMIN_CONGREGATION') && !userRolesParse.includes('TERRITORIES_MANAGER') && !userRolesParse.includes('TERRITORIES_VIEWER')) {
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