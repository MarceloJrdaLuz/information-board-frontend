import ButtonHome from "@/Components/ButtonHome";
import HeadComponent from "@/Components/HeadComponent";
import LayoutPrincipal from "@/Components/LayoutPrincipal";
import DateConverter, { tresMesesProgramacao } from "@/functions/meses";
import usePdfShow from "@/hooks/usePdfShow";
import { api } from "@/services/api";
import { useState } from "react";


export interface CongregationTypes {
    id: string
    name: string
    number: string
    city: string
    circuit: string
    imageUrl: string
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

export default function Designacoes(props: CongregationTypes) {
    
    const { pdfShow, setPdfShow } = usePdfShow()  //aqui define se o pdf vai ser renderizado ou se vai ser o layout

    const [opcao, setOpcao] = useState('') // aqui define o caminho que ele vai acessar para chegar no pdf ou da reuniao do meio de semana ou do fim de semana

    const [visivel, setVisivel] = useState(false) // mostrar ou nao mostrar opções dos meses da programação

    let tresMeses = false

    if (new Date().getDate() <= 6 && new Date().getDay() <= 4) {
        tresMeses = tresMesesProgramacao()
    }

    function renderizarPdf(opcao: string) {
        return (
            <span>A</span>
            // <GeradorPdf nomeArquivo={opcao} setPdfShow={setPdfShow} />
        )
    }


    function renderizarBotoes() {
        return tresMeses ? (
            <div className="flex justify-between w-full md:w-4/5 my-0 m-auto">
                <ButtonHome onClick={() => { setPdfShow(true), setOpcao(`${DateConverter('mes-1')}`) }} texto={`${DateConverter('mes-1')}`} />

                <ButtonHome onClick={() => { setPdfShow(true), setOpcao(`${DateConverter('mes')}`) }} texto={`${DateConverter('mes')}`} />

                <ButtonHome onClick={() => { setPdfShow(true), setOpcao(`${DateConverter('mes+1')}`) }} texto={`${DateConverter('mes+1')}`} />
            </div>
        ) : (
            <div className="flex justify-between w-full md:w-4/5 my-0 m-auto">
                <ButtonHome onClick={() => { setPdfShow(true), setOpcao(`${DateConverter('mes')}`) }} texto={`${DateConverter('mes')}`} />

                <ButtonHome onClick={() => { setPdfShow(true), setOpcao(`${DateConverter('mes+1')}`) }} texto={`${DateConverter('mes+1')}`} />
            </div>
        )
    }

    return !pdfShow ? (
        <>
            <HeadComponent title="Designações" urlMiniatura="https://luisgomes.netlify.app/images/designacoes.png" />
            <LayoutPrincipal congregationName={props.name} circuit={props.circuit} textoHeader="Designações Semanais" heightConteudo={'1/2'} header className='bg-designacoes bg-center bg-cover'>
                <div>
                    <ButtonHome
                        onClick={() => setVisivel(true)}
                        texto='Vida e Ministério'
                    />
                    {visivel ? renderizarBotoes() : null}
                    {!visivel ? <p className="font-bold  text-xl">Quarta-feira às 19:00 hrs</p> : null}
                </div>

                <div>
                    <ButtonHome
                        onClick={() => { setOpcao('Publica'), setPdfShow(true) }}
                        texto='Reunião Pública'
                    />
                    {<p className="font-bold text-xl">Sábado às 17:00 hrs</p>}
                </div>
                <ButtonHome href={`/${props.number}`} texto='Voltar' />
            </LayoutPrincipal>
        </>
    ) : (
        renderizarPdf(opcao)
    )
}