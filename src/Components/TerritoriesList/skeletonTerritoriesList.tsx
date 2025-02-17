
export default function SkeletonTerritoriesList() {
    return (
        <li className={`flex flex-wrap justify-between items-center bg-white hover:bg-sky-100 cursor-pointer w-full md:w-10/12 text-fontColor-100  m-1`}>
            <div className="flex w-full justify-between items-center">
                <div className="flex justify-between w-full items-center p-4 ">
                    <span className="pl-4 font-semi-bold w-[50%] h-7 bg-gray-200"></span>
                    <div className="flex gap-2">
                        <span className="pl-4 font-semi-bold w-7 h-7 bg-gray-200"></span>
                        <span className="pl-4 font-semi-bold w-7 h-7 bg-gray-200"></span>
                        <span className="pl-4 font-semi-bold w-7 h-7 bg-gray-200"></span>
                    </div>
                </div>
            </div>
        </li>

    )
}