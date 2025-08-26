
export default function SkeletonGroupsList() {
    return (
        <li className={`flex flex-wrap justify-between items-center bg-white hover:bg-sky-100 cursor-pointer w-full md:w-10/12 text-fontColor-100  m-1`}>
            <div className="flex w-full justify-between items-center">
                <div className="flex flex-wrap sm:flex-nowrap justify-between w-full items-center p-4 ">
                    <div className="flex w-full gap-1">
                        <span className="font-semi-bold w-[40%] sm:w-[40%] h-7 bg-gray-200"></span>
                        <span className="font-semi-bold w-[40%] sm:w-[40%] h-7 bg-gray-200"></span>
                    </div>
                    <div className="flex w-full gap-1 mt-2 sm:mt-0 ">
                        <span className="font-semi-bold w-[40%] sm:w-[40%] h-7 bg-gray-200"></span>
                        <span className="font-semi-bold w-[40%] sm:w-[40%] h-7 bg-gray-200"></span>
                    </div>
                    <div className="flex w-full gap-1 mt-2 sm:mt-0">
                        <span className="font-semi-bold w-[30%] sm:w-[50%] h-7 bg-gray-200"></span>
                        <span className="font-semi-bold w-[30%] sm:w-[50%] h-7 bg-gray-200"></span>
                    </div>
                    
                </div>
            </div>
        </li>

    )
}