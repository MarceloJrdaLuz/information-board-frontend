import FormForgotPassword from "@/Components/Forms/FormForgotPassword"
import InformationBoardImage from "@/Components/InformationBoardImage"

function ForgotPassword() {
    return (
        <main className={`md:flex md:h-screen`}>
            <section className={`flex justify-center  items-center w-screen h-screen lg:w-7/12 md:w-7/12 md:h-full relative md:static bg-primary-100`}>
                <div className="hidden md:flex text-typography-200 rounded-xl">
                    <InformationBoardImage size="400" />
                </div>
            </section>
            <section className={`flex flex-wrap w-9/12 sm:w-2/3 h-4/5 absolute rounded-xl md:rounded-none top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 justify-center items-center md:w-5/12 md:h-full md:static md:transform-none bg-typography-200`}>
                <FormForgotPassword />
            </section>
        </main>
    )
}

ForgotPassword.getLayout = function getLayout(page: React.ReactElement) {
    return page // sem layout nenhum
}

export default ForgotPassword
