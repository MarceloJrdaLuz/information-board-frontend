import {
    Popover,
    PopoverHandler,
    PopoverContent,
    List,
    ListItem,
} from "@material-tailwind/react";
import Button from "../Button";
import { ChevronDownIcon } from "lucide-react";
import { IPublisher } from "@/entities/types";

interface IModalReportsModal {
    missingReportsNumber: number
    missingReports: IPublisher[] | undefined
}

export default function MissingReportsModal({ missingReportsNumber, missingReports }: IModalReportsModal) {
    return (
        <Popover placement="bottom">
            <PopoverHandler>
                <div className="flex justify-end">
                    <Button className="bg-transparent border-none shadow-none text-primary-200 font-bold">
                        <ChevronDownIcon />
                        {`Relatórios em falta: ${missingReportsNumber}`}
                    </Button>
                </div>
            </PopoverHandler>
            <PopoverContent className="w-72">
                <List className="p-0 max-h-96 overflow-auto hide-scrollbar" >
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
    );
}