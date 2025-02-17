
export default function SkeletonFileList() {
    return (
        <li className="flex bg-white shadow-lg w-full border border-gray-300 justify-between p-6">
            <div className="flex flex-col w-[50%] h-full gap-4">
                <span className="bg-gray-200 h-7 w-[45%]" ></span>
                <span className="bg-gray-200 h-7 w-[20%]" ></span>
            </div>
            <div className="flex justify-end items-center w-[20%] h-full gap-2">
                <span className="bg-gray-200 h-[50%] w-[25%]" ></span>
                <span className="bg-gray-200 h-[50%] w-[25%]" ></span>
            </div>
        </li>

    )
}