import { sortArrayByProperty } from "@/functions/sortObjects"
import { IExternalTalk } from "@/types/externalTalks"
import { ICongregation, ISpeaker, ITalk } from "@/types/types"
import { externalTalkStatusMap } from "@/utils/statusMap"
import { format } from "date-fns"
import { Book, Building, Calendar, CalendarDays, Clock, MapPin } from "lucide-react"
import moment from "moment"
import { useState } from "react"
import Button from "../Button"
import CheckboxBoolean from "../CheckboxBoolean"
import Dropdown from "../Dropdown"
import DropdownObject from "../DropdownObjects"
import Input from "../Input"

interface ExternalTalkRowProps {
  date: Date
  externalTalks?: IExternalTalk[]
  speakers: ISpeaker[]
  congregations: ICongregation[]
  talks?: ITalk[]
  onAddExternalTalk: (talk: Partial<IExternalTalk>) => void
  onUpdateStatus: (externalTalk_id: string, status: IExternalTalk["status"]) => void
}

export default function ExternalTalkRow({
  date,
  talks,
  externalTalks = [],
  speakers,
  congregations,
  onAddExternalTalk,
  onUpdateStatus,
}: ExternalTalkRowProps) {
  const [newSpeakerId, setNewSpeakerId] = useState<string>("")
  const [newCongregationId, setNewCongregationId] = useState<string>("")
  const [selectedCongregation, setSelectedCongregation] = useState<ICongregation | null>(null)
  const [newTalkId, setNewTalkId] = useState<string>("")
  const [newManualTalk, setNewManualTalk] = useState<string>()
  const [manualTalkShow, setManualTalkShow] = useState<boolean>(false)
  const sortedCongregations = sortArrayByProperty(congregations, "name")

  let filteredSpeakers = speakers
  if (newTalkId) {
    filteredSpeakers = speakers.filter((s) => s.talks?.some((t) => t.id === newTalkId))
  }

  let filteredTalks = talks ?? []
  if (newSpeakerId) {
    const selectedSpeaker = speakers.find((s) => s.id === newSpeakerId)
    filteredTalks = selectedSpeaker?.talks ?? []
  }

  function handleManualTalkCheckboxChange() {
    setManualTalkShow(!manualTalkShow)
    setNewTalkId("")
    setNewManualTalk(undefined)
  }

  return (
    <div className="rounded-xl p-4 flex flex-col gap-6 bg-gray-50 border">
      {/* Data */}
      <h2 className="font-bold text-xl text-gray-800 border-b pb-2">
        {format(date, "dd/MM/yyyy")}
      </h2>

      {/* Programações existentes */}
      {externalTalks.length > 0 && (
        <div className="space-y-4">
          {externalTalks.map((t) => (
            <div
              key={t.id}
              className={`
                flex justify-between items-start p-4 rounded-lg border shadow-sm bg-white
                ${t.status === "confirmed" ? "border-l-4 border-green-500" : ""}
                ${t.status === "pending" ? "border-l-4 border-yellow-500" : ""}
                ${t.status === "canceled" ? "border-l-4 border-red-500" : ""}
              `}
            >
              {/* Detalhes */}
              <div className="flex flex-col gap-3 w-full">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="font-semibold text-lg text-gray-800">
                    {t.speaker?.fullName || t.manualTalk}
                  </span>
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                    {t.destinationCongregation.name}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-gray-400" />
                    <span>{t.destinationCongregation.dayMeetingPublic}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-gray-400" />
                    <span>{t.destinationCongregation.hourMeetingPublic}</span>
                  </div>
                  {t.talk?.title && (
                    <div className="flex items-center gap-2 col-span-2">
                      <Book size={14} className="text-gray-400" />
                      <span>{t.talk.title}</span>
                    </div>
                  )}
                  {t.talk?.number && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Nº</span>
                      <span>{t.talk.number}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Dropdown de status */}
              <div className="ml-4">
                <Dropdown
                  title="Status"
                  textVisible
                  options={Object.keys(externalTalkStatusMap)}
                  selectedItem={externalTalkStatusMap[t.status]}
                  handleClick={(option) => {
                    onUpdateStatus(t.id, option as IExternalTalk["status"])
                  }}
                  border
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Adicionar novo ExternalTalk */}
      <div className="bg-white rounded-lg p-4 shadow-md border">
        <h3 className="font-semibold text-lg text-gray-700 mb-3">
          Adicionar discurso fora
        </h3>
        <div className="flex flex-col gap-3">
          <DropdownObject
            textVisible
            title="Congregação de destino"
            items={sortedCongregations}
            selectedItem={sortedCongregations.find((c) => c.id === newCongregationId) || null}
            handleChange={(item) => {
              setNewCongregationId(item?.id || "")
              setSelectedCongregation(item)
            }}
            labelKey="name"
            labelKeySecondary="city"
            border
            full
            emptyMessage="Nenhuma congregação"
            searchable
          />

          {selectedCongregation && (
            <div className="mt-2 p-3 rounded-lg border bg-gray-50 shadow-sm">
              <h4 className="font-semibold text-gray-800 mb-2">Detalhes da congregação</h4>
              <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <Building size={14} className="text-gray-400" />
                  <span>
                    <span className="font-medium">Congregação:</span> {selectedCongregation.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-gray-400" />
                  <span>
                    <span className="font-medium">Cidade:</span> {selectedCongregation.city}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarDays size={14} className="text-gray-400" />
                  <span>
                    <span className="font-medium">Dia da reunião:</span> {selectedCongregation.dayMeetingPublic}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-gray-400" />
                  <span>
                    <span className="font-medium">Horário:</span>{" "}
                    {moment(selectedCongregation.hourMeetingPublic, "HH:mm:ss").format("HH:mm")}
                  </span>
                </div>
              </div>

            </div>
          )}

          <DropdownObject
            textVisible
            title="Orador"
            items={[{ id: "", fullName: "Nenhum" }, ...filteredSpeakers]}
            selectedItem={filteredSpeakers.find((s) => s.id === newSpeakerId) || null}
            handleChange={(item) => setNewSpeakerId(item?.id || "")}
            labelKey="fullName"
            border
            full
            emptyMessage="Nenhum orador"
            searchable
          />

          <CheckboxBoolean
            checked={manualTalkShow}
            handleCheckboxChange={handleManualTalkCheckboxChange}
            label="Tema manual"
          />

          {!manualTalkShow && (
            <DropdownObject<ITalk>
              textVisible
              title="Tema"
              items={[{ id: "", number: 0, title: "Nenhum" } as ITalk, ...filteredTalks]}
              selectedItem={
                newTalkId === ""
                  ? { id: "", number: 0, title: "Nenhum" } as ITalk
                  : filteredTalks.find((t) => t.id === newTalkId) || null
              }
              handleChange={(item) => setNewTalkId(item?.id || "")}
              labelKey="number"
              labelKeySecondary="title"
              border
              full
              emptyMessage="Nenhum tema"
              searchable
            />

          )}

          {manualTalkShow && (
            <Input
              placeholder="Tema manual"
              value={newManualTalk}
              onChange={(e) => setNewManualTalk(e.target.value)}
            />
          )}

          <Button
            className="w-full bg-primary-200 hover:bg-primary-100 "
            onClick={() => {
              if (!newSpeakerId && !newManualTalk) return
              onAddExternalTalk({
                date: moment(date).format("YYYY-MM-DD"),
                speaker: speakers.find((s) => s.id === newSpeakerId),
                manualTalk: newManualTalk,
                destinationCongregation: congregations.find((c) => c.id === newCongregationId)!,
                status: "pending",
                talk: talks?.find((t) => t.id === newTalkId),
              })
              setNewSpeakerId("")
              setNewCongregationId("")
              setNewManualTalk(undefined)
              setNewTalkId("")
            }}
          >
            Adicionar Orador Externo
          </Button>
        </div>
      </div>
    </div>
  )
}
