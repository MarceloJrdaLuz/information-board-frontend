import { ComponentProps } from "react"
import Label from "../Label"

interface InputProps extends ComponentProps<'input'> {
    invalid?: string
    registro?: any
    mes?: number | null
}

export default function Input(props: InputProps) {

    return (
        <div className={` ${props.readOnly ? 'focus-within:outline border-none' : 'outline' } relative flex items-center rounded-lg border-[2px] ${props.invalid === 'invalido' ? 'border-red-400 mb-1': 'border-blue-gray-200'} focus-within:border-primary-100 focus-within:border-2 outline-0 my-3 w-full h-full m-auto  ${props.className}`}>
            <input
                onChange={props.onChange}
                type={props.type}
                name={props.name}
                placeholder={props.placeholder}
                className={` block px-3 py-2.5 w-full text-sm 
                text-black appearance-none placeholder-transparent focus:outline-none rounded-xl bg-transparent read-only:bg-gray-300 read-only:rounded-lg font-sans font-normal text-left ${props.readOnly && 'cursor-not-allowed'}`}
                readOnly={props.readOnly}
                autoComplete="off"
                required={props.required}    
                ref={props.registro}
                {...props.registro}
            />
            <Label invalido={props.invalid === 'invalido' ?? true } text={props.placeholder} readonly={props.readOnly}/>
        </div>
    )
}   