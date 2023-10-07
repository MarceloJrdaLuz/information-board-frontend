import { CheckCircle2Icon } from "lucide-react"
import { ButtonHTMLAttributes } from "react"
import { tv, VariantProps } from 'tailwind-variants'

const button = tv({
    base: 'flex justify-center items-center transition-all gap-2 duration-500 bg-primary-200 active:shadow-none shadow-xl  rounded-lg hover:opacity-90 border border-current text-xs sm:text-sm md:text-md lg:text-base text-white justify-self-center max-h-[40px]',
    variants: {
        size: {
            default: 'px-10 py-2',
            lg: 'p-10',
            sm: 'px-4 py-2 text-sm'
        },
        outline: {
            true: "border-gray-300 hover:border-current rounded-none bg-white hover:bg-sky-100 p-3 text-primary-200 font-semibold"
        },
        disabled: {
            true: 'bg-gray-500 hover:opacity-100 cursor-not-allowed'
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
                <span className="flex gap-2"><CheckCircle2Icon />Não enviado</span>
            ) : success ? (
                <span className="flex gap-2"><CheckCircle2Icon />Enviado</span>
            ) : (
                props.children
            )}
        </button>
    )
}