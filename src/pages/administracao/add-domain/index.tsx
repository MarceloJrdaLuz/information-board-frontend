import { crumbsAtom, pageActiveAtom } from "@/atoms/atom";
import AccessRequestsManager from "@/Components/AccessRequestsManager";
import BreadCrumbs from "@/Components/BreadCrumbs";
import ContentDashboard from "@/Components/ContentDashboard";
import FormAddDomain from "@/Components/Forms/FormAddDomain";
import { withProtectedLayout } from "@/utils/withProtectedLayout";
import { useAtom } from "jotai";
import { KeyRound, UserCheck } from "lucide-react";
import { useEffect, useState } from "react";

function AddDomainPage() {
    const [crumbs, setCrumbs] = useAtom(crumbsAtom);
    const [, setPageActive] = useAtom(pageActiveAtom);
    const [activeTab, setActiveTab] = useState<"requests" | "manual">("requests");
    const [pendingCount, setPendingCount] = useState<number>(0);

    useEffect(() => {
        setPageActive("Adicionar ao domínio");
        setCrumbs([
            { label: "Administração", link: "/administracao" },
            { label: "Acessos ao Domínio", link: "/administracao/add-domain" },
        ]);
    }, [setPageActive, setCrumbs]);

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive={"Acessos ao Domínio"} />

            <div className="flex flex-col w-full items-center p-4 sm:p-8 max-w-6xl mx-auto gap-6">
                {/* Header da Página */}
                <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-primary-200">
                            Acessos ao Domínio da Congregação
                        </h1>
                        <p className="text-xs sm:text-sm text-typography-500 mt-1">
                            Aprove solicitações de entrada feitas pelos usuários ou vincule manualmente por código.
                        </p>
                    </div>

                    {/* Tabs Switcher */}
                    <div className="flex items-center p-1 bg-surface-200/80 rounded-2xl border border-surface-300/80 self-stretch sm:self-auto">
                        <button
                            type="button"
                            onClick={() => setActiveTab("requests")}
                            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                                activeTab === "requests"
                                    ? "bg-surface-100 text-primary-200 shadow-sm"
                                    : "text-typography-500 hover:text-typography-100"
                            }`}
                        >
                            <UserCheck className="w-4 h-4" />
                            <span>Solicitações</span>
                            {pendingCount > 0 && (
                                <span className="px-2 py-0.2 text-[11px] font-bold rounded-full bg-amber-500 text-white animate-pulse">
                                    {pendingCount}
                                </span>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab("manual")}
                            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                                activeTab === "manual"
                                    ? "bg-surface-100 text-primary-200 shadow-sm"
                                    : "text-typography-500 hover:text-typography-100"
                            }`}
                        >
                            <KeyRound className="w-4 h-4" />
                            <span>Vínculo por Código</span>
                        </button>
                    </div>
                </div>

                {/* Conteúdo da Aba */}
                <div className="w-full flex justify-center mt-2">
                    {activeTab === "requests" ? (
                        <AccessRequestsManager onPendingCountChange={setPendingCount} />
                    ) : (
                        <div className="w-full max-w-xl flex flex-col items-center">
                            <div className="w-full mb-4 p-4 rounded-2xl bg-surface-100 border border-surface-300 text-xs text-typography-500 leading-relaxed">
                                <strong className="text-typography-100">Como funciona:</strong> Informe o código de usuário de 8 caracteres para vinculá-lo diretamente à sua congregação, sem necessidade de solicitação prévia no app.
                            </div>
                            <FormAddDomain />
                        </div>
                    )}
                </div>
            </div>
        </ContentDashboard>
    );
}

AddDomainPage.getLayout = withProtectedLayout(["ADMIN", "ADMIN_CONGREGATION"]);

export default AddDomainPage;