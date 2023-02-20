interface FormStyleProps{
    onSubmit: () => void
    children: React.ReactNode
}

export default function FormStyle(props: FormStyleProps){

    return(
        <form onSubmit={props.onSubmit} className={`flex w-full h-9/12 min-h-[450px] max-h-[600px] justify-center items-center bg-white p-6 md:p-12 -z-10 sm:z-0  md:justify-center md:items-center shadow-neutral-300 rounded-xl lg:w-10/12 md:w-11/12 md:h-4/6`}>
            {props.children}
        </form>
    )
}