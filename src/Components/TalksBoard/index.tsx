import { ITalk } from "@/types/types"
import {
    Button,
    Popover,
    PopoverContent,
    PopoverHandler,
} from "@material-tailwind/react"
import { useRef, useState } from "react"

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

            <Button
              onClick={() => toggleTalkSelection(talk)}
            >
              {talk.number}
            </Button>
            <Popover>
              <PopoverHandler>
                <Button>Detalhes</Button>
              </PopoverHandler>
              <PopoverContent>{talk.title}</PopoverContent>
            </Popover>
          </Popover>
        )
      })}
    </div>
  )
}
