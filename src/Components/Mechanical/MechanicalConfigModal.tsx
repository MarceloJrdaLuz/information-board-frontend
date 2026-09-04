import { Button } from "@/Components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import { IMechanicalConfig } from "@/types/mechanical";
import { Loader2, Settings2, Sliders } from "lucide-react";
import React, { useEffect, useState } from "react";

interface MechanicalConfigModalProps {
    open: boolean;
    onClose: () => void;
    config: IMechanicalConfig | null;
    onSave: (data: Partial<IMechanicalConfig>) => Promise<void>;
    loading: boolean;
}

export const MechanicalConfigModal: React.FC<MechanicalConfigModalProps> = ({
    open,
    onClose,
    config,
    onSave,
    loading
}) => {
    const [sameTeamWholeWeek, setSameTeamWholeWeek] = useState(false);
    const [combineSoundAndMedia, setCombineSoundAndMedia] = useState(false);

    // Meio de semana / Geral
    const [midweekAttendants, setMidweekAttendants] = useState(2);
    const [midweekSound, setMidweekSound] = useState(1);
    const [midweekMedia, setMidweekMedia] = useState(1);
    const [midweekRovingMics, setMidweekRovingMics] = useState(2);
    const [midweekStageMics, setMidweekStageMics] = useState(1);

    // Fim de semana
    const [weekendAttendants, setWeekendAttendants] = useState(2);
    const [weekendSound, setWeekendSound] = useState(1);
    const [weekendMedia, setWeekendMedia] = useState(1);
    const [weekendRovingMics, setWeekendRovingMics] = useState(2);
    const [weekendStageMics, setWeekendStageMics] = useState(1);

    useEffect(() => {
        if (config) {
            setSameTeamWholeWeek(config.sameTeamWholeWeek ?? false);
            setCombineSoundAndMedia(config.combineSoundAndMedia ?? false);

            setMidweekAttendants(config.midweekAttendantsCount ?? 2);
            setMidweekSound(config.midweekSoundCount ?? 1);
            setMidweekMedia(config.midweekMediaCount ?? 1);
            setMidweekRovingMics(config.midweekRovingMicsCount ?? 2);
            setMidweekStageMics(config.midweekStageMicsCount ?? 1);

            setWeekendAttendants(config.weekendAttendantsCount ?? 2);
            setWeekendSound(config.weekendSoundCount ?? 1);
            setWeekendMedia(config.weekendMediaCount ?? 1);
            setWeekendRovingMics(config.weekendRovingMicsCount ?? 2);
            setWeekendStageMics(config.weekendStageMicsCount ?? 1);
        }
    }, [config, open]);

    const handleSave = async () => {
        const finalWeekendAttendants = sameTeamWholeWeek ? midweekAttendants : weekendAttendants;
        const finalWeekendSound = sameTeamWholeWeek ? midweekSound : weekendSound;
        const finalWeekendMedia = sameTeamWholeWeek ? midweekMedia : weekendMedia;
        const finalWeekendRovingMics = sameTeamWholeWeek ? midweekRovingMics : weekendRovingMics;
        const finalWeekendStageMics = sameTeamWholeWeek ? midweekStageMics : weekendStageMics;

        await onSave({
            sameTeamWholeWeek,
            combineSoundAndMedia,
            midweekAttendantsCount: Number(midweekAttendants),
            midweekSoundCount: Number(midweekSound),
            midweekMediaCount: Number(midweekMedia),
            midweekRovingMicsCount: Number(midweekRovingMics),
            midweekStageMicsCount: Number(midweekStageMics),
            weekendAttendantsCount: Number(finalWeekendAttendants),
            weekendSoundCount: Number(finalWeekendSound),
            weekendMediaCount: Number(finalWeekendMedia),
            weekendRovingMicsCount: Number(finalWeekendRovingMics),
            weekendStageMicsCount: Number(finalWeekendStageMics)
        });
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !loading && !isOpen && onClose()}>
            <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-2 text-primary-200">
                        <div className="p-2 bg-primary-50 dark:bg-primary-950/40 rounded-lg">
                            <Settings2 className="h-5 w-5 text-primary-200" />
                        </div>
                        <DialogTitle className="text-lg font-bold">
                            Configuração de Partes Mecânicas
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-xs text-typography-500 mt-1">
                        Defina como sua congregação organiza as funções mecânicas e a quantidade de irmãos necessária.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4 py-2">
                    {/* Toggle Mesmo Grupo a Semana Toda */}
                    <div className="flex items-center justify-between p-3.5 bg-surface-200/50 rounded-xl border border-typography-200/40">
                        <div className="flex flex-col pr-4">
                            <span className="text-sm font-semibold text-typography-800">
                                Mesmo grupo para a semana toda?
                            </span>
                            <span className="text-xs text-typography-500 mt-0.5">
                                Quando ativado, os irmãos escalados no meio de semana assumem a mesma função no fim de semana.
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                const nextVal = !sameTeamWholeWeek;
                                setSameTeamWholeWeek(nextVal);
                                if (nextVal) {
                                    // Sincroniza valores para a semana
                                    setWeekendAttendants(midweekAttendants);
                                    setWeekendSound(midweekSound);
                                    setWeekendMedia(midweekMedia);
                                    setWeekendRovingMics(midweekRovingMics);
                                    setWeekendStageMics(midweekStageMics);
                                }
                            }}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                sameTeamWholeWeek ? "bg-primary-200" : "bg-gray-300 dark:bg-zinc-700"
                            }`}
                        >
                            <span
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-surface-100 shadow ring-0 transition duration-200 ease-in-out ${
                                    sameTeamWholeWeek ? "translate-x-5" : "translate-x-0"
                                }`}
                            />
                        </button>
                    </div>

                    {/* Toggle Som e Mídias Combinados */}
                    <div className="flex items-center justify-between p-3.5 bg-surface-200/50 rounded-xl border border-typography-200/40">
                        <div className="flex flex-col pr-4">
                            <span className="text-sm font-semibold text-typography-800">
                                Unificar Som e Mídias?
                            </span>
                            <span className="text-xs text-typography-500 mt-0.5">
                                Quando ativado, uma única pessoa será designada para operar Som e Mídias juntos.
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setCombineSoundAndMedia(!combineSoundAndMedia)}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                combineSoundAndMedia ? "bg-primary-200" : "bg-gray-300 dark:bg-zinc-700"
                            }`}
                        >
                            <span
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-surface-100 shadow ring-0 transition duration-200 ease-in-out ${
                                    combineSoundAndMedia ? "translate-x-5" : "translate-x-0"
                                }`}
                            />
                        </button>
                    </div>

                    {/* CONTEÚDO: Se for o mesmo grupo na semana, exibe 1 seção unificada. Se não, exibe Meio de Semana e Fim de Semana separados */}
                    {sameTeamWholeWeek ? (
                        <div className="border border-typography-200/60 rounded-xl p-4 bg-surface-100">
                            <div className="flex items-center gap-2 mb-2">
                                <Sliders className="h-4 w-4 text-primary-200" />
                                <h4 className="text-sm font-bold text-typography-900">
                                    Quantidade de Irmãos por Função (Semana Toda)
                                </h4>
                            </div>
                            <p className="text-xs text-typography-500 mb-3">
                                Como o mesmo grupo atuará na semana toda, estas quantidades serão aplicadas tanto na reunião de meio de semana quanto no fim de semana.
                            </p>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div>
                                    <label className="text-xs text-typography-600 block mb-1 font-medium">
                                        Indicadores
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="10"
                                        value={midweekAttendants}
                                        onChange={(e) => {
                                            const val = Math.max(0, parseInt(e.target.value) || 0);
                                            setMidweekAttendants(val);
                                            setWeekendAttendants(val);
                                        }}
                                        className="w-full px-3 py-1.5 text-sm border rounded-lg bg-surface-100 border-typography-300 focus:outline-none focus:ring-1 focus:ring-primary-200"
                                    />
                                </div>

                                {combineSoundAndMedia ? (
                                    <div>
                                        <label className="text-xs text-typography-600 block mb-1 font-medium">
                                            Som e Mídias
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="5"
                                            value={midweekSound}
                                            onChange={(e) => {
                                                const val = Math.max(1, parseInt(e.target.value) || 1);
                                                setMidweekSound(val);
                                                setMidweekMedia(val);
                                                setWeekendSound(val);
                                                setWeekendMedia(val);
                                            }}
                                            className="w-full px-3 py-1.5 text-sm border rounded-lg bg-surface-100 border-typography-300 focus:outline-none focus:ring-1 focus:ring-primary-200"
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <div>
                                            <label className="text-xs text-typography-600 block mb-1 font-medium">
                                                Operador de Som
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="5"
                                                value={midweekSound}
                                                onChange={(e) => {
                                                    const val = Math.max(0, parseInt(e.target.value) || 0);
                                                    setMidweekSound(val);
                                                    setWeekendSound(val);
                                                }}
                                                className="w-full px-3 py-1.5 text-sm border rounded-lg bg-surface-100 border-typography-300 focus:outline-none focus:ring-1 focus:ring-primary-200"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-typography-600 block mb-1 font-medium">
                                                Operador de Mídia
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="5"
                                                value={midweekMedia}
                                                onChange={(e) => {
                                                    const val = Math.max(0, parseInt(e.target.value) || 0);
                                                    setMidweekMedia(val);
                                                    setWeekendMedia(val);
                                                }}
                                                className="w-full px-3 py-1.5 text-sm border rounded-lg bg-surface-100 border-typography-300 focus:outline-none focus:ring-1 focus:ring-primary-200"
                                            />
                                        </div>
                                    </>
                                )}

                                <div>
                                    <label className="text-xs text-typography-600 block mb-1 font-medium">
                                        Microfones Volantes
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="10"
                                        value={midweekRovingMics}
                                        onChange={(e) => {
                                            const val = Math.max(0, parseInt(e.target.value) || 0);
                                            setMidweekRovingMics(val);
                                            setWeekendRovingMics(val);
                                        }}
                                        className="w-full px-3 py-1.5 text-sm border rounded-lg bg-surface-100 border-typography-300 focus:outline-none focus:ring-1 focus:ring-primary-200"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-typography-600 block mb-1 font-medium">
                                        Pedestal
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="5"
                                        value={midweekStageMics}
                                        onChange={(e) => {
                                            const val = Math.max(0, parseInt(e.target.value) || 0);
                                            setMidweekStageMics(val);
                                            setWeekendStageMics(val);
                                        }}
                                        className="w-full px-3 py-1.5 text-sm border rounded-lg bg-surface-100 border-typography-300 focus:outline-none focus:ring-1 focus:ring-primary-200"
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Meio de Semana */}
                            <div className="border border-typography-200/60 rounded-xl p-4 bg-surface-100">
                                <div className="flex items-center gap-2 mb-3">
                                    <Sliders className="h-4 w-4 text-primary-200" />
                                    <h4 className="text-sm font-bold text-typography-900">
                                        Reunião de Meio de Semana
                                    </h4>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <div>
                                        <label className="text-xs text-typography-600 block mb-1 font-medium">
                                            Indicadores
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="10"
                                            value={midweekAttendants}
                                            onChange={(e) => setMidweekAttendants(Math.max(0, parseInt(e.target.value) || 0))}
                                            className="w-full px-3 py-1.5 text-sm border rounded-lg bg-surface-100 border-typography-300 focus:outline-none focus:ring-1 focus:ring-primary-200"
                                        />
                                    </div>

                                    {combineSoundAndMedia ? (
                                        <div>
                                            <label className="text-xs text-typography-600 block mb-1 font-medium">
                                                Som e Mídias
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                max="5"
                                                value={midweekSound}
                                                onChange={(e) => {
                                                    const val = Math.max(1, parseInt(e.target.value) || 1);
                                                    setMidweekSound(val);
                                                    setMidweekMedia(val);
                                                }}
                                                className="w-full px-3 py-1.5 text-sm border rounded-lg bg-surface-100 border-typography-300 focus:outline-none focus:ring-1 focus:ring-primary-200"
                                            />
                                        </div>
                                    ) : (
                                        <>
                                            <div>
                                                <label className="text-xs text-typography-600 block mb-1 font-medium">
                                                    Operador de Som
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="5"
                                                    value={midweekSound}
                                                    onChange={(e) => setMidweekSound(Math.max(0, parseInt(e.target.value) || 0))}
                                                    className="w-full px-3 py-1.5 text-sm border rounded-lg bg-surface-100 border-typography-300 focus:outline-none focus:ring-1 focus:ring-primary-200"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-typography-600 block mb-1 font-medium">
                                                    Operador de Mídia
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="5"
                                                    value={midweekMedia}
                                                    onChange={(e) => setMidweekMedia(Math.max(0, parseInt(e.target.value) || 0))}
                                                    className="w-full px-3 py-1.5 text-sm border rounded-lg bg-surface-100 border-typography-300 focus:outline-none focus:ring-1 focus:ring-primary-200"
                                                />
                                            </div>
                                        </>
                                    )}

                                    <div>
                                        <label className="text-xs text-typography-600 block mb-1 font-medium">
                                            Microfones Volantes
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="10"
                                            value={midweekRovingMics}
                                            onChange={(e) => setMidweekRovingMics(Math.max(0, parseInt(e.target.value) || 0))}
                                            className="w-full px-3 py-1.5 text-sm border rounded-lg bg-surface-100 border-typography-300 focus:outline-none focus:ring-1 focus:ring-primary-200"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs text-typography-600 block mb-1 font-medium">
                                            Pedestal
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="5"
                                            value={midweekStageMics}
                                            onChange={(e) => setMidweekStageMics(Math.max(0, parseInt(e.target.value) || 0))}
                                            className="w-full px-3 py-1.5 text-sm border rounded-lg bg-surface-100 border-typography-300 focus:outline-none focus:ring-1 focus:ring-primary-200"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Fim de Semana */}
                            <div className="border border-typography-200/60 rounded-xl p-4 bg-surface-100">
                                <div className="flex items-center gap-2 mb-3">
                                    <Sliders className="h-4 w-4 text-primary-200" />
                                    <h4 className="text-sm font-bold text-typography-900">
                                        Reunião de Fim de Semana
                                    </h4>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <div>
                                        <label className="text-xs text-typography-600 block mb-1 font-medium">
                                            Indicadores
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="10"
                                            value={weekendAttendants}
                                            onChange={(e) => setWeekendAttendants(Math.max(0, parseInt(e.target.value) || 0))}
                                            className="w-full px-3 py-1.5 text-sm border rounded-lg bg-surface-100 border-typography-300 focus:outline-none focus:ring-1 focus:ring-primary-200"
                                        />
                                    </div>

                                    {combineSoundAndMedia ? (
                                        <div>
                                            <label className="text-xs text-typography-600 block mb-1 font-medium">
                                                Som e Mídias
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                max="5"
                                                value={weekendSound}
                                                onChange={(e) => {
                                                    const val = Math.max(1, parseInt(e.target.value) || 1);
                                                    setWeekendSound(val);
                                                    setWeekendMedia(val);
                                                }}
                                                className="w-full px-3 py-1.5 text-sm border rounded-lg bg-surface-100 border-typography-300 focus:outline-none focus:ring-1 focus:ring-primary-200"
                                            />
                                        </div>
                                    ) : (
                                        <>
                                            <div>
                                                <label className="text-xs text-typography-600 block mb-1 font-medium">
                                                    Operador de Som
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="5"
                                                    value={weekendSound}
                                                    onChange={(e) => setWeekendSound(Math.max(0, parseInt(e.target.value) || 0))}
                                                    className="w-full px-3 py-1.5 text-sm border rounded-lg bg-surface-100 border-typography-300 focus:outline-none focus:ring-1 focus:ring-primary-200"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-typography-600 block mb-1 font-medium">
                                                    Operador de Mídia
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="5"
                                                    value={weekendMedia}
                                                    onChange={(e) => setWeekendMedia(Math.max(0, parseInt(e.target.value) || 0))}
                                                    className="w-full px-3 py-1.5 text-sm border rounded-lg bg-surface-100 border-typography-300 focus:outline-none focus:ring-1 focus:ring-primary-200"
                                                />
                                            </div>
                                        </>
                                    )}

                                    <div>
                                        <label className="text-xs text-typography-600 block mb-1 font-medium">
                                            Microfones Volantes
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="10"
                                            value={weekendRovingMics}
                                            onChange={(e) => setWeekendRovingMics(Math.max(0, parseInt(e.target.value) || 0))}
                                            className="w-full px-3 py-1.5 text-sm border rounded-lg bg-surface-100 border-typography-300 focus:outline-none focus:ring-1 focus:ring-primary-200"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs text-typography-600 block mb-1 font-medium">
                                            Pedestal
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="5"
                                            value={weekendStageMics}
                                            onChange={(e) => setWeekendStageMics(Math.max(0, parseInt(e.target.value) || 0))}
                                            className="w-full px-3 py-1.5 text-sm border rounded-lg bg-surface-100 border-typography-300 focus:outline-none focus:ring-1 focus:ring-primary-200"
                                        />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <DialogFooter className="gap-2 sm:gap-0 mt-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={loading}
                        className="text-typography-600"
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-primary-200 text-white hover:bg-primary-300 gap-1.5"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Salvando...
                            </>
                        ) : (
                            "Salvar Configurações"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
