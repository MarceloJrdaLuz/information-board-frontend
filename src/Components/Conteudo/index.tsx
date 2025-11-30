interface ConteudoProps{
    children?: any
    relatorios?: boolean
    hConteudo?: string
    bgFundo?: string
    justifyContent?: string
}
export default function Conteudo (props: ConteudoProps){
    return(
        <div className={`conteudo pb-8 pt-5 px-3 gap-6 overflow-y-auto hide-scrollbar text-center flex flex-col ${props.hConteudo && props.hConteudo} min-h-[50vh] ${props.bgFundo ? props.bgFundo : 'bg-surface-200' }  ${props.justifyContent ? props.justifyContent : 'justify-around'} ${props.hConteudo === 'full' && 'min-h-screen'}`}>
            {props.children}
        </div>
    )
}