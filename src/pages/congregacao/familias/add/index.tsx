import BreadCrumbs from "@/Components/BreadCrumbs";
import ContentDashboard from "@/Components/ContentDashboard";
import FormAddFamily from "@/Components/Forms/FormAddFamily";
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom";
import { withProtectedLayout } from "@/utils/withProtectedLayout";
import { useAtom } from "jotai";
import { useEffect } from "react";

function AddFamilyPage() {
    const [crumbs, setCrumbs] = useAtom(crumbsAtom);
    const [, setPageActive] = useAtom(pageActiveAtom);

    useEffect(() => {
        setPageActive("Adicionar Família");
        setCrumbs([
            { label: "Início", link: "/dashboard" },
            { label: "Famílias", link: "/congregacao/familias" }
        ]);
    }, [setCrumbs, setPageActive]);

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive="Adicionar Família" />
            <section className="flex m-10 justify-center items-center">
                <FormAddFamily />
            </section>
        </ContentDashboard>
    );
}

AddFamilyPage.getLayout = withProtectedLayout(["ADMIN_CONGREGATION", "FAMILY_MANAGER"]);

export default AddFamilyPage;
