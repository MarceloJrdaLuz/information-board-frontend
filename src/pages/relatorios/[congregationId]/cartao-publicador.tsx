"use-client"

import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import React, { useEffect, useRef, useState } from "react";
import Button from "@/Components/Button";
import Layout from "@/Components/Layout";
import ContentDashboard from "@/Components/ContentDashboard";
import S21 from "@/Components/PublisherCard";
import { meses } from "@/functions/meses";
import { useRouter } from "next/router";
import { useFetch } from "@/hooks/useFetch";
import { IPublisher } from "@/entities/types";
import generatePDF, { Resolution } from "react-to-pdf"; 'react-to-pdf'
import ReactPDF, { Document, PDFDownloadLink } from '@react-pdf/renderer';
import S212 from "@/Components/PublisherCard2";


export default function PublisherCard() {
    const mainContentRef = useRef<HTMLDivElement | null>(null)

    const router = useRouter()
    const { congregationId } = router.query

    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
    }, [])

    const { data } = useFetch<IPublisher[]>(`/publishers/congregationId/${congregationId}`)

    const [publishers, setPublishers] = useState<IPublisher[]>()

    useEffect(() => {
        setPublishers(data)
    }, [data])


    return (
        // <Layout pageActive="relatorios">
        //     <ContentDashboard>
        //         <section className="flex flex-col justify-center items-center">

        //             <Button onClick={() => generatePDF(getTargetElement, options)}>Gerar Pdf</Button>
        //             <div id="content-id">
        //                 {publishers && publishers.map(publisher => <S21 key={publisher.id} months={meses} publisher={publisher} serviceYear="2023" />)}
        //             </div>
        //         </section>
        //     </ContentDashboard>
        // </Layout>
        <>
        <span>Aqui</span>
            {/* Seu conteúdo existente */}
                {/* ... Seu conteúdo existente ... */}
                {publishers && (
                    <PDFDownloadLink
                    document={
                        <Document>
                            {publishers &&
                                publishers.map((publisher, index) => (
                                    <S212
                                        key={index}
                                        publisher={publisher}
                                        serviceYear="2023"
                                        months={meses}
                                    />
                                ))}
                        </Document>
                    }
                    fileName="all_publisherss.pdf"
                >
                    {({ blob, url, loading, error }) =>
                        loading ? "Gerando PDF..." : "Baixar PDF com todos os registros"
                    }
                </PDFDownloadLink>
                )}
        </>
    );
}
