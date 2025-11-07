import { IPublisher } from "@/types/types"
import {
    List,
    ListItem,
    Popover,
    PopoverContent,
    PopoverHandler,
} from "@material-tailwind/react"
import clipboard from 'clipboard'
import { ChevronDownIcon, CopyCheck, CopyIcon } from "lucide-react"
import { useState } from "react"
import Button from "../Button"

interface IModalReportsModal {
    missingReportsNumber: number
    missingReports: IPublisher[] | undefined
}

export default function MissingReportsModal({ missingReportsNumber, missingReports }: IModalReportsModal) {
    const [copySuccess, setCopySuccess] = useState(false)
    const handleCopyToClipboard = () => {
        if (missingReports && missingReports.length > 0) {
            const dataToCopy = missingReports.map((missingReport) => missingReport.fullName).join('\n')
            clipboard.copy(dataToCopy)
            setCopySuccess(true)

            setTimeout(() => {
                setCopySuccess(false)
            }, 3000)
        }
    }

    return (
        <Popover placement="bottom-end">
            <PopoverHandler>
                <div className="flex justify-end">
                    <Button outline className="bg-transparent border-none shadow-none text-primary-200 font-bold w-48 whitespace-nowrap ">
                        {`Relatórios em falta: ${missingReportsNumber}`}
                        <ChevronDownIcon />
                    </Button>
                </div>
            </PopoverHandler>
            <PopoverContent className="w-72 bg-surface-100 text-typography-800">
                <div className="w-full flex justify-end cursor-pointer mb-2">
                    {copySuccess ? (
                        <div className="flex justify-center items-center">
                            <span className="text-success-100 text-sm pr-2">Copiado com sucesso!</span>
                            <CopyCheck className="text-success-100 p-0.5" />
                        </div>
                    ) : (
                        <CopyIcon className=" p-0.5" onClick={handleCopyToClipboard} />
                    )}
                </div>
                <List className="p-0 max-h-96 overflow-auto hide-scrollbar text-typography-800" >
                    {missingReports && missingReports.length > 0 ? missingReports.map(missingReport => (
                        <ListItem key={missingReport.id}>
                            {missingReport.fullName}
                        </ListItem>
                    )) : (
                        <ListItem key="All reports send">
                            Todos os relatórios enviados
                        </ListItem>
                    )}
                </List>
            </PopoverContent>
        </Popover>
    )
}