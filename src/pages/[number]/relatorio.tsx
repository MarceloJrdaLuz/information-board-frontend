import HeadComponent from "@/Components/HeadComponent"
import LayoutPrincipal from "@/Components/LayoutPrincipal"
import FormReport from "@/Components/Forms/FormReport"
import { CongregationTypes } from "@/entities/types"
import { api } from "@/services/api"
import { GetServerSideProps } from 'next'
import { useAtomValue } from "jotai"
import { domainUrl } from "@/atoms/atom"

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
    const domain = useAtomValue(domainUrl)

    return (
        <>
            <HeadComponent title="Relatório" urlMiniatura={`${domain}/images/relatorio.png`} />
            <LayoutPrincipal congregationName={congregationName} circuit={congregationCircuit} bgFundo={'bg-teste-100'} heightConteudo="full">
                <FormReport congregationNumber={congregationNumber} />
            </LayoutPrincipal>
        </>
    )
} 