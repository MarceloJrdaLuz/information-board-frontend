import { ITalk } from "@/types/types";
import { useRef, useState } from "react";
import { Button } from "../ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover";

interface TalksBoardProps {
  talks: ITalk[];
  onSelectionChange?: (selected: ITalk[]) => void;
  initialSelected?: ITalk[];
}

export default function TalksBoard({ talks, onSelectionChange, initialSelected = [] }: TalksBoardProps) {
  const [selectedTalks, setSelectedTalks] = useState<ITalk[]>(initialSelected);
  const [openTalk, setOpenTalk] = useState<string | null>(null); // id do talk para abrir popover
  const pressTimer = useRef<NodeJS.Timeout | null>(null);

  function toggleTalkSelection(talk: ITalk) {
    setSelectedTalks((prev) => {
      const newSelected = prev.some(t => t.id === talk.id)
        ? prev.filter(t => t.id !== talk.id)
        : [...prev, talk];

      if (onSelectionChange) onSelectionChange(newSelected);
      return newSelected;
    });
  }

  function handlePressStart(talk: ITalk) {
    pressTimer.current = setTimeout(() => {
      setOpenTalk(talk.id);
      pressTimer.current = null;
    }, 500);
  }

  function handlePressEnd(talk: ITalk) {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
      toggleTalkSelection(talk);
    }
  }

  return (
    <div className="flex flex-1 justify-between flex-wrap p-3 gap-3">
      {talks?.map((talk) => {
        const isSelected = selectedTalks.some(t => t.id === talk.id);
        const isOpen = openTalk === talk.id;

        return (
          <Popover key={talk.id} open={isOpen} onOpenChange={(open) => setOpenTalk(open ? talk.id : null)}>
            <PopoverTrigger asChild>
              <Button
                onMouseDown={() => handlePressStart(talk)}
                onMouseUp={() => handlePressEnd(talk)}
                onTouchStart={() => handlePressStart(talk)}
                onTouchEnd={() => handlePressEnd(talk)}
                variant={isSelected ? "default" : "outline"}
                className={`w-12 h-12 ${isSelected ? "bg-primary-200 text-white" : ""}`}
              >
                {talk.number}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48">
              <div className="text-sm text-typography-800">{talk.title}</div>
            </PopoverContent>
          </Popover>
        );
      })}
    </div>
  );
}
