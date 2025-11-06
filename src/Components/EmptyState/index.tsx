import { InfoIcon } from "lucide-react"
interface IEmptyState {
    message: string
}

export default function EmptyState({ message }: IEmptyState) {
    return (
        <div className="flex text-typography-800 border-l-4 border-[1px] border-primary-200 my-4 mx-0 p-2 ">
            <span className="h-full pr-1">
                <InfoIcon className="p-0.5 text-primary-200" />
            </span>
            <span>{message}</span>
        </div>
    )
}