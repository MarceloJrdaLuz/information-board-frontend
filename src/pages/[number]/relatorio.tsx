import HeadComponent from "@/Components/HeadComponent"
import LayoutPrincipal from "@/Components/LayoutPrincipal"
import RelatorioForm from "@/Components/RelatorioForm"
import { CongregationTypes } from "@/entities/types"
import { api } from "@/services/api"
import { GetServerSideProps } from 'next'

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { number } = context.query

    const getCongregation = await api.get(`/congregation/${number}`)

    const { data: congregationData } = getCongregation

    return {
        // Passed to the page component as props
        props: { ...congregationData },
    }
}

export default function Relatorio({circuit: congregationCircuit, name: congregationName, number: congregationNumber}: CongregationTypes) {
    return (
        <>
            <HeadComponent title="Relatório" urlMiniatura="https://luisgomes.netlify.app/images/miniatura.png" />
            <LayoutPrincipal congregationName={congregationName} circuit={congregationCircuit} bgFundo={'bg-teste-100'} heightConteudo="full">
                <RelatorioForm congregationNumber={congregationNumber} />
            </LayoutPrincipal>
        </>
    )
} 