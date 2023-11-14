export default function SkeletonModalReport() {
    return (
        <li className="flex flex-col w-80 bg-white border border-1 border-gray-700 m-2 p-2 animate-pulse">
            <span className="py-1 w-9/12 m-auto h-6 bg-gray-200 animate-pulse"></span>
            <div className="flex mt-1">
                <span className="mx-1 w-2/12  h-6 bg-gray-200 animate-pulse"></span>
                <span className="mx-1 w-9/12  h-6 bg-gray-200 animate-pulse"></span>
            </div>
            <div className="flex mt-1">
                <span className="mx-1 w-2/12  h-6 bg-gray-200 animate-pulse"></span>
                <span className="mx-1 w-9/12  h-6 bg-gray-200 animate-pulse"></span>
            </div>
            <div className="mt-2 border border-gray-700 divide-y divide-gray-700">
                <div className="flex justify-between items-center pr-2">
                    <span className="m-2 w-9/12 h-5 bg-gray-200 animate-pulse"></span>
                    <span className="w-8 h-5 bg-gray-200 animate-pulse"></span>
                </div>
                <div className="flex justify-between">
                    <span className="m-2 w-5/12 h-4 bg-gray-200 animate-pulse"></span>
                    <span className="border-l border-gray-700 w-10 bg-gray-200 animate-pulse"></span>
                </div>
                <div className="flex justify-between">
                    <span className="m-2 w-9/12 h-5 bg-gray-200 animate-pulse"></span>
                    <span className="border-l border-gray-700 w-10 bg-gray-200 animate-pulse"></span>
                </div>
            </div>
            <div className="flex justify-between border border-gray-700 mt-2 ">
                <span className="m-2 w-3/12 h-3 bg-gray-200 animate-pulse"></span>
                <span className="m-2 w-9/12 h-9 pl-2 bg-gray-200 animate-pulse"></span>
            </div>

        </li>

    )
}