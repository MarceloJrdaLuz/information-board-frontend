'use client';

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  forwardRef,
} from 'react';
import { createPortal } from 'react-dom';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  X,
  RotateCcw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface CalendarProps {
  /** Valor selecionado (YYYY-MM-DD ou DD/MM/YYYY ou ISO) */
  value?: string | null;
  /** Alias compatível com o componente Calendar do information-board */
  selectedDate?: string | null;
  /** Callback ao selecionar nova data ou limpar */
  onChange?: (date: string | null) => void;
  /** Alias de callback compatível com information-board */
  handleDateChange?: (date: string | null) => void;
  /** Data mínima permitida (YYYY-MM-DD) */
  minDate?: string | null;
  /** Data máxima permitida (YYYY-MM-DD) */
  maxDate?: string | null;
  /** Rótulo superior do campo */
  label?: string;
  /** Ocultar rótulo superior */
  titleHidden?: boolean;
  /** Campo desabilitado */
  disabled?: boolean;
  /** Largura 100% */
  full?: boolean;
  /** Dia da semana permitido (0 = Domingo, 1 = Segunda, ... 6 = Sábado) */
  allowedWeekday?: number;
  /** Mensagem de erro a exibir abaixo */
  error?: string | null;
  /** Exibir botão 'X' para limpar quando houver data */
  isClearable?: boolean;
  /** Texto placeholder */
  placeholder?: string;
  /** Classes CSS adicionais do contêiner */
  className?: string;
  /** Classes CSS customizadas do botão trigger */
  buttonClassName?: string;
  /** Tamanho visual do botão */
  size?: 'sm' | 'md';
}

const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

const WEEKDAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

/**
 * Normaliza qualquer formato comum de data (YYYY-MM-DD, DD/MM/YYYY, etc.) para YYYY-MM-DD
 */
function parseDateToYMD(val?: string | null): string | null {
  if (!val || typeof val !== 'string') return null;
  const clean = val.trim();
  if (!clean) return null;

  // Formato ISO: YYYY-MM-DD
  const isoMatch = clean.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
  }

  // Formato BR: DD/MM/YYYY
  const brMatch = clean.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (brMatch) {
    const day = brMatch[1].padStart(2, '0');
    const month = brMatch[2].padStart(2, '0');
    const year = brMatch[3];
    return `${year}-${month}-${day}`;
  }

  // Fallback: tentar new Date
  try {
    const d = new Date(clean);
    if (!isNaN(d.getTime())) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  } catch {}

  return null;
}

/**
 * Formata YYYY-MM-DD para DD/MM/YYYY
 */
function formatYMDToBR(ymd?: string | null): string {
  if (!ymd) return '';
  const parts = ymd.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return ymd;
}

