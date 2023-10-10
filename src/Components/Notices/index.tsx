import { INoticesProps } from "./types";
import Button from "../Button";
import { useRouter } from "next/router";
import { ChevronsLeftIcon } from "lucide-react";

export default function Notices({ notices, congregationNumber }: INoticesProps) {

    const router = useRouter()

    return (
        <div className="flex flex-col w-full h-full">
            <div className="w-full h-auto min-h-[70vh] overflow-auto">
                {notices?.length ? notices?.map(notice => (
                    <div key={notice.id} className="flex flex-col items-start ">
                        <h2 className="font-bold text-lg p-2 text-gray-900">{notice.title}</h2>
                        <span className="p-2 text-start overflow-auto text-gray-800">{notice.text}</span>
                        <span className="w-1/2 border border-dashed my-5 border-gray-800"></span>
                    </div>
                )) : (
                    <>
                        <span>Nenhum anúncio</span>
                    </>
                )}
            </div>
            <div>
                <Button
                    onClick={() => router.push(`/${congregationNumber}`)}
                    className="w-1/2 mx-auto mt-4 "
                ><ChevronsLeftIcon />Voltar</Button>
            </div>
        </div>
    )
}