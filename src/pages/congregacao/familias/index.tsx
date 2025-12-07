import { crumbsAtom, pageActiveAtom } from "@/atoms/atom";
import { deleteFamilyAtom } from "@/atoms/familyAtoms";
import BreadCrumbs from "@/Components/BreadCrumbs";
import Button from "@/Components/Button";
import ContentDashboard from "@/Components/ContentDashboard";
import EmptyState from "@/Components/EmptyState";
import { ListGeneric } from "@/Components/ListGeneric";
import SkeletonFamiliesList from "@/Components/SkeletonFamilyList";
import { API_ROUTES } from "@/constants/apiRoutes";
import { useCongregationContext } from "@/context/CongregationContext";
import { useAuthorizedFetch } from "@/hooks/useFetch";
import { IFamily } from "@/types/family";
import { withProtectedLayout } from "@/utils/withProtectedLayout";
import { useAtom, useSetAtom } from "jotai";
import Router from "next/router";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

function FamiliesPage() {
    const { congregation } = useCongregationContext();
    const [crumbs] = useAtom(crumbsAtom);
    const [, setPageActive] = useAtom(pageActiveAtom);
    const [families, setFamilies] = useState<IFamily[]>();
    const setDeleteFamily = useSetAtom(deleteFamilyAtom);

    const url = congregation ? `${API_ROUTES.FAMILIES}/congregation/${congregation.id}` : "";
    const { data, mutate } = useAuthorizedFetch<IFamily[]>(url, {
        allowedRoles: ["ADMIN_CONGREGATION", "FAMILY_MANAGER"],
    });

    useEffect(() => {
        if (data) setFamilies(data);
    }, [data]);

    useEffect(() => {
        setPageActive("Famílias");
    }, [setPageActive]);

    async function handleDelete(family_id: string) {
        await toast.promise(setDeleteFamily(family_id), {
            pending: "Excluindo família..."
        }).then(() => {
            mutate();
        }).catch(err => {
            console.log(err)
        })
    }

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive="Famílias" />
            <section className="flex flex-wrap w-full h-full p-5 ">
                <div className="w-full h-full">
                    <h1 className="flex w-full h-10 text-lg sm:text-xl md:text-2xl text-primary-200 font-semibold">Famílias</h1>
                    <div className="flex justify-between items-center mb-3">
                        <Button
                            outline
                            onClick={() => Router.push("/congregacao/familias/add")}
                            className="text-primary-200 p-3 border-typography-300 hover:opacity-80"
                        >
                            Nova Família
                        </Button>
                    </div>

                    {families && families.length > 0 ? (
                        <ListGeneric
                            onDelete={(item_id) => handleDelete(item_id)}
                            onUpdate={(family) => { }}
                            items={families}
                            path="/congregacao/familias"
                            label="da família"
                            renderItem={(family) => (
                                <div className="flex flex-col gap-3 p-4 border rounded-md hover:shadow-md transition-shadow">
                                    <h3 className="text-lg font-semibold text-typography-800">Família {family.name}</h3>
                                    <div className="text-sm text-typography-700 flex flex-col gap-2">
                                        {family.responsible && (
                                            <span key={family.responsible_publisher_id} className="ml-4">{family.responsible.nickname || family.responsible.fullName}</span>
                                        )}
                                        {family.members && family.members.length > 0
                                            ? family.members.map((m) => (
                                                <span key={m.id} className="ml-4">{m.nickname || m.fullName}</span>
                                            ))
                                            : null
                                        }
                                    </div>
                                </div>
                            )}
                        />
                    ) : !families ? (
                        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5 pb-36 w-full">
                            {Array(6).fill(0).map((_, i) => <SkeletonFamiliesList key={i} />)}
                        </ul>
                    ) : (
                        <EmptyState message="Nenhuma família cadastrada!" />
                    )}
                </div>
            </section>
        </ContentDashboard>
    );
}

FamiliesPage.getLayout = withProtectedLayout(["ADMIN_CONGREGATION", "FAMILY_MANAGER"]);

export default FamiliesPage;
