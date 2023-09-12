import ButtonHome from "@/Components/ButtonHome"
import HeadComponent from "@/Components/HeadComponent"
import LayoutPrincipal from "@/Components/LayoutPrincipal"
import PdfViewer from "@/Components/PdfViewer"
import { PublicDocumentsContext } from "@/context/PublicDocumentsContext"
import { Categories, CongregationTypes, ICongregation, IDocument } from "@/entities/types"
import { removeMimeType } from "@/functions/removeMimeType"
import { useFetch } from "@/hooks/useFetch"
import { api } from "@/services/api"
import { GetServerSideProps } from "next"
import { useRouter } from "next/router"
import { useContext, useEffect, useState } from "react"

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { number } = context.query

    const getCongregation = await api.get(`/congregation/${number}`)

    const { data: congregationData } = getCongregation

    return {
        // Passed to the page component as props
        props: { ...congregationData },
    }
}

export default function PoliticaPrivacidade({circuit: congregationCircuit, name: congregationName, number: congregationNumber}: CongregationTypes) {
    const router = useRouter()
    const { number } = router.query

    return (
        <>
            <HeadComponent title="Política de Privacidade" urlMiniatura="https://luisgomes.netlify.app/images/limpeza.jpg" />
            <LayoutPrincipal congregationName={congregationName} circuit={congregationCircuit} heightConteudo={'1/2'} header className="bg-gray-900 bg-left-bottom bg-cover lg:bg-right" textoHeader="Política de Privacidade" >
                <h1 className="mb-5 font-bold text-gray-900 text-2xl">Política sobre coleta e armazenamento de dados</h1>
                <span className="h-full hide-scrollbar overflow-auto text-gray-900 w-4/6 md:w-3/6 m-auto">
                    Ao utilizar nosso site, você concorda expressamente
                    com a coleta e o armazenamento dos seguintes dados pessoais: <br /><br />

                    1. Nome <br />
                    2. Dados como horas, publicações e etc... <br />
                    3. Demais informações que constam no registro físico. <br /><br />

                    Alguns dados como nome, e um código criado para seu dispositivo serão armazenados em seu dispositivo localmente, usando o mecanismo de armazenamento local conhecido como &quot;localstorage&quot;, a fim de melhorar sua experiência de uso do site. Essas informações não serão compartilhadas com terceiros e serão usadas apenas para fins internos do site. <br /><br />

                    Você pode retirar seu consentimento a qualquer momento, excluindo os dados armazenados em localstorage por meio das configurações do seu navegador. <br /><br />

                    Ao continuar a utilizar nosso site, você concorda com esta coleta e armazenamento de dados pessoais de acordo com os termos desta mensagem de consentimento. <br /><br />
                </span>
            </LayoutPrincipal>
        </>
    )
}

