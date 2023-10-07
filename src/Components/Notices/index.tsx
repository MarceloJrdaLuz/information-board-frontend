import { INoticesProps } from "./types";
import Button from "../Button";
import { useRouter } from "next/router";
import { ChevronsLeftIcon } from "lucide-react";

export default function Notices({ notices, congregationNumber }: INoticesProps) {

    const router = useRouter()

    return (
        <div className="flex flex-col w-full h-auto">
            {notices?.length ? notices?.map(notice => (
                <div key={notice.id} className="flex flex-col">
                    <h2 className="font-bold text-lg p-4">{notice.title}</h2>
                    <span className="p-4 overflow-auto">{notice.text}</span>
                    <span className="border border-dashed  border-gray-800"></span>
                </div>
            )) : (
                <>
                    <span>Nenhum anúncio</span>
                </>
            )}
             <Button
                    onClick={() => router.push(`/${congregationNumber}`)}
                    className="w-1/2 mx-auto mt-4 "
                ><ChevronsLeftIcon />Voltar</Button>
        </div>
    )
}