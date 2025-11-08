import { UserCircleIcon } from "lucide-react"

export default function SkeletonAvatar() {
    return (
        <div className="relative flex justify-center items-center w-14 h-14 overflow-hidden animate-pulse bg-surface-100 rounded-full mr-2">
            <UserCircleIcon className="text-surface-200" />
        </div>
    )
}