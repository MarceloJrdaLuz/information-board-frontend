import React, { useEffect, useState } from "react";
import Image from "next/image";
import Button from "@/Components/Button";
import { ChevronsLeftIcon } from "lucide-react";
import LayoutPrincipal from "@/Components/LayoutPrincipal";
import PdfViewer from "@/Components/PdfViewer";
import { usePublicDocumentsContext } from "@/context/PublicDocumentsContext";
import { Categories, CongregationTypes, IDocument } from "@/entities/types";
import DateConverter, { meses } from "@/functions/meses";
import { removeMimeType } from "@/functions/removeMimeType";
import { threeMonths } from "@/functions/threeMonths";
import { api } from "@/services/api";
import { useAtomValue } from "jotai";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import iconDesignacoes from '../../../public/images/designacoes-gray.png';
import ButtonHome from "@/Components/ButtonHome";
import HeadComponent from "@/Components/HeadComponent";
import LifeAndMinistryIcon from "@/Components/Icons/LifeAndMinistryIcon";
import PublicMeetingIcon from "@/Components/Icons/PublicMeetingIcon";
import { domainUrl } from "@/atoms/atom";
import NotFoundDocument from "@/Components/NotFoundDocument";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { number } = context.query;
  const getCongregation = await api.get(`/congregation/${number}`);
  const { data: congregationData } = getCongregation;

  return {
    props: { ...congregationData },
  };
};

