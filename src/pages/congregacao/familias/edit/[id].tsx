import BreadCrumbs from "@/Components/BreadCrumbs";
import ContentDashboard from "@/Components/ContentDashboard";
import FormEditFamily from "@/Components/Forms/FormEditFamily";
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom";
import { withProtectedLayout } from "@/utils/withProtectedLayout";
import { useAtom } from "jotai";
import { useRouter } from "next/router";
import { useEffect } from "react";

function EditFamilyPage() {
    const [crumbs, setCrumbs] = useAtom(crumbsAtom);
    const [, setPageActive] = useAtom(pageActiveAtom);

    const router = useRouter();
    const { id: family_id } = router.query;

    useEffect(() => {
        setPageActive("Editar Família");
        setCrumbs([
            { label: "Início", link: "/dashboard" },
            { label: "Famílias", link: "/congregacao/familias" }
        ]);
    }, [setCrumbs, setPageActive]);

    if (!family_id) return null;

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive="Editar Família" />
            <section className="flex m-10 justify-center items-center">
                <FormEditFamily family_id={String(family_id)} />
            </section>
        </ContentDashboard>
    );
}

EditFamilyPage.getLayout = withProtectedLayout(["ADMIN_CONGREGATION", "FAMILY_MANAGER"]);

export default EditFamilyPage;
