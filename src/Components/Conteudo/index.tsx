interface ConteudoProps{
    children?: any
    relatorios?: boolean
    hConteudo?: string
    bgFundo?: string
    justifyContent?: string
}
export default function Conteudo (props: ConteudoProps){
    return(
        <div className={`conteudo overflow-y-auto hide-scrollbar text-center flex flex-col h-${props.hConteudo} min-h-[50vh] ${props.bgFundo ? props.bgFundo : 'bg-gray-200' } p-3 justify-${props.justifyContent ? props.justifyContent : 'around'} ${props.hConteudo === 'full' && 'min-h-screen'}`}>
            {props.children}
        </div>
    )
}