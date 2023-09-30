import {
    Popover,
    PopoverHandler,
    PopoverContent,
    Avatar,
    Typography,
    List,
    ListItem,
    ListItemPrefix,
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
                    {missingReports ? missingReports.map(missingReport => (
                        <ListItem key={missingReport.id}>
                            {missingReport.fullName}
                        </ListItem>
                    )) : (
                        <span>Todos os publicadores já enviaram seus relatórios</span>
                    )}
                </List>
            </PopoverContent>
        </Popover>
    );
}