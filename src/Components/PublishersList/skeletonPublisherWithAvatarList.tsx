import SkeletonAvatar from "../Avatar/skeletonAvatar"

export default function SkeletonPublishersWithAvatarList() {
    return (
        <li className={`flex flex-wrap justify-between border border-surface-300  rounded-2xl shadow-sm items-center bg-surface-100 cursor-pointer w-full md:w-10/12 text-fontColor-100  m-1`}>
            <div className="flex w-full justify-between items-center">
                <div className="flex w-full items-center p-6 ">
                    <SkeletonAvatar />
                    <span className="pl-4 font-semi-bold w-[70%] h-7 bg-surface-200 shimmer"></span>
                </div>
                <span className="w-5 h-5 mr-3 bg-surface-200 shimmer"></span>
            </div>
        </li>

    )
}