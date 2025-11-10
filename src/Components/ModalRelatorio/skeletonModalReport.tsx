export default function SkeletonModalReport() {
    return (
        <li className="flex flex-col w-80 bg-surface-100 border border-1 border-typography-700 m-2 p-2 animate-pulse">
            <span className="py-1 w-9/12 m-auto h-6 bg-surface-200 shimmer animate-pulse"></span>
            <div className="flex mt-1">
                <span className="mx-1 w-2/12  h-6 bg-surface-200 shimmer animate-pulse"></span>
                <span className="mx-1 w-9/12  h-6 bg-surface-200 shimmer animate-pulse"></span>
            </div>
            <div className="flex mt-1">
                <span className="mx-1 w-2/12  h-6 bg-surface-200 shimmer animate-pulse"></span>
                <span className="mx-1 w-9/12  h-6 bg-surface-200 shimmer animate-pulse"></span>
            </div>
            <div className="mt-2 border border-typography-700 divide-y divide-typography-700">
                <div className="flex justify-between items-center pr-2">
                    <span className="m-2 w-9/12 h-5 bg-surface-200 shimmer animate-pulse"></span>
                    <span className="w-8 h-5 bg-surface-200 shimmer animate-pulse"></span>
                </div>
                <div className="flex justify-between">
                    <span className="m-2 w-5/12 h-4 bg-surface-200 shimmer animate-pulse"></span>
                    <span className="border-l border-surface-700 shimmer w-10 bg-surface-200 shimmer animate-pulse"></span>
                </div>
                <div className="flex justify-between">
                    <span className="m-2 w-9/12 h-5 bg-surface-200 shimmer animate-pulse"></span>
                    <span className="border-l border-surface-700 shimmer w-10 bg-surface-200 shimmer animate-pulse"></span>
                </div>
            </div>
            <div className="flex justify-between border border-typography-700 mt-2 ">
                <span className="m-2 w-3/12 h-3 bg-surface-200 shimmer animate-pulse"></span>
                <span className="m-2 w-9/12 h-9 pl-2 bg-surface-200 shimmer animate-pulse"></span>
            </div>

        </li>

    )
}