import SkeletonAvatar from "../Avatar/skeletonAvatar"

export default function SkeletonPublishersWithAvatarList() {
    return (
        <li className={`flex flex-wrap justify-between items-center bg-white hover:bg-sky-100 cursor-pointer w-full md:w-10/12 text-fontColor-100  m-1`}>
            <div className="flex w-full justify-between items-center">
                <div className="flex w-full items-center p-6 ">
                    <SkeletonAvatar />
                <span className="pl-4 font-semi-bold w-[40%] h-7 bg-gray-200"></span>
                </div>
                <span className="w-5 h-5 mr-3 bg-gray-200"></span>
            </div>
        </li>

    )
}