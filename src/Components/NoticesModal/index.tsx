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
        <div className=" bg-gray-500 w-full p-3 flex ">
            {notices && notices.length > 1
                ?
                <div className="flex w-full justify-between items-center">
                    <div className="flex justify-center items-center gap-1">
                        <h2>
                            <span className="font-semibold mr-1">{notices[0]?.title}:</span>
                            <span className="font-normal">{notices[0]?.text}</span>
                        </h2>
                    </div>
                    <div>
                        <span className="flex justify-center items-center text-sm p-2">
                            <span className="whitespace-nowrap">{`1 de ${notices?.length}`}</span>
                            <ChevronRightIcon onClick={() => router.push(`/${props.congregationNumber}/anuncios`)} className="w-8 h-8 text-gray-900 " />
                        </span>
                    </div>
                </div>
                :
                notices?.map(notice => (
                    <span key={notice.id}>{notice.title}</span>
                ))}
            {/* {<span>{notices?.length}</span>} */}
        </div>
    )
}