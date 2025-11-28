import { CheckCircle2Icon } from "lucide-react"
import { ButtonHTMLAttributes } from "react"
import { tv, VariantProps } from "tailwind-variants"

const button = tv({
  base: `
    flex justify-center items-center transition-all gap-2 duration-500
    active:shadow-none shadow-xl rounded-lg
    border   text-xs xs:text-sm sm:text-md lg:text-base
    justify-self-center h-[40px] w-48 text-typography-200
  `,
  variants: {
    size: {
      default: "px-2 py-2",
      sm: "w-28 py-2",
      md: "w-36 py-3",
      lg: "w-40 py-3"
    },
    outline: {
      false: "bg-gradient-to-tl from-primary-150 to-primary-200  text-surface-100 border-none hover:opacity-90",
      true: "border-typography-300 hover:border-current bg-surface-100 hover:bg-surface-200 p-3 text-primary-200 font-semibold shadow-none"
    },
    disabled: {
      true: "bg-typography-500 hover:opacity-100 cursor-not-allowed shadow-none"
    },
    success: {
      true: "bg-success-100"
    },
    remove: {
      true: "text-red-400 border-red-400"
    },
    error: {
      true: "bg-red-400"
    }
  },
  defaultVariants: {
    size: "default",
    outline: false,
    success: false,
    remove: false,
    error: false
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
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled}
      className={button({ disabled, size, success, remove, error, outline, className })}
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
