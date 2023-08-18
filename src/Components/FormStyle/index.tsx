interface FormStyleProps{
    onSubmit: () => void
    children: React.ReactNode
}

export default function FormStyle(props: FormStyleProps){

    return(
        <form onSubmit={props.onSubmit} className={`flex z-0 w-full h-screen sm:h-9/12 min-h-[450px] max-h-[640px] sm:max-h-[800px]  max-w-[600px] justify-center items-center bg-white p-6 md:p-8 md:justify-center md:items-center shadow-neutral-300 rounded-xl lg:w-10/12 md:w-11/12 md:h-fit`}>
            {props.children}
        </form>
    )
}