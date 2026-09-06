import errors from '../../utils/errors.json'

interface InputErrorsProps {
    type: string
    field: string
}


export default function InputError({type, field}: InputErrorsProps){
    //@ts-expect-error
    const message = errors[field]?.[type] || "Campo obrigatório ou inválido"
    return <span className="text-xs text-red-500 font-medium -mt-1 mb-2.5 block">{message}</span>
}