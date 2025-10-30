import { api } from "@/services/api";
import { IRecordHospitalityWeekend } from "@/types/hospitality";
import { IHospitalityGroup } from "@/types/types";
import { atom } from "jotai";
import { toast } from "react-toastify";

interface CreatePayload {
    weekends: IRecordHospitalityWeekend[];
}
export interface IAssignmentStatus {
    [assignment_id: string]: boolean;
}

export const hospitalityWeekendsAtom = atom<Record<string, IRecordHospitalityWeekend>>({})
export const hospitalityGroup = atom<IHospitalityGroup[]>([])
export const dirtyWeekendsAtom = atom<Record<string, IRecordHospitalityWeekend>>({});

export const assignmentStatusAtom = atom<IAssignmentStatus>({});

export const createHospitalityWeekendAtom = atom(
    null,
    async (_get, set, congregation_id: string, payload: CreatePayload) => {
        try {
            const response = await api.post(`/congregation/${congregation_id}/hospitality/weekends`, payload);
            const createdWeekends: IRecordHospitalityWeekend[] = response.data.weekends;

            // opcional: atualizar atom local após criar
            set(hospitalityWeekendsAtom, (prev) => {
                const copy = { ...prev };
                createdWeekends.forEach(w => {
                    copy[w.date] = w;
                });
                return copy;
            });

            toast.success("Final de semana criado com sucesso!");
            return createdWeekends; // <- precisa retornar o array
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Erro ao criar final de semana");
            throw err;
        }
    }
);


export const updateAssignmentStatusAtom = atom(
    null,
    async (_get, set, { assignment_id, completed }: { assignment_id: string; completed: boolean }) => {
        try {
            const res = await api.patch(`/assignment/${assignment_id}/status`, { completed });

            toast.success("Status atualizado com sucesso!");
            return res.data;
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Erro ao atualizar status do lanche");
            throw err;
        }
    }
);