import { useState, useRef } from "react"
import {
  Button,
  Popover,
  PopoverContent,
  PopoverHandler,
} from "@material-tailwind/react"
import { ITalk } from "@/entities/types"

interface TalksBoardProps {
  talks: ITalk[]
  onSelectionChange?: (selected: ITalk[]) => void
  initialSelected?: ITalk[]
}

export default function TalksBoard({ talks, onSelectionChange, initialSelected = [] }: TalksBoardProps) {
  // Estado dos discursos selecionados (agora com id + number)
  const [selectedTalks, setSelectedTalks] = useState<ITalk[]>(initialSelected)
  const [openTalk, setOpenTalk] = useState<string | null>(null) // usar id para popover
  const pressTimer = useRef<NodeJS.Timeout | null>(null)

  function toggleTalkSelection(talk: ITalk) {
    setSelectedTalks((prev) => {
      const newSelected = prev.some(t => t.id === talk.id)
        ? prev.filter(t => t.id !== talk.id)
        : [...prev, talk]

      // avisa o componente pai
      if (onSelectionChange) {
        onSelectionChange(newSelected)
      }

      return newSelected
    })
  }

  // Long press para abrir popover
  function handlePressStart(talk: ITalk) {
    pressTimer.current = setTimeout(() => {
      setOpenTalk(talk.id)
      pressTimer.current = null
    }, 500) // 500ms de long press
  }

  // Clique curto para seleção
  function handlePressEnd(talk: ITalk) {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current)
      pressTimer.current = null
      toggleTalkSelection(talk)
    }
  }

  return (
    <div className="flex flex-1 justify-between flex-wrap p-3 gap-3">
      {talks?.map((talk) => {
        const isSelected = selectedTalks.some((t) => t.id === talk.id)
        const isOpen = openTalk === talk.id

        return (
          <Popover
            key={talk.id}
            open={isOpen}
            handler={() => setOpenTalk(isOpen ? null : talk.id)}
          >
            <PopoverHandler
              onMouseDown={() => handlePressStart(talk)}
              onMouseUp={() => handlePressEnd(talk)}
              onMouseLeave={() => handlePressEnd(talk)}
              onTouchStart={() => handlePressStart(talk)}
              onTouchEnd={() => handlePressEnd(talk)}
            >
              <Button
                className={`cursor-pointer border rounded-lg w-10 h-10  md:w-14 md:h-14 flex items-center justify-center text-sm md:text-lg font-bold transition
                  ${isSelected
                    ? "bg-primary-200 text-white border-primary-300"
                    : "bg-white text-primary-200 border-gray-200 hover:bg-gray-50"
                  }`}
              >
                {talk.number}
              </Button>
            </PopoverHandler>

            <PopoverContent className="max-w-xs text-sm text-gray-800 bg-white shadow-lg p-3 rounded-lg">
              {talk.title}
            </PopoverContent>
          </Popover>
        )
      })}
    </div>
  )
}
