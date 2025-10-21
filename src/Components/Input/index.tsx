import { ComponentProps, ReactNode, forwardRef } from "react"
import Label from "../Label"
import InputMask from "react-input-mask"

interface InputProps extends ComponentProps<'input'> {
  invalid?: string
  registro?: any
  mes?: number | null
  children?: ReactNode
  mask?: string // <- adiciona suporte para máscara
}

const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const { invalid, registro, children, className, mask, ...rest } = props

  return (
    <div
      className={`input-component ${props.readOnly ? "focus-within:outline border-none" : "outline"
        } relative flex items-center rounded-lg border-[1px] ${invalid === "invalido"
          ? "border-red-400 mb-1"
          : "border-blue-gray-200"
        } focus-within:border-primary-100 focus-within:border-2 outline-0 my-3 w-full h-full m-auto ${className}`}
    >
      {mask ? (
        <InputMask
          mask={mask}
          maskChar={null}
          {...rest}
          {...registro}
          inputRef={ref} // <- importante para integrar com react-hook-form
          className={`block px-3 py-2.5 w-full text-sm text-black appearance-none placeholder-transparent focus:outline-none rounded-xl bg-transparent read-only:bg-gray-300 read-only:rounded-lg font-sans font-normal text-left ${props.readOnly && "cursor-not-allowed"
            }`}
        />
      ) : (
        <input
          {...rest}
          {...registro}
          className={`block px-3 py-2.5 w-full text-sm text-black appearance-none placeholder-transparent focus:outline-none rounded-xl bg-transparent read-only:bg-gray-300 read-only:rounded-lg font-sans font-normal text-left ${props.readOnly && "cursor-not-allowed"
            }`}
        />
      )}

      <Label
        invalido={invalid === "invalido"}
        text={props.placeholder}
        readonly={props.readOnly}
      />
      {children}
    </div>
  )
})

Input.displayName = "Input"

export default Input
