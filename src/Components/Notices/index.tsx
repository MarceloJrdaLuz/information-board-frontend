import { useEffect, useState } from "react";
import { INotice } from "@/entities/types";
import { ChevronRightIcon } from "@heroicons/react/20/solid";
import { useRouter } from "next/router";
import { INoticesProps } from "./types";
import ButtonHome from "../ButtonHome";

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
            <ButtonHome texto="Voltar" href={`/${congregationNumber}`} className="mt-10" />
        </div>
    )
}