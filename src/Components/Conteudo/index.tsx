interface ConteudoProps{
    children?: any
    relatorios?: boolean
    hConteudo?: string
    bgFundo?: string
    justifyContent?: string
}
export default function Conteudo (props: ConteudoProps){
    return(
        <div className={`conteudo py-8 overflow-y-auto hide-scrollbar text-center flex flex-col ${props.hConteudo && props.hConteudo} min-h-[50vh] ${props.bgFundo ? props.bgFundo : 'bg-surface-200' } p-3 gap-8 ${props.justifyContent ? props.justifyContent : 'justify-around'} ${props.hConteudo === 'full' && 'min-h-screen'}`}>
            {props.children}
        </div>
    )
}