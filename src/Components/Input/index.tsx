import React, { ComponentProps, ReactNode, Ref, forwardRef } from "react"
import Label from "../Label"
import InputMask from "react-input-mask"

interface InputProps extends ComponentProps<'input'> {
  invalid?: string
  registro?: any
  mes?: number | null
  children?: ReactNode
  mask?: string // <- adiciona suporte para máscara
}

function mergeRefs<T>(...refs: (Ref<T> | undefined | null)[]) {
  return (el: T | null) => {
    refs.forEach((ref) => {
      if (!ref) return
      if (typeof ref === 'function') ref(el)
      else (ref as React.MutableRefObject<T | null>).current = el
    })
  }
}

const Input = forwardRef<HTMLInputElement, InputProps>((props, forwardedRef) => {
  const { invalid, registro, children, className, mask, ...rest } = props

  // Extraindo o ref do registro para fazer merge com o forwardedRef.
  // Sem isso, ref={forwardedRef} (null quando não passado externamente) sobrescrevia
  // o ref callback do react-hook-form, impedindo-o de ler os valores dos campos.
  const { ref: registroRef, ...registroRest } = registro ?? {}

  const mergedRef = mergeRefs<HTMLInputElement>(forwardedRef, registroRef)

  return (
    <div
      className={`input-component ${
        props.readOnly ? "focus-within:outline border-none" : "outline"
      } relative flex items-center rounded-xl border ${
        invalid === "invalido"
          ? "border-red-500 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-500/20 mb-1"
          : "border-surface-300 focus-within:border-primary-200 focus-within:ring-2 focus-within:ring-primary-200/20"
      } outline-0 my-2.5 w-full h-full m-auto transition-all shadow-xs ${className || ""}`}
    >
      {mask ? (
        <InputMask
          mask={mask}
          maskChar={null}
          {...rest}
          {...registroRest}
          placeholder={props.placeholder || " "}
          inputRef={mergedRef}
          className={`block px-3.5 py-2.5 w-full text-sm text-typography-800 appearance-none placeholder-transparent focus:outline-none rounded-xl bg-transparent read-only:bg-surface-200/50 font-sans font-medium text-left ${
            props.readOnly ? "cursor-not-allowed" : ""
          }`}
        />
      ) : (
        <input
          {...rest}
          {...registroRest}
          placeholder={props.placeholder || " "}
          ref={mergedRef}
          className={`block px-3.5 py-2.5 w-full text-sm text-typography-800 appearance-none placeholder-transparent focus:outline-none rounded-xl bg-transparent read-only:bg-surface-200/50 font-sans font-medium text-left ${
            props.readOnly ? "cursor-not-allowed" : ""
          }`}
        />
      )}

      {!props.readOnly && props.placeholder && (
        <Label
          invalido={invalid === "invalido"}
          text={props.placeholder}
          readonly={props.readOnly}
        />
      )}
      {children}
    </div>
  )
})

Input.displayName = "Input"

export default Input
