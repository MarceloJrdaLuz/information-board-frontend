interface FormStyleProps{
    onSubmit: () => void
    children: React.ReactNode
    full?: boolean
}

export default function FormStyle(props: FormStyleProps){

    return(
        <form
  onSubmit={props.onSubmit}
  className={`
    flex z-0 w-full
    ${!props.full && "min-h-[450px] lg:w-10/12 md:w-11/12 md:h-fit"}  
    max-w-[600px] justify-center items-start
    bg-surface-100 p-6 md:p-8 
    shadow-neutral-300 rounded-xl
  `}
>
            {props.children}
        </form>
    )
}