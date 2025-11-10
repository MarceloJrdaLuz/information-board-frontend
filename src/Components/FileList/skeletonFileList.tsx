
export default function SkeletonFileList() {
    return (
        <li className="flex bg-surface-100 w-full  justify-between p-6 border border-surface-300 rounded-2xl shadow-sm">
            <div className="flex flex-col w-full h-full gap-4">
                <span className="bg-surface-200 shimmer h-7 w-[70%]" ></span>
                <span className="bg-surface-200 shimmer h-7 w-[20%]" ></span>
            </div>
            <div className="flex justify-end items-center w-[50%] h-full gap-2">
                <span className="bg-surface-200 shimmer h-[50%] w-[25%]" ></span>
                <span className="bg-surface-200 shimmer h-[50%] w-[25%]" ></span>
            </div>
        </li>

    )
}