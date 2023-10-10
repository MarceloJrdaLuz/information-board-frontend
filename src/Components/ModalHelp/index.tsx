import {
    Card,
    CardBody,
    Typography,
} from "@material-tailwind/react";
import { XSquareIcon } from "lucide-react";

interface ModalHelpProps {
    title?: string
    text?: string
    onClick?: () => void
}

export default function ModalHelp({ text, title, onClick }: ModalHelpProps) {
    return (
        <aside className="flex justify-center items-center bg-black bg-opacity-50 absolute top-0 left-0 z-50 w-screen h-screen">
            <Card className="mt-6 w-full max-w-[700px] h-5/6 overflow-auto">
                <CardBody>
                    <div className="flex justify-between">
                        <Typography variant="h5" color="blue-gray" >
                            {title}
                        </Typography>
                        <XSquareIcon onClick={onClick} className="text-red-400 cursor-pointer rounded-sm hover:scale-110"/>
                    </div>
                    <Typography>
                        <span className="whitespace-pre-wrap">{text}</span>
                    </Typography>
                </CardBody>
                {/* <CardFooter className="pt-0">
                    <Button>Read More</Button>
                </CardFooter> */}
            </Card>
        </aside>


    )
}