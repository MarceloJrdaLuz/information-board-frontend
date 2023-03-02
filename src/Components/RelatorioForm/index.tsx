import { IconeWhats } from "@/assets/icons"
import useValidar from "@/hooks/useValidar"
import { api } from "@/services/api"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import ButtonHome from "../ButtonHome"
import Input from "../Input"

export default function RelatorioForm() {

    // const [btnEnvio, setBtnEnvio] = useState(false)
    // const [nome, setNome] = useState('')
    // const [mes, setMes] = useState<Number | null>(null)
    // const [publicacoes, setPublicacoes] = useState("")
    // const [videos, setVideos] = useState("")
    // const [horas, setHoras] = useState("")
    // const [revisitas, setRevisitas] = useState("")
    // const [estudos, setEstudos] = useState("")
    // const [observacoes, setObservacoes] = useState("")
    // const [dirigentes, setDirigentes] = useState([])
    // const [dirigentesLinks, setDirigentesLinks] = useState<any>([])

    // useEffect(() => {
    //     setMes(new Date().getMonth())
    // }, [])

    // useEffect(() => {
    //     getDirigentes()
    // }, [])

    // async function getDirigentes() {
    //     const dadosDirigentes = await api.get('/dirigentes')
    //     setDirigentes(dadosDirigentes.data)
    // }


    // // useEffect(()=>{
    // //     const links = dirigentes?.map(dirigente => ({
    // //         link: `https://api.whatsapp.com/send?phone=55${dirigente.phone.replace(/[^0-9]/g, '')}&text=*Publicador:*%20${nome}%0A%0A*Mês:*%20${MesString(new Date().getMonth())}%0A%0A*Publicações:*%20${publicacoes}%0A*Vídeos:*%20${videos}%0A*Horas:*%20${horas}%0A*Revisitas:*%20${revisitas}%0A*Estudos:*%20${estudos}%0A%0A*Observações:*%20${observacoes}`,
    // //         nome: dirigente.name
    // //     }))
    // //     setDirigentesLinks([...links])
    // // },[dirigentes, nome, publicacoes, videos, horas, revisitas, estudos, observacoes])


    // const {
    //     inputHorasInvalido,
    //     inputNomeInvalido,
    //     setInputNomeInvalido,
    //     setInputHorasInvalido
    // } = useValidar()

    // function submit() {
    //     if (nome === '') {
    //         setInputNomeInvalido(true)
    //     }
    //     if (horas === "0") {
    //         setInputHorasInvalido(true)
    //     }
    // }

    // const searchInput = useRef<HTMLElement | null>(null)

    // function handleFocus() {
    //     !inputHorasInvalido || !inputNomeInvalido ? null : searchInput.current?.focus()
    // }

    // function renderizarBotoesEnvio() {

    //     return btnEnvio ? (
    //         <div className="flex justify-between items-stretch flex-col">
    //             <div className="flex h-auto w-full flex-wrap justify-center flex-1">
    //                 {dirigentesLinks?.map(item => (
    //                     <Link key={item.link} href={item.link} passHref>
    //                         <button className="flex justify-center items-center bg-teste-200 my-1  hover:bg-teste-200 h-12 rounded-md min-w-[100px] px-8
    //                             text-black text-base 
    //                              font-medium   auto hover:-translate-x-1
    //                              mx-1 hover:border-2 hover:border-black
    //                              ">
    //                             <span>{item.nome}</span>
    //                             <span className="ml-2">{IconeWhats}</span>
    //                         </button>
    //                     </Link>
    //                 ))}
    //             </div>
    //         </div >
    //     ) : null
    // }
    // return (
    //     <div className="px-4 w-full flex flex-col border-2 rounded-xl bg-gray-200">
    //         <h1 className="my-4 flex justify-center text-3xl font-semibold">Relatório</h1>
    //         <form onSubmit={e => { e.preventDefault(), submit() }} className="flex flex-col  p-3">
    //             <Input name="nome" placeholder="Nome*" type='text' onChange={({ target: { value } }) => { setNome(value), value.trim() !== "" ? setInputNomeInvalido(false) : setInputNomeInvalido(true) }} invalid={inputNomeInvalido ? 'invalido' : ''} focus={searchInput} />

    //             {inputNomeInvalido && <p className="flex justify-end text-red-700 font-semibold -mt-3">Campo obrigatório*</p>}

    //             <Input readOnly mes={mes} name="mes" placeholder="Mês" type='text' />

    //             <Input name="publicacoes" placeholder="Publicações" type='number' onChange={({ target: { value } }) => setPublicacoes(value)} />

    //             <Input name="videos" placeholder="Vídeos" type='number' onChange={({ target: { value } }) => setVideos(value)} />

    //             <Input name="horas" placeholder="Horas*" type='number' onChange={({ target: { value } }) => { setHoras(value), value != "" && value != "0" ? setInputHorasInvalido(false) : setInputHorasInvalido(true) }} invalid={inputHorasInvalido ? 'invalido' : ''} />

    //             {inputHorasInvalido && <p className="flex justify-end text-red-700 font-semibold -mt-3">Campo obrigatório*</p>}

    //             <Input name="revisitas" placeholder="Revisitas" type='number' onChange={({ target: { value } }) => setRevisitas(value)} />

    //             <Input name="estudos" placeholder="Estudos" type='number' onChange={({ target: { value } }) => setEstudos(value)} />

    //             <Input name="observacoes" placeholder="Observações" type='text' onChange={({ target: { value } }) => setObservacoes(value)} />

    //             <div className="mt-6 w-full flex">
    //                 <ButtonHome
    //                     height={'h-16'}
    //                     texto={'Enviar'}
    //                     onClick={() => { setBtnEnvio(true), renderizarBotoesEnvio, submit(), handleFocus() }}
    //                     className="hover:border-2 hover:border-black hover:-translate-y-1 md:m-auto"
    //                 />
    //             </div>
    //             {!inputHorasInvalido && !inputNomeInvalido ? renderizarBotoesEnvio() : null}

    //         </form>
    //     </div>
    // )
    return (
        <div>Relatório</div>
    )
}