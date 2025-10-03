import { INotice } from "@/types/types"
import { ChevronRightIcon } from "@heroicons/react/20/solid"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { INoticesModalProps } from "./types"

export default function NoticesModal(props: INoticesModalProps) {
    const router = useRouter()

    const [notices, setNotices] = useState<INotice[] | undefined>(props.notices)

    useEffect(() => {
        setNotices(props.notices)
    }, [setNotices, props.notices])

    return (
        <div className={`bg-gray-700 flex  items-center  w-full h-0 ${props.notices && 'h-10 p-3'} absolute top-0 z-50  flex overflow-hidden text-white transition-all duration-500 `}>
            {notices && notices.length > 0
                ?
                <div onClick={() => router.push(`/${props.congregationNumber}/anuncios`)} className="flex w-full justify-between items-center">
                    <div className="flex justify-center items-center gap-1">
                        <h2 className={`${notices.length < 2 ? 'w-60 xs:w-80 xm:w-[360px]'  : 'w-48 xs:w-60 xm:w-[330px]'  }   overflow-hidden whitespace-nowrap text-ellipsis`}>
                            <span className="font-semibold mr-1 text-sm xm:text-base ">{`${notices[0]?.title} | `}</span>
                            <span className={`font-normal text-xs xm:text-sm`}>{notices[0]?.text}</span>
                        </h2>
                    </div>
                    <div>
                        <span className="flex justify-center items-center text-sm p-2">
                            {notices?.length > 1 && <span className="whitespace-nowrap text-xs xs:text-sm ">{`1 de ${notices?.length}`}</span>}
                            <ChevronRightIcon  className="w-5 h-5 text-white " />
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