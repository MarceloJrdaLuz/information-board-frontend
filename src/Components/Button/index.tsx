import { AlignLeft, CheckCircle2Icon } from "lucide-react"
import { ButtonHTMLAttributes } from "react"
import { tv, VariantProps } from "tailwind-variants"

const button = tv({
  base: `
    flex justify-center items-center transition-all gap-2 duration-200
    active:scale-[0.98] shadow-sm hover:shadow rounded-xl
    border text-xs xs:text-sm sm:text-md lg:text-base
    justify-self-center h-[42px] min-w-[140px] px-5 font-semibold select-none
  `,
  variants: {
    size: {
      default: "py-2 px-5",
      sm: "w-28 py-2",
      md: "w-36 py-2.5",
      lg: "w-44 py-3"
    },
    outline: {
      false: "bg-primary-200 hover:bg-primary-150 text-white border-transparent shadow-sm hover:shadow",
      true: "border-surface-300 hover:border-primary-200 bg-surface-100 hover:bg-surface-200 text-typography-700 hover:text-primary-200 font-semibold shadow-xs"
    },
    disabled: {
      true: "opacity-50 cursor-not-allowed bg-surface-300 text-typography-400 border-transparent shadow-none hover:shadow-none active:scale-100"
    },
    alignLeft: {
      true: "justify-start px-8"
    },
    success: {
      true: "bg-emerald-600 hover:bg-emerald-700 text-white border-transparent shadow-sm"
    },
    remove: {
      true: "text-red-500 border-red-300 hover:bg-red-50 dark:hover:bg-red-950/20 shadow-none"
    },
    error: {
      true: "bg-red-500 hover:bg-red-600 text-white border-transparent shadow-sm"
    }
  },
  defaultVariants: {
    size: "default",
    outline: false,
    success: false,
    remove: false,
    error: false,
    alignLeft: false
  }
})

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof button>

export default function Button({
  disabled,
  size,
  success,
  remove,
  className,
  error,
  outline,
  alignLeft,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled}
      className={button({ disabled, size, success, remove, error, outline, alignLeft, className })}
      {...props}
    >
      {error ? (
        <span className="flex justify-center items-center gap-2">
          <CheckCircle2Icon /> Não enviado
        </span>
      ) : success ? (
        <span className="flex justify-center items-center gap-2">
          <CheckCircle2Icon /> Enviado
        </span>
      ) : (
        props.children
      )}
    </button>
  )
}
