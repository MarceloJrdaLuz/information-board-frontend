import { createCleaningScheduleConfigAtom, updateCleaningScheduleConfigAtom } from "@/atoms/cleaningScheduleAtoms";
import { CleaningScheduleMode, ICleaningScheduleConfig } from "@/types/cleaning";
import { useSetAtom } from "jotai";
import React, { useEffect, useState } from "react";
import { Button } from "@/Components/ui/button";
import { toast } from "react-toastify";
import { useCongregationContext } from "@/context/CongregationContext";
import { API_ROUTES } from "@/constants/apiRoutes";
import { useAuthorizedFetch } from "@/hooks/useFetch";
import { Loader2, Settings2 } from "lucide-react";

const modeOptions: { value: CleaningScheduleMode; label: string; description: string }[] = [
    {
        value: CleaningScheduleMode.WEEKLY,
        label: "Semanal",
        description: "Um único grupo responsável por toda a semana.",
    },
    {
        value: CleaningScheduleMode.MEETINGS,
        label: "Por Reuniões",
        description: "Grupos alternados para cada dia de reunião.",
    },
];

export default function CleaningScheduleConfigCard() {
    const { congregation } = useCongregationContext();
    const createCleaningScheduleConfig = useSetAtom(createCleaningScheduleConfigAtom);
    const updateCleaningScheduleConfig = useSetAtom(updateCleaningScheduleConfigAtom);

    const [config, setConfig] = useState<ICleaningScheduleConfig | null>(null);
    const [selectedMode, setSelectedMode] = useState<CleaningScheduleMode>(CleaningScheduleMode.WEEKLY);
    const [loading, setLoading] = useState(false);

    const urlConfig = congregation
        ? `${API_ROUTES.CLEANING_SCHEDULES_CONFIG}/congregation/${congregation.id}`
        : "";
    const { data: fetchedConfig } = useAuthorizedFetch<ICleaningScheduleConfig>(urlConfig, {
        allowedRoles: ["ADMIN_CONGREGATION", "CLEANING_MANAGER"],
    });

    useEffect(() => {
        if (fetchedConfig) {
            setConfig(fetchedConfig);
            setSelectedMode(fetchedConfig.mode);
        }
    }, [fetchedConfig]);

    const handleSave = async () => {
        setLoading(true);
        try {
            if (config) {
                await updateCleaningScheduleConfig(config.id, selectedMode);
                setConfig({ ...config, mode: selectedMode });
                toast.success("Configuração atualizada com sucesso!");
            } else if (congregation) {
                await createCleaningScheduleConfig(congregation.id, selectedMode);
                toast.success("Configuração salva com sucesso!");
            }
        } catch (err) {
            console.error(err);
            toast.error("Erro ao salvar configuração.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-4 p-5 bg-surface-100 rounded-2xl border border-surface-300 shadow-sm w-full">
            <div className="flex items-center gap-2 pb-3 border-b border-surface-300">
                <Settings2 className="w-5 h-5 text-primary-200" />
                <h3 className="font-bold text-base text-typography-800">
                    Modo de Distribuição
                </h3>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-semibold text-typography-600">
                    Frequência do Rodízio:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {modeOptions.map((opt) => {
                        const isSelected = selectedMode === opt.value;
                        return (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => setSelectedMode(opt.value)}
                                className={`p-3.5 text-left rounded-xl border text-xs transition-all ${
                                    isSelected
                                        ? "border-primary-200 bg-primary-200/10 text-primary-300 font-semibold shadow-sm"
                                        : "border-surface-300 hover:bg-surface-200 text-typography-600"
                                }`}
                            >
                                <div className="font-bold text-sm text-typography-800 mb-0.5">
                                    {opt.label}
                                </div>
                                <p className="text-[11px] opacity-80 leading-relaxed">
                                    {opt.description}
                                </p>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="pt-2">
                <Button
                    onClick={handleSave}
                    disabled={loading}
                    className="w-full bg-primary-200 hover:bg-primary-300 text-white rounded-xl gap-2 font-semibold shadow-sm h-10"
                >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>{loading ? "Salvando..." : "Salvar Configuração"}</span>
                </Button>
            </div>
        </div>
    );
}
