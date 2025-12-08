import FormLogin from "@/Components/Forms/FormLogin"
import HeadComponent from "@/Components/HeadComponent"
import InformationBoardImage from "@/Components/InformationBoardImage"
import { domainUrl } from "@/atoms/atom"
import { useAtomValue } from "jotai"
import { GetServerSideProps } from "next"
import { parseCookies } from "nookies"

function Login() {
    const domain = useAtomValue(domainUrl)

    return (
        <main className={`md:flex md:h-screen`}>
            <HeadComponent title="Login" urlMiniatura={`${domain}/images/miniatura.png`} />
            <section className={`flex justify-center items-center w-screen h-screen lg:w-7/12 md:w-7/12 md:h-full relative md:static bg-primary-100`}>
                <div className="hidden md:flex text-surface-200 rounded-xl">
                    <InformationBoardImage size="400" />
                </div>
            </section>
            <section className={`flex flex-wrap w-9/12 sm:w-2/3 h-4/5 absolute rounded-xl md:rounded-none top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 justify-center items-center md:w-5/12 md:h-full md:static md:transform-none bg-primary-100 md:bg-surface-200`}>
                <FormLogin />
            </section>
        </main>
    )
}

Login.getLayout = function getLayout(page: React.ReactElement) {
    return page // sem layout nenhum
}

export default Login

export const getServerSideProps: GetServerSideProps = async (ctx) => {
    const { ["quadro-token"]: token } = parseCookies(ctx)

    if (!token) {
        return { props: {} }
    }

    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/recover-user-information`, {
            headers: {
                Authorization: `Bearer ${token.replace(/"/g, "")}`,
            },
        })

        if (!res.ok) {
            throw new Error("Invalid token")
        }

        return {
            redirect: {
                destination: "/dashboard",
                permanent: false,
            },
        }

    } catch (error) {
        return { props: {} }
    }
}