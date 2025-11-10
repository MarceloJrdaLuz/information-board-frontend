
export default function SkeletonTerritoriesList() {
    return (
        <li className={`flex flex-wrap justify-between items-center bg-surface-100 hover:bg-sky-100 cursor-pointer w-full md:w-11/12 text-fontColor-100 mt-4`}>
            <div className="flex w-full justify-between items-center">
                <div className="flex justify-between w-full items-center p-4 ">
                    <span className="pl-4 font-semi-bold w-[50%] h-7 bg-surface-200 shimmer"></span>
                    <div className="flex gap-2">
                        <span className="pl-4 font-semi-bold w-7 h-7 bg-surface-200 shimmer"></span>
                        <span className="pl-4 font-semi-bold w-7 h-7 bg-surface-200 shimmer"></span>
                        <span className="pl-4 font-semi-bold w-7 h-7 bg-surface-200 shimmer"></span>
                    </div>
                </div>
            </div>
        </li>

    )
}