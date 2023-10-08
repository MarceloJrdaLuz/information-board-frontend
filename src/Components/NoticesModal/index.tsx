import { useEffect, useState } from "react";
import { INoticesModalProps } from "./types";
import { INotice } from "@/entities/types";
import { ChevronRightIcon } from "@heroicons/react/20/solid";
import { useRouter } from "next/router";

export default function NoticesModal(props: INoticesModalProps) {
    const router = useRouter()

    const [notices, setNotices] = useState<INotice[] | undefined>(props.notices)

    useEffect(() => {
        setNotices(props.notices)
    }, [setNotices, props.notices])

    return (
        <div className={`bg-gray-700  w-full h-0 ${props.notices && 'h-14 p-3'}  flex overflow-hidden text-white transition-all duration-500 `}>
            {notices && notices.length > 1
                ?
                <div className="flex w-full justify-between items-center">
                    <div className="flex justify-center items-center gap-1">
                        <h2 className="w-56 sm:w-96 overflow-hidden whitespace-nowrap text-ellipsis">
                            <span className="font-semibold mr-1 text-sm xs:text-base ">{notices[0]?.title}:</span>
                            <span className={`font-normal text-xs xs:text-sm`}>{notices[0]?.text}</span>
                        </h2>
                    </div>
                    <div>
                        <span className="flex justify-center items-center text-sm p-2">
                            <span className="whitespace-nowrap text-xs xs:text-sm ">{`1 de ${notices?.length}`}</span>
                            <ChevronRightIcon onClick={() => router.push(`/${props.congregationNumber}/anuncios`)} className="w-5 h-5 text-white " />
                        </span>
                    </div>
                </div>
                :
                notices?.map(notice => (
                    <span key={notice.id}>{notice.title}</span>
                ))}
        </div>
    )
}