import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import React, { useRef, useState } from "react";
import Button from "@/Components/Button";
import Layout from "@/Components/Layout";
import ContentDashboard from "@/Components/ContentDashboard";
import S21 from "@/Components/PublisherCard";

export default function PublisherCard() {
    const mainContentRef = useRef<HTMLDivElement | null>(null);

    const capturePage = async () => {
        const mainContent = mainContentRef.current;

        if (mainContent) {
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
            });

            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            const divs = mainContent.getElementsByTagName("section");

            for (let i = 0; i < divs.length; i++) {
                if (i > 0) {
                    pdf.addPage();
                }

                const div = divs[i];

                const canvasPromise = html2canvas(div, {
                    width: div.clientWidth,
                    windowHeight: pageHeight,
                    x: 0,
                    y: 0,
                    useCORS: true,
                    scale: 1.5,
                    
                });

                const canvas = await canvasPromise;
                const imgData = canvas.toDataURL("image/png");
                const imgHeight = (canvas.height * pageWidth) / canvas.width;

                pdf.addImage(imgData, "PNG", 0, 0, pageWidth, imgHeight);
            }

            pdf.save("pagina.pdf");
        } else {
            console.error('Element with ref "mainContentRef" not found.');
        }
    };

    return (
        <Layout pageActive="relatorios">
            <ContentDashboard>
                <section className="flex flex-col justify-center items-center">
                    <Button onClick={capturePage}>Gerar Pdf</Button>
                    <div ref={mainContentRef}>
                        <S21/>
                        <S21/>
                        <S21/>
                        <S21/>
                    </div>
                </section>
            </ContentDashboard>
        </Layout>
    );
}
