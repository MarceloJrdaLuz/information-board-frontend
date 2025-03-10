
export default function SkeletonAssistanceList() {
    return (
        <li className={`flex flex-col  bg-white w-full md:w-10/12 m-1`}>
            <span className="w-[50%] h-7 bg-gray-200 m-6 mb-0"></span>
            <div className="flex flex-wrap justify-between w-full p-6  font-semi-bold text-sm">
                <div className="border gap-2 border-blue-gray-200 flex flex-col w-full p-4 mb-4  bg-white">
                    <span className="w-[50%] h-4 bg-gray-200"></span>
                    <div className="w-full gap-2 flex">
                        <span className=" w-[10%] h-4 bg-gray-200 "></span>
                        <span className=" w-[8%] h-4 bg-gray-200 "></span>
                    </div>
                    <div className="w-full gap-2 flex">
                        <span className=" w-[10%] h-4 bg-gray-200 "></span>
                        <span className=" w-[8%] h-4 bg-gray-200 "></span>
                    </div>
                </div>
                <div className="border gap-2 border-blue-gray-200 flex flex-col w-full  p-4 mb-4  bg-white">
                    <span className="w-[50%] h-4 bg-gray-200"></span>
                    <div className="w-full gap-2 flex">
                        <span className=" w-[10%] h-4 bg-gray-200 "></span>
                        <span className="  w-[8%] h-4 bg-gray-200 "></span>
                    </div>
                    <div className="w-full gap-2 flex">
                        <span className="w-[10%] h-4 bg-gray-200 "></span>
                        <span className="  w-[8%] h-4 bg-gray-200 "></span>
                    </div>
                </div>
            </div>
        </li >

    )
}