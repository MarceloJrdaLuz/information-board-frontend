import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import { api } from "@/services/api";
import {
  ArrowLeft,
  Building2,
  Check,
  ChevronDown,
  ChevronUp,
  Download,
  Info,
  Loader2,
  Phone,
  Search,
  Sparkles,
  Users
} from "lucide-react";
import React, { useState } from "react";
import { toast } from "react-toastify";

interface SpeakerTalk {
  id: string;
  number: number;
  title: string;
}

interface SpeakerPreview {
  id: string;
  fullName: string;
  phone?: string;
  address?: string;
  talksCount: number;
  talks: SpeakerTalk[];
  alreadyExistsInMyList?: boolean;
}

interface CongregationGroupPreview {
  groupKey: string;
  congregationName: string;
  city?: string;
  circuit?: string;
  number?: string;
  isSource: boolean;
  isTargetLocal: boolean;
  alreadyExists?: boolean;
  speakers: SpeakerPreview[];
}

interface PreviewResponse {
  token: string;
  expires_at: string;
  sourceCongregation: {
    id: string;
    name: string;
    city?: string;
    circuit?: string;
  };
  userCongregation: {
    id: string;
    name: string;
    city?: string;
  };
  groups: CongregationGroupPreview[];
}

interface SpeakerImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SpeakerImportModal({
  isOpen,
  onClose,
  onSuccess,
}: SpeakerImportModalProps) {
  const [pin, setPin] = useState("");
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewResponse | null>(null);

  // Seleções do usuário
  const [selectedGroupKeys, setSelectedGroupKeys] = useState<Set<string>>(new Set());
  const [selectedSpeakerIds, setSelectedSpeakerIds] = useState<Set<string>>(new Set());
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [expandedSpeakers, setExpandedSpeakers] = useState<Set<string>>(new Set());

  const [importing, setImporting] = useState(false);

  const resetState = () => {
    setPin("");
    setPreviewData(null);
    setSelectedGroupKeys(new Set());
    setSelectedSpeakerIds(new Set());
    setExpandedGroups(new Set());
    setExpandedSpeakers(new Set());
    setImporting(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleFetchPreview = async () => {
    const cleanPin = pin.trim().toUpperCase();
    if (!cleanPin) {
      toast.warning("Digite o código PIN de 6 dígitos.");
      return;
    }

    setLoadingPreview(true);
    try {
      const res = await api.get(`/speakers/share/preview/${cleanPin}`);
      const data: PreviewResponse = res.data;
      setPreviewData(data);

      // Por padrão, seleciona todos os grupos e oradores
      const allGroupKeys = new Set<string>();
      const allSpeakerIds = new Set<string>();
      const defaultExpanded = new Set<string>();

      data.groups.forEach((g) => {
        allGroupKeys.add(g.groupKey);
        defaultExpanded.add(g.groupKey); // Abre todos os grupos para visualização inicial
        g.speakers.forEach((s) => allSpeakerIds.add(s.id));
      });

      setSelectedGroupKeys(allGroupKeys);
      setSelectedSpeakerIds(allSpeakerIds);
      setExpandedGroups(defaultExpanded);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Código não encontrado ou expirado.");
    } finally {
      setLoadingPreview(false);
    }
  };

  const toggleGroupSelection = (group: CongregationGroupPreview) => {
    const nextGroupKeys = new Set(selectedGroupKeys);
    const nextSpeakerIds = new Set(selectedSpeakerIds);

    const isCurrentlySelected = nextGroupKeys.has(group.groupKey);

    if (isCurrentlySelected) {
      nextGroupKeys.delete(group.groupKey);
      group.speakers.forEach((s) => nextSpeakerIds.delete(s.id));
    } else {
      nextGroupKeys.add(group.groupKey);
      group.speakers.forEach((s) => nextSpeakerIds.add(s.id));
    }

    setSelectedGroupKeys(nextGroupKeys);
    setSelectedSpeakerIds(nextSpeakerIds);
  };

  const toggleSpeakerSelection = (groupKey: string, speakerId: string) => {
    const nextSpeakerIds = new Set(selectedSpeakerIds);
    if (nextSpeakerIds.has(speakerId)) {
      nextSpeakerIds.delete(speakerId);
    } else {
      nextSpeakerIds.add(speakerId);
    }

    // Se pelo menos um orador estiver selecionado, mantém o grupo selecionado
    const nextGroupKeys = new Set(selectedGroupKeys);
    const group = previewData?.groups.find((g) => g.groupKey === groupKey);
    if (group) {
      const hasAny = group.speakers.some((s) => nextSpeakerIds.has(s.id));
      if (hasAny) {
        nextGroupKeys.add(groupKey);
      } else {
        nextGroupKeys.delete(groupKey);
      }
    }

    setSelectedGroupKeys(nextGroupKeys);
    setSelectedSpeakerIds(nextSpeakerIds);
  };

  const toggleGroupExpand = (groupKey: string) => {
    const next = new Set(expandedGroups);
    if (next.has(groupKey)) next.delete(groupKey);
    else next.add(groupKey);
    setExpandedGroups(next);
  };

  const toggleSpeakerExpand = (speakerId: string) => {
    const next = new Set(expandedSpeakers);
    if (next.has(speakerId)) next.delete(speakerId);
    else next.add(speakerId);
    setExpandedSpeakers(next);
  };

  const handleConfirmImport = async () => {
    if (!previewData) return;
    if (selectedGroupKeys.size === 0 || selectedSpeakerIds.size === 0) {
      toast.warning("Selecione pelo menos um orador para importar.");
      return;
    }

    setImporting(true);
    try {
      const res = await api.post("/speakers/share/import", {
        token: previewData.token,
        selectedGroupKeys: Array.from(selectedGroupKeys),
        selectedSpeakerIds: Array.from(selectedSpeakerIds),
      });

      const { importedCongregationsCount, importedSpeakersCount, updatedSpeakersCount } = res.data;

      toast.success(
        `Importação concluída com sucesso! ${importedSpeakersCount} orador(es) adicionado(s)` +
          (importedCongregationsCount > 0 ? ` e ${importedCongregationsCount} congregação(ões)` : "") +
          (updatedSpeakersCount > 0 ? ` (${updatedSpeakersCount} atualizados)` : "") +
          "."
      );

      onSuccess();
      handleClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Erro ao realizar importação.");
    } finally {
      setImporting(false);
    }
  };

  const totalSelectedSpeakers = selectedSpeakerIds.size;
  const totalSelectedGroups = selectedGroupKeys.size;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl bg-surface-100 border border-surface-300 text-typography-900 rounded-2xl p-4 sm:p-6 shadow-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex flex-col gap-1 shrink-0">
          <div className="flex items-center gap-2 text-primary-200 font-bold text-xs uppercase tracking-wider">
            <Download size={16} />
            <span>Importação entre Congregações</span>
          </div>
          <DialogTitle className="text-xl font-extrabold text-typography-900 tracking-tight">
            Importar Arranjo de Oradores
          </DialogTitle>
          <DialogDescription className="text-xs text-typography-500">
            Digite o código PIN fornecido pela congregação vizinha para trazer a lista de oradores e temas cadastrados.
          </DialogDescription>
        </DialogHeader>

        {/* ETAPA 1: DIGITAÇÃO DO PIN */}
        {!previewData ? (
          <div className="my-6 flex flex-col items-center justify-center gap-5">
            <div className="w-full max-w-sm flex flex-col gap-2">
              <label className="text-xs font-semibold text-typography-700">
                Código PIN de Compartilhamento (6 dígitos)
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={10}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.toUpperCase())}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleFetchPreview();
                  }}
                  placeholder="Ex: 849201"
                  autoFocus
                  className="w-full py-3.5 px-4 text-center tracking-widest text-2xl font-mono font-bold rounded-xl bg-surface-200 border-2 border-surface-300 focus:border-primary-200 text-typography-900 focus:outline-none transition-all placeholder:text-typography-400 placeholder:text-base placeholder:tracking-normal"
                />
              </div>
              <span className="text-[11px] text-typography-500 text-center">
                Peça o código ao coordenador da congregação que já cadastrou os dados.
              </span>
            </div>

            <button
              type="button"
              onClick={handleFetchPreview}
              disabled={loadingPreview || !pin.trim()}
              className="w-full max-w-sm py-3 px-5 rounded-xl bg-primary-200 hover:bg-primary-150 active:scale-98 text-white font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loadingPreview ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Consultando dados...</span>
                </>
              ) : (
                <>
                  <Search size={18} />
                  <span>Buscar Dados</span>
                </>
              )}
            </button>
          </div>
        ) : (
          /* ETAPA 2: PRÉVIA E SELEÇÃO INTELIGENTE */
          <div className="flex-1 min-h-0 flex flex-col gap-3 my-2 overflow-hidden">
            {/* Banner Informativo da Congregação de Origem */}
            <div className="p-3.5 rounded-xl bg-primary-200/10 border border-primary-200/20 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-primary-200 text-white">
                  <Building2 size={16} />
                </div>
                <div>
                  <div className="font-bold text-typography-900 text-sm">
                    Origem: Congregação {previewData.sourceCongregation.name}
                  </div>
                  <div className="text-typography-500 text-[11px]">
                    {previewData.sourceCongregation.city || "Cidade não informada"}
                    {previewData.sourceCongregation.circuit
                      ? ` • Circuito ${previewData.sourceCongregation.circuit}`
                      : ""}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPreviewData(null)}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary-200 hover:underline self-end sm:self-center"
              >
                <ArrowLeft size={13} />
                <span>Trocar código</span>
              </button>
            </div>

            {/* Lista com scroll dos Grupos de Congregações e Oradores */}
            <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-1 thin-scrollbar">
              {previewData.groups.map((group) => {
                const isGroupSelected = selectedGroupKeys.has(group.groupKey);
                const isExpanded = expandedGroups.has(group.groupKey);
                const selectedInThisGroup = group.speakers.filter((s) =>
                  selectedSpeakerIds.has(s.id)
                ).length;

                return (
                  <div
                    key={group.groupKey}
                    className={`rounded-2xl border transition-all overflow-hidden ${
                      group.isTargetLocal
                        ? "border-emerald-500/40 bg-emerald-500/5 dark:bg-emerald-950/10"
                        : group.isSource
                        ? "border-primary-200/40 bg-primary-200/5 dark:bg-primary-950/10"
                        : "border-surface-300 bg-surface-200/40"
                    }`}
                  >
                    {/* Header do Card da Congregação */}
                    <div className="p-3.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <input
                          type="checkbox"
                          checked={isGroupSelected}
                          onChange={() => toggleGroupSelection(group)}
                          className="w-4 h-4 rounded text-primary-200 focus:ring-primary-200 border-surface-300 cursor-pointer"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-typography-900 truncate">
                              Congregação {group.congregationName}
                            </span>

                            {/* Badge Inteligente de Papel */}
                            {group.isTargetLocal ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white flex items-center gap-1 shadow-2xs">
                                <Sparkles size={11} />
                                <span>Sua Congregação (Local)</span>
                              </span>
                            ) : group.isSource ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-200 text-white flex items-center gap-1 shadow-2xs">
                                <Building2 size={11} />
                                <span>Visitante (Exportador)</span>
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-surface-300 text-typography-700">
                                Auxiliar
                              </span>
                            )}

                            {group.alreadyExists && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300">
                                Já na sua lista (apenas novos oradores)
                              </span>
                            )}
                          </div>

                          <div className="text-[11px] text-typography-500 flex items-center gap-2 mt-0.5">
                            <span>
                              {group.city || "Sem cidade"}
                              {group.circuit ? ` • ${group.circuit}` : ""}
                            </span>
                            <span>•</span>
                            <span className="font-medium">
                              {selectedInThisGroup} de {group.speakers.length} orador(es) selecionado(s)
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleGroupExpand(group.groupKey)}
                        className="p-1.5 rounded-lg hover:bg-surface-300/60 text-typography-500 transition cursor-pointer"
                        title={isExpanded ? "Recolher" : "Expandir"}
                      >
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                    </div>

                    {/* Explicação de Inversão de Papel para a Congregação Local */}
                    {group.isTargetLocal && (
                      <div className="mx-3.5 mb-2.5 p-2 rounded-lg bg-emerald-600/10 border border-emerald-600/20 text-emerald-800 dark:text-emerald-300 text-[11px] flex items-center gap-2">
                        <Info size={14} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
                        <span>
                          Estes oradores pertencem à sua própria congregação e serão adicionados como seus oradores locais!
                        </span>
                      </div>
                    )}

                    {/* Lista dos Oradores do Grupo */}
                    {isExpanded && (
                      <div className="border-t border-surface-300/60 divide-y divide-surface-300/50 bg-surface-100/70">
                        {group.speakers.map((spk) => {
                          const isSpeakerSelected = selectedSpeakerIds.has(spk.id);
                          const isTalksExpanded = expandedSpeakers.has(spk.id);

                          return (
                            <div key={spk.id} className="p-3 pl-8 flex flex-col gap-1.5 text-xs">
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <input
                                    type="checkbox"
                                    checked={isSpeakerSelected}
                                    onChange={() =>
                                      toggleSpeakerSelection(group.groupKey, spk.id)
                                    }
                                    className="w-3.5 h-3.5 rounded text-primary-200 focus:ring-primary-200 border-surface-300 cursor-pointer"
                                  />
                                  <span className="font-bold text-typography-900 truncate">
                                    {spk.fullName}
                                  </span>

                                  {spk.alreadyExistsInMyList && (
                                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 font-medium border border-amber-500/20">
                                      Nome já existente
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  {spk.phone && (
                                    <span className="text-[11px] text-typography-500 hidden sm:inline-flex items-center gap-1">
                                      <Phone size={11} />
                                      <span>{spk.phone}</span>
                                    </span>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => toggleSpeakerExpand(spk.id)}
                                    className="px-2 py-0.5 rounded-lg bg-surface-200 hover:bg-surface-300 text-typography-700 font-medium text-[11px] transition flex items-center gap-1 cursor-pointer"
                                  >
                                    <span>{spk.talksCount} tema(s)</span>
                                    {isTalksExpanded ? (
                                      <ChevronUp size={12} />
                                    ) : (
                                      <ChevronDown size={12} />
                                    )}
                                  </button>
                                </div>
                              </div>

                              {/* Lista de Temas Expandida */}
                              {isTalksExpanded && spk.talks.length > 0 && (
                                <div className="mt-1.5 p-2 rounded-xl bg-surface-200/60 border border-surface-300/60 space-y-1">
                                  {spk.talks.map((talk) => (
                                    <div
                                      key={talk.id}
                                      className="flex items-start gap-1.5 text-[11px] text-typography-700"
                                    >
                                      <span className="font-mono font-bold text-primary-200 shrink-0">
                                        Nº {talk.number}:
                                      </span>
                                      <span className="line-clamp-1">{talk.title}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Rodapé da Etapa 2 */}
            <div className="pt-3 border-t border-surface-300 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="text-xs text-typography-600 text-center sm:text-left">
                Selecionados:{" "}
                <strong className="text-primary-200">{totalSelectedGroups}</strong> congregação(ões) e{" "}
                <strong className="text-primary-200">{totalSelectedSpeakers}</strong> orador(es).
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={importing}
                  className="px-4 py-2 rounded-xl border border-surface-300 hover:bg-surface-200 text-typography-600 text-xs font-semibold transition cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleConfirmImport}
                  disabled={importing || totalSelectedSpeakers === 0}
                  className="px-5 py-2 rounded-xl bg-primary-200 hover:bg-primary-150 active:scale-98 text-white font-semibold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {importing ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Importando dados...</span>
                    </>
                  ) : (
                    <>
                      <Check size={15} />
                      <span>Confirmar Importação</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
