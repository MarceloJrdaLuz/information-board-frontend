import FormResetPassword from "@/Components/FormResetPassword"
import Image from "next/image"

export default function ResetPassword() {
    return (
        <main className={`md:flex md:h-screen`}>
            <section className={`flex w-screen h-screen lg:w-7/12 md:w-7/12 md:h-full relative md:static`}>
                <Image src="/images/designacoes.png" alt="Imagens Aleatórias" width={750} height={600}/>
            </section>
            <section className={`flex flex-wrap w-9/12 sm:w-2/3 h-4/5 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 justify-center items-center md:w-5/12 md:h-full md:static md:transform-none`}>
                <FormResetPassword/>
            </section>
        </main>
    )
}