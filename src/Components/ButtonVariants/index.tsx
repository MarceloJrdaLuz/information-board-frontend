import { CheckCircle2Icon } from "lucide-react"
import { ButtonHTMLAttributes } from "react"
import { tv, VariantProps } from 'tailwind-variants'

const button = tv({
    base: 'flex justify-center bg-primary-200 items-center rounded-lg hover:opacity-95 border border-current text-white justify-self-center ',
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
            true: 'bg-success-100 transition-all duration-500 '
        },
        remove: {
            true: 'bg-red-400'
        },
    },
    defaultVariants: {
        size: 'default',
        success: false,
        remove: false,
    }
})


type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof button>

export default function ButtonVariants({ disabled, size, success, remove, className, ...props }: ButtonProps) {
    return (
        <button disabled={disabled} className={button({ disabled, size, success, className, remove })} {...props}>{success ? <CheckCircle2Icon /> : props.children}</button>

    )
}