export default function Designacoes({
  circuit: congregationCircuit,
  name: congregationName,
  number: congregationNumber,
  hourMeetingLifeAndMinistary,
  hourMeetingPublic,
  dayMeetingLifeAndMinistary,
  dayMeetingPublic,
}: CongregationTypes) {
  const router = useRouter();
  const { number } = router.query;
  const domain = useAtomValue(domainUrl);

  const { setCongregationNumber, documents, filterDocuments } = usePublicDocumentsContext();

  const [pdfShow, setPdfShow] = useState(false);
  const [publicOptionsShow, setPublicOptionsShow] = useState(false);
  const [lifeAndMinistryOptionsShow, setLifeAndMinistryOptionsShow] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');
  const [documentsLifeAndMinistryFilter, setDocumentsLifeAndMinistryFilter] = useState<IDocument[]>();
  const [documentsLifeAndMinistryFilterMonths, setDocumentsLifeAndMinistryFilterMonths] = useState<IDocument[]>();
  const [documentsPublicFilter, setDocumentsPublicFilter] = useState<IDocument[]>();
  const [documentsOthersFilter, setDocumentsOthersFilter] = useState<IDocument[]>();

  useEffect(() => {
    if (number) {
      setCongregationNumber(number as string);
    }
  }, [number, setCongregationNumber])

  useEffect(() => {
    if (documents) {
      setDocumentsLifeAndMinistryFilter(filterDocuments(Categories.meioDeSemana));
      setDocumentsPublicFilter(filterDocuments(Categories.fimDeSemana));
    }


  }, [documents, filterDocuments]);

  useEffect(() => {
    const others = documentsLifeAndMinistryFilter?.filter(document => {
      return !meses.includes(removeMimeType(document.fileName));
    });

    setDocumentsOthersFilter(others);

    let threeMonthsShow = false;

    if (new Date().getDate() <= 6 && new Date().getDay() <= 4) {
      threeMonthsShow = threeMonths();
    }

    if (!threeMonthsShow) {
      const filterTwoMonths = documentsLifeAndMinistryFilter?.filter(document => {
        return (
          removeMimeType(document.fileName) === DateConverter('mes') ||
          removeMimeType(document.fileName) === DateConverter('mes+1')
        );
      });

      if (filterTwoMonths) {
        setDocumentsLifeAndMinistryFilterMonths(filterTwoMonths);
      }
    } else {
      const filterThreeMonths = documentsLifeAndMinistryFilter?.filter(document => {
        return (
          removeMimeType(document.fileName) === DateConverter('mes-1') ||
          removeMimeType(document.fileName) === DateConverter('mes') ||
          removeMimeType(document.fileName) === DateConverter('mes+1')
        );
      });

      if (filterThreeMonths) {
        setDocumentsLifeAndMinistryFilterMonths(filterThreeMonths);
      }
    }
  }, [documentsLifeAndMinistryFilter]);

  useEffect(() => {
    // Ordenar os documentos com base nos meses
    const sortedDocuments = documentsLifeAndMinistryFilterMonths?.sort(compareDocumentsByMonth);
    // Faça o que você precisa com os documentos ordenados aqui
  }, [documentsLifeAndMinistryFilterMonths]);

  function handleButtonClick(url: string) {
    setPdfUrl(url);
    setPdfShow(true);
  }

  function compareDocumentsByMonth(a: IDocument, b: IDocument) {
    const monthA = meses.indexOf(a.fileName.split(".")[0]);
    const monthB = meses.indexOf(b.fileName.split(".")[0]);

    if (monthA < monthB) {
      return -1;
    } else if (monthA > monthB) {
      return 1;
    } else {
      return 0;
    }
  }

  return !pdfShow ? (
    <div className=" flex flex-col h-screen w-screen bg-gray-200">
      <HeadComponent title="Designações" urlMiniatura={`${domain}/images/designacoes.png`} />
      <LayoutPrincipal
        image={
          <Image src={iconDesignacoes} alt="Icone de uma pessoa na tribuna" fill />
        }
        congregationName={congregationName}
        circuit={congregationCircuit}
        textoHeader="Designações Semanais"
        heightConteudo={'1/2'}
        header
        className='bg-designacoes bg-center bg-cover'
      >
        <div className="overflow-auto hide-scrollbar p-2 w-full md:w-9/12 m-auto ">
          <div>
            <Button
              className="w-full"
              onClick={() => { setLifeAndMinistryOptionsShow(!lifeAndMinistryOptionsShow) }}
            ><LifeAndMinistryIcon />Vida e Ministério</Button>
            {lifeAndMinistryOptionsShow && <div className="flex justify-between w-11/12 gap-1 my-2 m-auto flex-wrap">
              {lifeAndMinistryOptionsShow && documentsLifeAndMinistryFilterMonths && documentsLifeAndMinistryFilterMonths.length > 0 ? documentsLifeAndMinistryFilterMonths?.map(document => (
                <div className="flex-1 " key={document.id}>
                  <Button
                    className="w-full"
                    onClick={() => { handleButtonClick(document.url) }}
                  >{removeMimeType(document.fileName)}</Button>
                </div>
              )) : <NotFoundDocument message="Nenhuma programação da reunião Vida e Ministério encontrada!" />}
            </div>}
            {lifeAndMinistryOptionsShow && <div className="flex justify-between w-11/12 gap-1  my-2 m-auto flex-wrap">
              {lifeAndMinistryOptionsShow && documentsOthersFilter && documentsOthersFilter.map(document => (
                <div className={`${removeMimeType(document.fileName).length > 10 ? 'w-full' : 'flex-1'} min-w-[120px]`} key={document.id}>
                  <Button
                    onClick={() => { handleButtonClick(document.url) }}
                    className="w-full text-sm" >{removeMimeType(document.fileName)}</Button>
                </div>
              ))}
            </div>}
            {!lifeAndMinistryOptionsShow ? <p className="font-bold my-2  text-xl text-gray-900">{`${dayMeetingLifeAndMinistary} ${hourMeetingLifeAndMinistary.split(":").slice(0, 2).join(":")}`}</p> : null}
          </div>
          <div>
            <Button
              onClick={() => { setPublicOptionsShow(!publicOptionsShow) }}
              className="w-full"
            ><PublicMeetingIcon />Reunião Pública
            </Button>
            {publicOptionsShow && <div className="flex justify-between w-11/12 gap-1  my-2 m-auto flex-wrap">
              {publicOptionsShow && documentsPublicFilter && documentsPublicFilter.length > 0 ? documentsPublicFilter?.map(document => (
                <div className={`${removeMimeType(document.fileName).length > 10 ? 'w-full' : 'flex-1'} min-w-[120px]`} key={document.id}>
                  <Button
                    onClick={() => { handleButtonClick(document.url) }}
                    className="w-full"
                  >{removeMimeType(document.fileName)}</Button>
                </div>
              )) : <NotFoundDocument message="Nenhuma programação da Reunião Pública encontrada!" />}
            </div>}
            {!publicOptionsShow ? <p className="font-bold text-xl my-2 text-gray-900">{`${dayMeetingPublic} ${hourMeetingPublic.split(":").slice(0, 2).join(":")}`}</p> : null}
          </div>
          <Button
            onClick={() => router.push(`/${congregationNumber}`)}
            className="w-1/2 mx-auto"
          ><ChevronsLeftIcon />Voltar</Button>
        </div>
      </LayoutPrincipal>
    </div>
  ) : (
    <>
      <PdfViewer url={pdfUrl} setPdfShow={() => setPdfShow(false)} />
    </>
  )
}
