import React, { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/Components/ui/popover";
import { Music, Check, Edit2 } from "lucide-react";

interface MidweekSongSelectProps {
    label: string;
    value?: number | null;
    onChange: (songNumber: number) => void;
}

const TOTAL_SONGS = 163;
const SONGS_LIST = Array.from({ length: TOTAL_SONGS }, (_, i) => i + 1);

export const MidweekSongSelect: React.FC<MidweekSongSelectProps> = ({
    label,
    value,
    onChange
}) => {
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const filteredSongs = searchTerm
        ? SONGS_LIST.filter(num => String(num).includes(searchTerm))
        : SONGS_LIST;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    className="flex flex-col items-center justify-center bg-surface-100 hover:bg-surface-300/40 py-2 px-1 rounded-lg border border-surface-300 transition-colors group cursor-pointer w-full text-center relative"
                    title={`Clique para alterar o Cântico do ${label}`}
                >
                    <span className="text-[10px] text-typography-500 font-semibold uppercase tracking-wider block text-center w-full">
                        {label}
                    </span>
                    <span className="font-bold text-xs sm:text-sm text-typography-900 mt-1 block text-center w-full truncate">
                        {value ? `Nº ${value}` : "—"}
                    </span>
                </button>
            </PopoverTrigger>

            <PopoverContent className="w-56 p-2 bg-surface-100 border border-surface-300 text-typography-900 shadow-xl z-50">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-typography-800 border-b border-surface-300 pb-1.5 px-1">
                        <Music className="h-3.5 w-3.5 text-indigo-500" />
                        <span>Selecionar Cântico ({label})</span>
                    </div>

                    <input
                        type="number"
                        min={1}
                        max={158}
                        placeholder="Nº do cântico (1-158)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-2.5 py-1 text-xs rounded border border-surface-300 bg-surface-200 text-typography-900 focus:outline-none focus:ring-1 focus:ring-primary-200"
                        autoFocus
                    />

                    <div className="max-h-48 overflow-y-auto grid grid-cols-4 gap-1 p-1">
                        {filteredSongs.map((num) => {
                            const isSelected = num === value;
                            return (
                                <button
                                    key={num}
                                    type="button"
                                    onClick={() => {
                                        onChange(num);
                                        setOpen(false);
                                        setSearchTerm("");
                                    }}
                                    className={`py-1.5 text-xs font-semibold rounded text-center transition-colors flex items-center justify-center gap-0.5 ${
                                        isSelected
                                            ? "bg-primary-200 text-white shadow-sm"
                                            : "bg-surface-200 hover:bg-surface-300 text-typography-800"
                                    }`}
                                >
                                    <span>{num}</span>
                                    {isSelected && <Check className="h-2.5 w-2.5" />}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
};
