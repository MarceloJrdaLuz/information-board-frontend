import { FileX2Icon } from "lucide-react"

interface INotFoundProps {
    message: string
}

export default function NotFoundDocument({message} : INotFoundProps){
    return (
        <div className="w-full flex justify-center items-center text-primary-200  gap-3 font-bold italic">
            <FileX2Icon/>
            <span>{message}</span>
        </div>
    )
}