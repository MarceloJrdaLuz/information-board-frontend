interface FormStyleProps {
    onSubmit: () => void
    children: React.ReactNode
    full?: boolean
    className?: string
}

export default function FormStyle(props: FormStyleProps) {
    return (
        <form
            onSubmit={props.onSubmit}
            className={`
                flex flex-col z-0 w-full
                ${!props.full ? "max-w-[620px]" : "w-full"}
                bg-surface-100 p-6 sm:p-8
                border border-surface-300 rounded-2xl shadow-sm
                transition-all
                ${props.className || ""}
            `}
        >
            {props.children}
        </form>
    )
}