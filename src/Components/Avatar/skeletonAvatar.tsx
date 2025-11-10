import { UserCircleIcon } from "lucide-react"

export default function SkeletonAvatar() {
    return (
        <div className="relative flex justify-center items-center w-10 h-10 overflow-hidden animate-pulse bg-surface-100 rounded-full mr-2 shimmer">
            <UserCircleIcon className="text-surface-200 shimmer w-10 h-10" />
        </div>
    )
}