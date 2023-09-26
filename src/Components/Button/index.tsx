import { success } from "@material-tailwind/react/types/components/input"
import { CheckCircle2Icon } from "lucide-react"
import { ButtonHTMLAttributes } from "react"
import { tv, VariantProps } from 'tailwind-variants'

const button = tv({
    base: 'flex justify-center transition-all duration-500 bg-primary-200 active:shadow-none shadow-lg  items-center rounded-lg hover:opacity-95 border border-current text-white justify-self-center ',
    variants: {
        size: {
            default: 'px-10 py-2',
            lg: 'p-10',
            sm: 'px-4 py-2 text-sm'
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
        error: false
    }
})


type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof button>

export default function Button({ disabled, size, success, remove, className, error, ...props }: ButtonProps) {
    return (
        <button disabled={disabled} className={button({ disabled, size, success, className, remove, error })} {...props}>
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