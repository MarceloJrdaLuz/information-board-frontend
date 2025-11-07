import { ImageIcon } from "lucide-react"

export default function SkeletonAvatarCongregation() {
    return (
        <div className="relative flex justify-center items-center w-10 h-10 overflow-hidden animate-pulse bg-typography-400 rounded-full dark:bg-typography-600 mr-2">
            <ImageIcon className="text-typography-500" />
        </div>
    )
}