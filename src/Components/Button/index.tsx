import { CheckCircle2Icon } from "lucide-react"
import { ButtonHTMLAttributes } from "react"
import { tv, VariantProps } from 'tailwind-variants'

const button = tv({
    base: 'flex justify-center items-center transition-all gap-2 duration-500 bg-primary-200 active:shadow-none shadow-xl  rounded-lg hover:opacity-90 border border-current  text-xs xs:text-sm sm:text-md lg:text-base text-surface-100 justify-self-center h-[40px] w-48',
    variants: {
        size: {
            default: 'px-2 py-2',
            sm: 'w-28 py-2',
            md: 'w-36 py-3',
            lg: 'w-40 py-3'
        },
        outline: {
            true: "border-typography-300 hover:border-current rounded-none bg-surface-100 hover:bg-sky-100 p-3 text-primary-200 font-semibold"
        },
        disabled: {
            true: 'bg-typography-500 hover:opacity-100 cursor-not-allowed'
        },
        success: {
            true: 'bg-success-100'
        },
        remove: {
            true: 'bg-red-400'
        },
        error: {
            true: 'bg-red-400'
        }
    },
    defaultVariants: {
        size: 'default',
        success: false,
        remove: false,
        error: false,
        outline: false
    }
})


type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof button>

export default function Button({ disabled, size, success, remove, className, error, outline, ...props }: ButtonProps) {
    return (
        <button disabled={disabled} className={button({ disabled, size, success, className, remove, error, outline })} {...props}>
            {error ? (
                <span className="flex justify-center  items-center gap-2"><CheckCircle2Icon />Não enviado</span>
            ) : success ? (
                <span className="flex justify-center items-center gap-2"><CheckCircle2Icon />Enviado</span>
            ) : (
                props.children
            )}
        </button>
    )
}