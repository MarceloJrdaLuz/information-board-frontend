import { sortArrayByProperty } from "@/functions/sortObjects";
import { ICongregation } from "@/types/types";
import { Dialog, DialogContent } from "@/Components/ui/dialog";
import * as Popover from "@radix-ui/react-popover";
import { Building2, Check, Filter, Search, X } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";

interface FilterSpeakersCongregationProps {
  handleCheckboxChange: (selectedCongregation: ICongregation | null) => void;
  onClick?: () => void;
  checkedOptions?: string;
  congregations: ICongregation[];
}

function CongregationListContent({
  searchTerm,
  setSearchTerm,
  sortedCongregations,
  filteredList,
  selectedCongregation,
  handleSelect,
  onClose,
}: {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sortedCongregations: ICongregation[];
  filteredList: ICongregation[];
  selectedCongregation: ICongregation | null;
  handleSelect: (cong: ICongregation | null) => void;
  onClose?: () => void;
}) {
  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-surface-300/80 px-1 shrink-0">
        <div className="flex items-center gap-1.5 text-xs font-bold text-typography-800">
          <Building2 className="w-4 h-4 text-primary-200" />
          <span>Filtrar por Congregação</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-typography-400">
            {sortedCongregations.length} opções
          </span>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-typography-400 hover:text-typography-700 hover:bg-surface-200 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Campo de Busca Rápida */}
      <div className="relative mb-2 shrink-0">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-typography-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar congregação ou cidade..."
          className="w-full pl-8 pr-7 py-2 text-xs rounded-xl border border-surface-300 bg-surface-200/50 text-typography-900 placeholder:text-typography-400 focus:outline-none focus:ring-1 focus:ring-primary-200 focus:bg-surface-100 transition-all"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-typography-400 hover:text-typography-700 text-xs p-1"
          >
            ✕
          </button>
        )}
      </div>

      {/* Lista de Opções com scroll discreto */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-1 discrete-scrollbar pr-0.5">
        {/* Opção "Todas as congregações" */}
        <button
          type="button"
          onClick={() => handleSelect(null)}
          className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between gap-2 cursor-pointer ${
            !selectedCongregation
              ? "bg-primary-200/10 text-primary-200 font-bold border border-primary-200/20"
              : "hover:bg-surface-200/70 text-typography-800 font-medium"
          }`}
        >
          <div className="flex flex-col min-w-0">
            <span className="text-xs">Todas as congregações</span>
            <span className="text-[10px] text-typography-400">
              Exibir todos os oradores cadastrados
            </span>
          </div>
          {!selectedCongregation && (
            <Check className="w-4 h-4 text-primary-200 shrink-0" />
          )}
        </button>

        {/* Lista de Congregações */}
        {filteredList.map((cong) => {
          const isSelected = selectedCongregation?.id === cong.id;
          const hasCityOrCircuit = cong.city || cong.circuit;

          return (
            <button
              key={cong.id}
              type="button"
              onClick={() => handleSelect(cong)}
              className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between gap-2 cursor-pointer ${
                isSelected
                  ? "bg-primary-200/10 text-primary-200 font-bold border border-primary-200/20"
                  : "hover:bg-surface-200/70 text-typography-800 font-medium"
              }`}
            >
              <div className="flex flex-col min-w-0">
                <span className="text-xs truncate font-semibold">
                  Congregação {cong.name}
                </span>
                {hasCityOrCircuit && (
                  <span className="text-[10px] text-typography-400 truncate">
                    {cong.city}
                    {cong.city && cong.circuit ? ` • ` : ""}
                    {cong.circuit}
                  </span>
                )}
              </div>
              {isSelected && (
                <Check className="w-4 h-4 text-primary-200 shrink-0" />
              )}
            </button>
          );
        })}

        {filteredList.length === 0 && (
          <div className="py-8 text-center text-xs text-typography-400">
            Nenhuma congregação encontrada para &ldquo;{searchTerm}&rdquo;.
          </div>
        )}
      </div>
    </div>
  );
}

export default function FilterSpeakersCongregation({
  handleCheckboxChange,
  checkedOptions,
  congregations,
}: FilterSpeakersCongregationProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const sortedCongregations = useMemo(
    () => sortArrayByProperty(congregations || [], "name"),
    [congregations]
  );

  const selectedCongregation = useMemo(
    () => sortedCongregations.find((c) => c.id === checkedOptions) || null,
    [sortedCongregations, checkedOptions]
  );

  const normalize = (text: string = "") =>
    text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  const filteredList = useMemo(() => {
    if (!searchTerm.trim()) return sortedCongregations;
    const term = normalize(searchTerm);
    return sortedCongregations.filter(
      (c) =>
        normalize(c.name).includes(term) ||
        normalize(c.city).includes(term) ||
        normalize(c.circuit).includes(term)
    );
  }, [sortedCongregations, searchTerm]);

  const handleSelect = (cong: ICongregation | null) => {
    handleCheckboxChange(cong);
    setOpen(false);
    setSearchTerm("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleCheckboxChange(null);
  };

  const triggerButton = (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className={`px-3 py-2 border rounded-xl flex items-center gap-1.5 text-xs font-semibold shadow-xs transition-all cursor-pointer whitespace-nowrap ${
        selectedCongregation
          ? "bg-primary-200 text-white border-primary-200 hover:bg-primary-150"
          : "text-primary-200 border-primary-200/30 hover:border-primary-200 rounded-xl hover:bg-primary-100/10"
      }`}
      title="Filtrar oradores por congregação"
    >
      {selectedCongregation ? (
        <Building2 className="w-4 h-4 text-white shrink-0" />
      ) : (
        <Filter className="w-4 h-4 shrink-0" />
      )}

      <span className="max-w-[130px] sm:max-w-[180px] truncate">
        {selectedCongregation
          ? selectedCongregation.name
          : "Congregação"}
      </span>

      {selectedCongregation && (
        <span
          onClick={handleClear}
          className="ml-0.5 p-0.5 rounded-full hover:bg-white/25 transition-colors cursor-pointer"
          title="Limpar filtro de congregação"
        >
          <X size={13} />
        </span>
      )}
    </button>
  );

  if (isMobile) {
    return (
      <>
        {triggerButton}

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="w-[calc(100vw-2rem)] max-w-md p-4 rounded-2xl bg-surface-100 border border-surface-300 max-h-[85vh] flex flex-col">
            <CongregationListContent
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              sortedCongregations={sortedCongregations}
              filteredList={filteredList}
              selectedCongregation={selectedCongregation}
              handleSelect={handleSelect}
              onClose={() => setOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        {triggerButton}
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          side="bottom"
          align="start"
          avoidCollisions={false}
          sideOffset={8}
          className="z-[70] w-88 md:w-96 bg-surface-100 border border-surface-300 text-typography-900 rounded-2xl shadow-2xl p-3 flex flex-col max-h-[350px] animate-in fade-in-0 zoom-in-95"
        >
          <CongregationListContent
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            sortedCongregations={sortedCongregations}
            filteredList={filteredList}
            selectedCongregation={selectedCongregation}
            handleSelect={handleSelect}
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
