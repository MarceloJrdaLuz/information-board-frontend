interface LabelProps {
    text?: string
    readonly?: boolean
    invalido?: boolean
}

export default function Label(props: LabelProps) {
    return (
        <label className={`flex text-gray-800 rounded-lg h-full justify-center items-center text-sm font-normal absolute top-0 ml-2 py-2.5 sm:p-2 ${props.invalido ? 'text-red-700 ': 'text-blue-gray-600'} -z-50  duration-300 origin-0 ${props.readonly ? 'bg-white' : 'bg-white'}`}>{props.text}</label>)
}