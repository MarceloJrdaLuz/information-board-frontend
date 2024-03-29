import Button from "@/Components/Button"
import HeadComponent from "@/Components/HeadComponent"
import LayoutPrincipal from "@/Components/LayoutPrincipal"
import { domainUrl } from "@/atoms/atom"
import { CongregationTypes, ICongregation } from "@/entities/types"
import { useFetch } from "@/hooks/useFetch"
import { api } from "@/services/api"
import { useAtomValue } from "jotai"
import { ChevronsLeftIcon } from "lucide-react"
import { GetServerSideProps } from "next"
import Router, { useRouter } from "next/router"
import { useEffect, useState } from "react"


export default function PoliticaPrivacidade() {
    const router = useRouter()
    const { number } = router.query
    const domain = useAtomValue(domainUrl)

    const [congregationData, setCongregationData] = useState<ICongregation>()

    const fetchConfigCongregationData = number ? `/congregation/${number}` : ""
    const { data: congregation } = useFetch<ICongregation>(fetchConfigCongregationData)

    useEffect(() => {
        if (congregation) {
            setCongregationData(congregation)
        }
    }, [congregation])

    return (
        <div className=" flex flex-col h-screen w-screen bg-gray-200">
            <HeadComponent title="Política de Privacidade" urlMiniatura={`${domain}/images/miniatura.png`} />
            <LayoutPrincipal congregationName={congregationData?.name ?? ""} circuit={congregationData?.circuit ?? ""} heightConteudo={'1/2'} header className="bg-gray-900 bg-left-bottom bg-cover lg:bg-right" textoHeader="Política de Privacidade" >
                <h1 className="mb-5 font-bold text-gray-900 text-2xl">Política sobre coleta e armazenamento de dados</h1>
                <span className="h-full hide-scrollbar overflow-auto text-gray-900 w-4/6 md:w-3/6 m-auto">
                    Ao utilizar nosso site, você concorda expressamente
                    com a coleta e o armazenamento dos seguintes dados pessoais: <br /><br />

                    1. Nome completo. <br />
                    2. Dados como horas, publicações e etc... <br />
                    3. Demais informações que constam no registro de publicador físico. <br /><br />
                    4. No caso de ter o cadastro no site, você concederá também o acesso ao seu e-mail.

                    Alguns dados como nome, e um código criado para seu dispositivo serão armazenados em seu dispositivo localmente, usando o mecanismo de armazenamento local conhecido como &quot;localstorage&quot;, a fim de melhorar sua experiência de uso do site. Essas informações não serão compartilhadas com terceiros e serão usadas apenas para fins internos do site e são protegidos de uso indevido. <br /><br />

                    Você pode retirar seu consentimento a qualquer momento, excluindo os dados armazenados em localstorage por meio das configurações do seu navegador. <br /><br />

                    Ao continuar a utilizar nosso site, você concorda com esta coleta e armazenamento de dados pessoais de acordo com os termos desta mensagem de consentimento. <br /><br />
                </span>

                <Button
                    onClick={() => Router.push(`/${number}`)}
                    className="w-1/2 mx-auto"
                ><ChevronsLeftIcon />Voltar</Button>
            </LayoutPrincipal>
        </div>
    )
}

