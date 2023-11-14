import { ITotalsReports } from "@/entities/types";
import { capitalizeFirstLetter } from "./isAuxPioneerMonthNow";

export const normalizeTotalsReports = (data: ITotalsReports) => {
    return {
      month: capitalizeFirstLetter(data?.month),
      year: data?.year,
      publishersActives: data.publishersActives,
      privileges: data?.totalsFrom,
      quantity: data?.quantity,
      hours: data?.hours,
      studies: data?.studies
    };
  };