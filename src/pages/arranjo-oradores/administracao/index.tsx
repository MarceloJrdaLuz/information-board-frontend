import BreadCrumbs from "@/Components/BreadCrumbs"
import Button from "@/Components/Button"
import ContentDashboard from "@/Components/ContentDashboard"
import DropdownObject from "@/Components/DropdownObjects"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { addAndUpdateSpeakerCoordinateAtom } from "@/atoms/systemCongregationAtoms"
import { API_ROUTES } from "@/constants/apiRoutes"
import { useAuthContext } from "@/context/AuthContext"
import { useAuthorizedFetch } from "@/hooks/useFetch"
import { Gender, IPublisher } from "@/types/types"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import { useAtom, useSetAtom } from "jotai"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"

function AdminSpeakerArrangement() {
    const { user } = useAuthContext()
    const [crumbs,] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)
    const sendSpeakerCoordinator = useSetAtom(addAndUpdateSpeakerCoordinateAtom)
    const [speakerCoordinator, setSpeakerCoordinator] = useState<IPublisher | null>(user?.congregation?.speakerCoordinator || null)

    const fetchConfig = user?.congregation ? `${API_ROUTES.PUBLISHERS}/congregationId/${user.congregation?.id}` : ""
    const { data: publishers, mutate } = useAuthorizedFetch<IPublisher[]>(fetchConfig)

    const filteredPublishersMan = publishers?.filter(p => p.gender === Gender.Masculino && p.dateImmersed)

    useEffect(() => {
        setPageActive('Coordenador de discursos')
    }, [setPageActive])

    function onSubmit() {
        if (speakerCoordinator && user?.congregation) {
            toast.promise(sendSpeakerCoordinator(user?.congregation.id, speakerCoordinator?.id), {
                pending: 'Adicionando novo coordenador...',
            })
            mutate()
        }
    }

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive={"Coordenador de discursos"} />
            <section className="flex flex-wrap w-full h-full p-5 ">
                <div className="w-full h-full">
                    <div className={`flex flex-col gap-3 z-0 w-full h-full max-w-[600px] justify-center items-center bg-surface-100 p-6 md:p-8 md:justify-center md:items-center shadow-neutral-300 rounded-xl`}>
                        <h1 className="flex w-full h-10 text-lg sm:text-xl md:text-2xl text-primary-200 font-semibold">
                            Coordenador de discursos
                        </h1>
                        <DropdownObject
                            textVisible
                            title="Selecionar Publicador"
                            items={filteredPublishersMan ?? []}
                            selectedItem={filteredPublishersMan?.find(p => p.id === speakerCoordinator?.id) ?? null}
                            handleChange={item => setSpeakerCoordinator(item)}
                            labelKey="fullName"
                            border
                            full
                            emptyMessage="Nenhum publicador"
                        />

                        <div className={`flex justify-center items-center m-auto w-11/12 h-12 my-[5%]`}>
                            <Button onClick={onSubmit} className='text-typography-200'>Enviar</Button>
                        </div>
                    </div>

                </div>
            </section>
        </ContentDashboard>
    )
}

AdminSpeakerArrangement.getLayout = withProtectedLayout(["ADMIN_CONGREGATION"])

export default AdminSpeakerArrangement