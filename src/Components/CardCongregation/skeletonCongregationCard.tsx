import { IconImage } from "@/assets/icons"

export default function SkeletonCongregationCard() {
    return (
        <div className="flex flex-col w-60 h-56 bg-typography-200 rounded-xl animate-pulse border border-typography-200 m-3">
            <div className="h-1/2 bg-typography-300 rounded-t-xl flex justify-center items-center">
                <span>{IconImage}</span>
            </div>
            <div className="flex flex-col justify-between items-center h-1/2 p-2 ">
                <span className="flex w-11/12 h-2 p-2 mt-2 bg-typography-300 rounded-2xl "></span>
                <span className="flex w-11/12 h-2 p-2 mt-2 bg-typography-300 rounded-2xl "></span>
                <div className="flex w-full justify-between items-center p-2">
                    <span className="flex w-full h-2 p-2 mr-2 bg-typography-300 rounded-2xl "></span>
                    <span className="flex w-full h-2 p-2 ml-2 bg-typography-300 rounded-2xl "></span>
                </div>
            </div>
        </div>
    )
}