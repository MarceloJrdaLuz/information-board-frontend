interface ConteudoProps{
    children?: any
    relatorios?: boolean
    hConteudo?: string
    bgFundo?: string
    justifyContent?: string
}
export default function Conteudo (props: ConteudoProps){
    return(
        <div className={`conteudo overflow-y-auto hide-scrollbar text-center flex flex-col ${props.hConteudo && props.hConteudo} min-h-[50vh] ${props.bgFundo ? props.bgFundo : 'bg-gray-200' } p-3 ${props.justifyContent ? props.justifyContent : 'justify-around'} ${props.hConteudo === 'full' && 'min-h-screen'}`}>
            {props.children}
        </div>
    )
}