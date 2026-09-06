interface LabelProps {
    text?: string
    readonly?: boolean
    invalido?: boolean
}

export default function Label(props: LabelProps) {
    if (!props.text) return null

    return (
        <label
            className={`flex pointer-events-none rounded-md h-full justify-center items-center text-sm font-normal absolute top-0 ml-3 px-1.5 py-2.5 sm:py-2
                ${props.invalido ? 'text-red-500' : 'text-typography-500'} 
                transition-all duration-200 origin-0 
                ${props.invalido ? '!text-red-500' : 'text-typography-500'} 
                transition-all duration-200 origin-left 
                ${props.readonly ? 'bg-surface-200/60 cursor-not-allowed text-typography-400' : 'bg-surface-100'}`}
        >
            {props.text}
        </label>
    )
}
