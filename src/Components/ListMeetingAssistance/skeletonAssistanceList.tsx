
export default function SkeletonAssistanceList() {
    return (
        <li className={`flex flex-col  bg-surface-100 w-full md:w-10/12 m-1 border border-surface-300 rounded-2xl shadow-sm`}>
            <span className="w-[50%] h-7 bg-surface-200 shimmer m-6 mb-0"></span>
            <div className="flex flex-wrap justify-between w-full p-6  font-semi-bold text-sm">
                <div className="border gap-2 border-typography-300 flex flex-col w-full p-4 mb-4  bg-surface-100">
                    <span className="w-[50%] h-4 bg-surface-200 shimmer"></span>
                    <div className="w-full gap-2 flex">
                        <span className=" w-[10%] h-4 bg-surface-200 shimmer "></span>
                        <span className=" w-[8%] h-4 bg-surface-200 shimmer "></span>
                    </div>
                    <div className="w-full gap-2 flex">
                        <span className=" w-[10%] h-4 bg-surface-200 shimmer "></span>
                        <span className=" w-[8%] h-4 bg-surface-200 shimmer "></span>
                    </div>
                </div>
                <div className="border gap-2 border-typography-300 flex flex-col w-full  p-4 mb-4  bg-surface-100">
                    <span className="w-[50%] h-4 bg-surface-200 shimmer"></span>
                    <div className="w-full gap-2 flex">
                        <span className=" w-[10%] h-4 bg-surface-200 shimmer "></span>
                        <span className="  w-[8%] h-4 bg-surface-200 shimmer "></span>
                    </div>
                    <div className="w-full gap-2 flex">
                        <span className="w-[10%] h-4 bg-surface-200 shimmer "></span>
                        <span className="  w-[8%] h-4 bg-surface-200 shimmer "></span>
                    </div>
                </div>
            </div>
        </li >

    )
}