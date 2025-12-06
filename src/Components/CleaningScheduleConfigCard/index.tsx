import { createCleaningScheduleConfigAtom, updateCleaningScheduleConfigAtom } from "@/atoms/cleaningScheduleAtoms";
import { CleaningScheduleMode, ICleaningScheduleConfig } from "@/types/cleaning";
import { useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import Dropdown from "../Dropdown";
import Button from "../Button";
import { toast } from "react-toastify";
import { useCongregationContext } from "@/context/CongregationContext";
import { API_ROUTES } from "@/constants/apiRoutes";
import { useAuthorizedFetch } from "@/hooks/useFetch";


const modeOptions: { value: CleaningScheduleMode; label: string }[] = [
    { value: CleaningScheduleMode.WEEKLY, label: "Semanal" },
    { value: CleaningScheduleMode.MEETINGS, label: "Por Reuniões" }
];

export default function CleaningScheduleConfigCard() {
    const { congregation } = useCongregationContext();
    const createCleaningScheduleConfig = useSetAtom(createCleaningScheduleConfigAtom)
    const updateCleaningScheduleConfig = useSetAtom(updateCleaningScheduleConfigAtom)

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
        if (config) {
            // update existente
            await toast.promise(
                updateCleaningScheduleConfig(config.id, selectedMode),
                { pending: "Atualizando configuração..." }
            );
            setConfig({ ...config, mode: selectedMode });
        } else {
            if (congregation)
                // criar nova config
                await toast.promise(
                    createCleaningScheduleConfig(congregation.id, selectedMode),
                    { pending: "Criando configuração..." }
                );
        }
    }


    const [config, setConfig] = useState<ICleaningScheduleConfig | null>(null);
    const [selectedMode, setSelectedMode] = useState<CleaningScheduleMode>(CleaningScheduleMode.WEEKLY);

    return (
        <div className="flex flex-col w-full max-w-[400px] m-4 p-5 gap-4 bg-surface-100 rounded-md shadow">
            <h3 className="font-semibold mb-2 text-typography-700">Configuração da Programação</h3>
            <div className="m-3">
                <Dropdown
                    selectedItem={modeOptions.find(opt => opt.value === selectedMode)?.label || ""}
                    full
                    border
                    textVisible
                    handleClick={(label) => {
                        const option = modeOptions.find(opt => opt.label === label);
                        if (option) setSelectedMode(option.value);
                    }}
                    title="Tipo da programação"
                    options={modeOptions.map(opt => opt.label)}
                />
            </div>
            <Button className="w-full text-typography-200" onClick={handleSave}>
                Salvar Configuração
            </Button>
        </div >
    )
}