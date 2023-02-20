import errors from '../../utils/errors.json'

interface InputErrorsProps {
    type: string
    field: string
}


export default function InputError({type, field}:InputErrorsProps){
    //@ts-expect-error
    return <span className="text-red-500 ">{errors[field][type]}</span>
}