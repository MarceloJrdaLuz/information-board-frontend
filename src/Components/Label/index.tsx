interface LabelProps {
    text?: string
    readonly?: boolean
    invalido?: boolean
}

export default function Label(props: LabelProps) {
    return (
        <label
            className={`flex pointer-events-none text-typography-500 rounded-lg h-full justify-center items-center text-sm font-normal absolute top-0 ml-3 py-2.5 sm:p-2 
                ${props.invalido ? 'text-red-400 ' : 'text-blue-gray-600'} 
                duration-300 origin-0 
                ${props.readonly ? 'bg-surface-300 cursor-not-allowed' : 'bg-surface-100'}`}
        >
            {props.text}
        </label>
    )
}
