import { ComponentProps, ReactNode } from "react"
import Label from "../Label"

interface TextAreaProps extends ComponentProps<'textarea'> {
    invalid?: string
    registro?: any
    mes?: number | null
    children?: ReactNode
}

export default function TextArea(props: TextAreaProps) {

    return (
        <div className={`input-component ${props.readOnly ? 'focus-within:outline border-none' : 'outline'} relative flex items-center rounded-xl border ${props.invalid === 'invalido' ? 'border-red-500 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-500/20 mb-1' : 'border-surface-300 focus-within:border-primary-200 focus-within:ring-2 focus-within:ring-primary-200/20'} outline-0 my-2.5 w-full h-full m-auto transition-all shadow-xs ${props.className || ''}`}>
            <textarea
                onChange={props.onChange}
                name={props.name}
                placeholder={props.placeholder}
                className={`block px-3.5 py-2.5 w-full text-sm 
                text-typography-800 appearance-none placeholder-transparent focus:outline-none rounded-xl bg-transparent read-only:bg-surface-200/50 font-sans font-medium text-left ${props.readOnly ? 'cursor-not-allowed' : ''} thin-scrollbar`}
                readOnly={props.readOnly}
                autoComplete="off"
                maxLength={props.maxLength}
                required={props.required}
                ref={props.registro}
                {...props.registro}
            />
            <Label invalido={props.invalid === 'invalido'} text={props.placeholder} readonly={props.readOnly} />
            {props.children}
        </div>
    )
}   