function getTodayYMD(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const Calendar = forwardRef<HTMLDivElement, CalendarProps>(function Calendar(
  {
    value,
    selectedDate,
    onChange,
    handleDateChange,
    minDate,
    maxDate,
    label,
    titleHidden = false,
    disabled = false,
    full = true,
    allowedWeekday,
    error,
    isClearable = true,
    placeholder,
    className = '',
    buttonClassName = '',
    size = 'md',
  },
  ref
) {
  // Unifica prop value / selectedDate
  const activeDateYMD = useMemo(() => {
    return parseDateToYMD(selectedDate ?? value);
  }, [selectedDate, value]);

  const minDateYMD = useMemo(() => parseDateToYMD(minDate), [minDate]);
  const maxDateYMD = useMemo(() => parseDateToYMD(maxDate), [maxDate]);

  const emitChange = useCallback(
    (newDate: string | null) => {
      onChange?.(newDate);
      handleDateChange?.(newDate);
    },
    [onChange, handleDateChange]
  );

  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'days' | 'months' | 'years'>('days');

  // Mês e ano em exibição no calendário
  const [viewYear, setViewYear] = useState<number>(() => {
    if (activeDateYMD) {
      return parseInt(activeDateYMD.split('-')[0], 10);
    }
    return new Date().getFullYear();
  });

  const [viewMonth, setViewMonth] = useState<number>(() => {
    if (activeDateYMD) {
      return parseInt(activeDateYMD.split('-')[1], 10) - 1;
    }
    return new Date().getMonth();
  });

  // Atualiza mês/ano de visualização quando activeDateYMD mudar e estiver fechado
  useEffect(() => {
    if (!isOpen && activeDateYMD) {
      const parts = activeDateYMD.split('-').map(Number);
      setViewYear(parts[0]);
      setViewMonth(parts[1] - 1);
    }
  }, [activeDateYMD, isOpen]);

  // Se a data selecionada for anterior ao minDate, ajusta automaticamente
  useEffect(() => {
    if (activeDateYMD && minDateYMD && activeDateYMD < minDateYMD) {
      emitChange(minDateYMD);
    }
  }, [activeDateYMD, minDateYMD, emitChange]);

  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{
    top?: number;
    bottom?: number;
    left: number;
    openUp: boolean;
  } | null>(null);

  // Calcula posicionamento dinâmico na tela para não cortar dentro de modais/cards
  const updatePosition = useCallback(() => {
    if (!buttonRef.current || typeof window === 'undefined') return;
    const rect = buttonRef.current.getBoundingClientRect();
    const popoverHeight = 350;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < popoverHeight && rect.top > spaceBelow;

    let left = rect.left;
    const popoverWidth = 320;
    if (left + popoverWidth > window.innerWidth - 12) {
      left = Math.max(12, window.innerWidth - popoverWidth - 12);
    }

    if (openUp) {
      setCoords({
        bottom: window.innerHeight - rect.top + 6,
        left,
        openUp: true,
      });
    } else {
      setCoords({
        top: rect.bottom + 6,
        left,
        openUp: false,
      });
    }
  }, []);

  const handleOpen = () => {
    if (disabled) return;
    updatePosition();
    setViewMode('days');
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  // Trata clique fora e tecla Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        buttonRef.current?.contains(target) ||
        popoverRef.current?.contains(target)
      ) {
        return;
      }
      handleClose();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    const handleScrollOrResize = () => {
      updatePosition();
    };

    document.addEventListener('mousedown', handleClickOutside, true);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
    };
  }, [isOpen, updatePosition]);

  // Navegação de mês
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // Geração da grade de dias do mês
  const daysGrid = useMemo(() => {
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay(); // 0 a 6
    const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const items: Array<{
      day: number;
      month: number;
      year: number;
      ymd: string;
      isCurrentMonth: boolean;
      isDisabled: boolean;
      isToday: boolean;
      isSelected: boolean;
    }> = [];

    const todayYMD = getTodayYMD();

    // Dias do mês anterior para completar o início da semana
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const m = viewMonth === 0 ? 11 : viewMonth - 1;
      const y = viewMonth === 0 ? viewYear - 1 : viewYear;
      const ymd = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayOfWeek = new Date(y, m, d).getDay();

      const isDisabled =
        (minDateYMD ? ymd < minDateYMD : false) ||
        (maxDateYMD ? ymd > maxDateYMD : false) ||
        (allowedWeekday !== undefined ? dayOfWeek !== allowedWeekday : false);

      items.push({
        day: d,
        month: m,
        year: y,
        ymd,
        isCurrentMonth: false,
        isDisabled,
        isToday: ymd === todayYMD,
        isSelected: ymd === activeDateYMD,
      });
    }

    // Dias do mês atual
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const ymd = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayOfWeek = new Date(viewYear, viewMonth, d).getDay();

      const isDisabled =
        (minDateYMD ? ymd < minDateYMD : false) ||
        (maxDateYMD ? ymd > maxDateYMD : false) ||
        (allowedWeekday !== undefined ? dayOfWeek !== allowedWeekday : false);

      items.push({
        day: d,
        month: viewMonth,
        year: viewYear,
        ymd,
        isCurrentMonth: true,
        isDisabled,
        isToday: ymd === todayYMD,
        isSelected: ymd === activeDateYMD,
      });
    }

    // Dias do próximo mês para completar 35 ou 42 células (5 ou 6 semanas)
    const totalCells = items.length <= 35 ? 35 : 42;
    const remaining = totalCells - items.length;
    for (let d = 1; d <= remaining; d++) {
      const m = viewMonth === 11 ? 0 : viewMonth + 1;
      const y = viewMonth === 11 ? viewYear + 1 : viewYear;
      const ymd = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayOfWeek = new Date(y, m, d).getDay();

      const isDisabled =
        (minDateYMD ? ymd < minDateYMD : false) ||
        (maxDateYMD ? ymd > maxDateYMD : false) ||
        (allowedWeekday !== undefined ? dayOfWeek !== allowedWeekday : false);

      items.push({
        day: d,
        month: m,
        year: y,
        ymd,
        isCurrentMonth: false,
        isDisabled,
        isToday: ymd === todayYMD,
        isSelected: ymd === activeDateYMD,
      });
    }

    return items;
  }, [viewYear, viewMonth, minDateYMD, maxDateYMD, allowedWeekday, activeDateYMD]);

  const handleSelectDay = (ymd: string, isDisabled: boolean) => {
    if (isDisabled) return;
    emitChange(ymd);
    handleClose();
  };

  const handleSelectToday = () => {
    const today = getTodayYMD();
    const todayDate = new Date();
    const dayOfWeek = todayDate.getDay();

    const isDisabled =
      (minDateYMD ? today < minDateYMD : false) ||
      (maxDateYMD ? today > maxDateYMD : false) ||
      (allowedWeekday !== undefined ? dayOfWeek !== allowedWeekday : false);

    if (!isDisabled) {
      emitChange(today);
      setViewYear(todayDate.getFullYear());
      setViewMonth(todayDate.getMonth());
      handleClose();
    }
  };

  const handleClear = () => {
    emitChange(null);
  };

  // Anos disponíveis para seleção (ano atual - 100 até ano atual + 10)
  const currentYear = new Date().getFullYear();
  const yearOptions = useMemo(() => {
    const years: number[] = [];
    for (let y = currentYear + 10; y >= currentYear - 100; y--) {
      years.push(y);
    }
    return years;
  }, [currentYear]);

  const displayDateText = activeDateYMD ? formatYMDToBR(activeDateYMD) : '';
  const placeholderText = placeholder || (titleHidden && label ? label : 'Selecione uma data');

  return (
    <div
      ref={containerRef}
      className={`relative ${full ? 'w-full' : 'inline-block'} ${className}`}
    >
      {/* Rótulo superior */}
      {!titleHidden && label && (
        <label className="block mb-2 text-xs font-semibold uppercase tracking-wider text-typography-600">
          {label}
        </label>
      )}

      {/* Botão Trigger */}
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={handleOpen}
        className={`group flex items-center justify-between gap-3 px-4 py-2.5 w-full min-w-0 border text-sm rounded-xl font-medium shadow-xs transition-all outline-none ${
          disabled
            ? 'bg-surface-200/50 text-typography-400 border-surface-300 cursor-not-allowed opacity-60'
            : error
            ? 'border-red-500 text-red-500 bg-surface-100 cursor-pointer focus:ring-2 focus:ring-red-500/20'
            : isOpen
            ? 'bg-surface-100 text-typography-800 border-primary-200 ring-2 ring-primary-200/20'
            : 'bg-surface-100 text-typography-800 border-surface-300 hover:border-primary-200/80 cursor-pointer focus:ring-2 focus:ring-primary-200/20'
        } ${buttonClassName}`}
      >
        <span
          className={`truncate select-none ${
            error
              ? 'text-red-500 font-semibold'
              : displayDateText
              ? 'text-typography-800 font-semibold'
              : 'text-typography-500 font-normal'
          }`}
        >
          {displayDateText || placeholderText}
        </span>

        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
          {isClearable && Boolean(displayDateText) && !disabled && (
            <span
              role="button"
              title="Limpar data"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="p-0.5 rounded-md text-typography-400 hover:text-rose-500 hover:bg-surface-200 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </span>
          )}

          <CalendarIcon
            className={`w-4 h-4 shrink-0 transition-colors ${
              error
                ? 'text-red-500'
                : isOpen
                ? 'text-primary-200'
                : 'text-typography-400 group-hover:text-primary-200'
            }`}
          />
        </div>
      </button>

      {/* Mensagem de Erro */}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}

      {/* Popover em Portal */}
      {typeof window !== 'undefined' &&
        isOpen &&
        coords &&
        createPortal(
          <AnimatePresence>
            <motion.div
              ref={popoverRef}
              initial={{ opacity: 0, scale: 0.95, y: coords.openUp ? 6 : -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: coords.openUp ? 6 : -6 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              style={{
                position: 'fixed',
                top: coords.top !== undefined ? `${coords.top}px` : undefined,
                bottom:
                  coords.bottom !== undefined ? `${coords.bottom}px` : undefined,
                left: `${coords.left}px`,
                zIndex: 99999,
                width: '320px',
                maxWidth: 'calc(100vw - 24px)',
              }}
              className="bg-surface-100 border border-surface-300 rounded-2xl shadow-2xl p-3.5 pt-4 select-none font-sans text-typography-900 overflow-hidden relative"
            >
              {/* Linha de destaque na cor primária no topo do cartão */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-200/50 via-primary-200 to-primary-200/50" />

              {/* Cabeçalho do Calendário */}
              <div className="flex items-center justify-between gap-1 mb-2.5 pb-2 border-b border-surface-300/60">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  title="Mês anterior"
                  className="p-1.5 rounded-xl text-typography-500 hover:text-typography-900 hover:bg-surface-200 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setViewMode((curr) => (curr === 'months' ? 'days' : 'months'))
                    }
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      viewMode === 'months'
                        ? 'bg-primary-200/15 text-primary-200 border border-primary-200/30'
                        : 'text-typography-900 hover:bg-surface-200'
                    }`}
                  >
                    {MONTH_NAMES[viewMonth]}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setViewMode((curr) => (curr === 'years' ? 'days' : 'years'))
                    }
                    className={`px-2 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      viewMode === 'years'
                        ? 'bg-primary-200/15 text-primary-200 border border-primary-200/30'
                        : 'text-typography-900 hover:bg-surface-200'
                    }`}
                  >
                    {viewYear}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleNextMonth}
                  title="Próximo mês"
                  className="p-1.5 rounded-xl text-typography-500 hover:text-typography-900 hover:bg-surface-200 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Modo: Seletor de Meses */}
              {viewMode === 'months' && (
                <div className="grid grid-cols-3 gap-1.5 p-1 max-h-[220px] overflow-y-auto thin-scrollbar">
                  {MONTH_NAMES.map((name, idx) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => {
                        setViewMonth(idx);
                        setViewMode('days');
                      }}
                      className={`py-2 px-1 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                        idx === viewMonth
                          ? 'bg-primary-200 text-white shadow-xs'
                          : 'text-typography-700 hover:bg-surface-200 hover:text-typography-900'
                      }`}
                    >
                      {name.slice(0, 3)}
                    </button>
                  ))}
                </div>
              )}

              {/* Modo: Seletor de Anos */}
              {viewMode === 'years' && (
                <div className="grid grid-cols-4 gap-1.5 p-1 max-h-[220px] overflow-y-auto thin-scrollbar">
                  {yearOptions.map((y) => (
                    <button
                      key={y}
                      type="button"
                      onClick={() => {
                        setViewYear(y);
                        setViewMode('days');
                      }}
                      className={`py-2 px-1 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                        y === viewYear
                          ? 'bg-primary-200 text-white shadow-xs'
                          : 'text-typography-700 hover:bg-surface-200 hover:text-typography-900'
                      }`}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              )}

              {/* Modo: Grade de Dias */}
              {viewMode === 'days' && (
                <div>
                  {/* Dias da Semana */}
                  <div className="grid grid-cols-7 gap-1 text-center mb-1">
                    {WEEKDAY_NAMES.map((w, idx) => (
                      <span
                        key={w}
                        className={`text-[10px] font-bold uppercase py-1 ${
                          idx === 0 || idx === 6
                            ? 'text-typography-400'
                            : 'text-typography-500'
                        }`}
                      >
                        {w}
                      </span>
                    ))}
                  </div>

                  {/* Dias */}
                  <div className="grid grid-cols-7 gap-1">
                    {daysGrid.map((item, idx) => {
                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={item.isDisabled}
                          onClick={() => handleSelectDay(item.ymd, item.isDisabled)}
                          className={`h-8 w-full rounded-xl flex items-center justify-center text-xs font-semibold transition-all relative ${
                            item.isSelected
                              ? 'bg-primary-200 text-white font-bold shadow-xs scale-102 ring-2 ring-primary-200/40 z-1 cursor-pointer'
                              : item.isDisabled
                              ? 'text-typography-400/60 dark:text-typography-600 cursor-not-allowed select-none'
                              : item.isCurrentMonth
                              ? 'text-typography-800 hover:bg-surface-200 hover:text-typography-900 font-medium cursor-pointer'
                              : 'text-typography-400 hover:bg-surface-200/50 cursor-pointer'
                          } ${
                            item.isToday && !item.isSelected && !item.isDisabled
                              ? 'border border-primary-200/60 font-bold text-primary-200'
                              : ''
                          }`}
                        >
                          <span>{item.day}</span>
                          {item.isToday && !item.isSelected && !item.isDisabled && (
                            <span className="absolute bottom-1 w-1 h-1 rounded-full bg-primary-200" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Rodapé: Ações Rápidas */}
              <div className="flex items-center justify-between gap-2 pt-2.5 mt-2.5 border-t border-surface-300/60 text-xs">
                <button
                  type="button"
                  onClick={handleSelectToday}
                  className="px-2.5 py-1 rounded-xl text-primary-200 hover:bg-primary-200/10 font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  Hoje
                </button>

                <div className="flex items-center gap-1">
                  {isClearable && Boolean(activeDateYMD) && (
                    <button
                      type="button"
                      onClick={() => {
                        handleClear();
                        handleClose();
                      }}
                      className="px-2.5 py-1 rounded-xl text-typography-400 hover:text-rose-500 hover:bg-rose-500/10 font-bold transition-colors cursor-pointer"
                    >
                      Limpar
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-3 py-1 rounded-xl bg-surface-200 text-typography-700 hover:text-typography-900 hover:bg-surface-300 font-bold transition-colors cursor-pointer"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
});

export default Calendar;
