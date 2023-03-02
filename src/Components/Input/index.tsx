import { InputHTMLAttributes, ReactComponentElement } from "react";
import Label from "../Label";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    invalid?: string
    focus?: any
    registro?: any
    mes?: number | null
}

export default function Input(props: InputProps) {

    return (
        <div className={` ${props.readOnly ? 'focus-within:border-black' : 'outline' } relative flex items-center rounded-lg border-[2px] ${props.invalid === 'invalido' ? 'border-red-600 mb-1': 'border-blue-gray-200'} focus-within:border-principais-primary focus-within:border-2 focus:text-principais-primary outline-0 my-3 w-full h-full m-auto ${props.className}`}>
            <input
                onChange={props.onChange}
                type={props.type}
                name={props.name}
                placeholder={props.placeholder}
                className={`block px-3 py-2.5 sm:p-4 w-full  text-sm
                text-black appearance-none placeholder-transparent focus:outline-none bg-transparent read-only:bg-white read-only:rounded-lg font-sans font-normal text-left`}
                readOnly={props.readOnly}
                autoComplete="off"
                required={props.required}
                ref={props.registro}
                {...props.registro}
            />
            <Label invalido={props.invalid === 'invalido' ?? true } text={props.placeholder} readonly={props.readOnly} />
        </div>
    )
}   