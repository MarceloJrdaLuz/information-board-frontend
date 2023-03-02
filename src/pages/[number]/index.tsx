import ButtonHome from "@/Components/ButtonHome";
import HeadComponent from "@/Components/HeadComponent";
import LayoutPrincipal from "@/Components/LayoutPrincipal";
import { api } from "@/services/api";


export interface CongregationTypes {
    id: string
    name: string
    number: string
    city: string
    circuit: string
    imageUrl: string
}

export default function Home(props: CongregationTypes) {
    return (
        <div className=" flex flex-col bg-gray-200">
            <HeadComponent title="Quadro de Anúncios" urlMiniatura="https://bituruna.netlify.app/images/miniatura.png" />
            <LayoutPrincipal circuit={props.circuit} congregationName={props.name} textoHeader="Quadro de Anúncios" heightConteudo={'1/2'} header className="bg-home  bg-left-bottom bg-cover md:bg-center lg:bg-right ">
                <ButtonHome href={`${props.number}/relatorio`} texto="Relatório de Serviço de Campo" />
                <ButtonHome href={`${props.number}/limpeza`} texto="Limpeza do Salão do Reino" />
                <ButtonHome href={`${props.number}/designacoes`}texto="Designações das Reuniões" />
                <ButtonHome href={`${props.number}/campo`} texto="Designações de Campo" />
                <ButtonHome href={`${props.number}/financeiro`} texto="Relatório Financeiro" />
                <ButtonHome href={`${props.number}/eventos`} texto="Eventos" />
            </LayoutPrincipal>
        </div>
    )
}

export async function getStaticPaths() {
    const getCongregations = await api.get('/congregations')

    const congregations: CongregationTypes[] = getCongregations.data

    const paths = congregations.map(cong => ({
        params: { number: cong.number }
    }))

    return {
        paths, fallback: false
    }
}

export async function getStaticProps({ params }: {params: {number: string}}) {

    const getCongregation = await api.get(`/congregation/${params.number}`)

    const { data: congregationData } = getCongregation
    return {
        // Passed to the page component as props
        props: { ...congregationData },
    }
}

