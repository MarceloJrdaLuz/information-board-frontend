import { yupResolver } from "@hookform/resolvers/yup";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import * as yup from "yup";

import { buttonDisabled, errorFormSend, successFormSend } from "@/atoms/atom";
import { updateFamilyAtom } from "@/atoms/familyAtoms";
import Button from "@/Components/Button";
import DropdownMulti from "@/Components/DropdownMulti";
import DropdownObject from "@/Components/DropdownObjects";
import Input from "@/Components/Input";
import InputError from "@/Components/InputError";
import { useCongregationContext } from "@/context/CongregationContext";
import { sortArrayByProperty } from "@/functions/sortObjects";
import { useFetch } from "@/hooks/useFetch";
import { IFamily, IFormDataFamily } from "@/types/family";
import { IPublisher } from "@/types/types";
import FormStyle from "../FormStyle";

interface FormValues {
    name: string;
}

interface FormEditFamilyProps {
    family_id: string;
}

export default function FormEditFamily({ family_id }: FormEditFamilyProps) {
    const { congregation } = useCongregationContext();
    const congregation_id = congregation?.id;

    const updateFamily = useSetAtom(updateFamilyAtom);
    const dataSuccess = useAtomValue(successFormSend);
    const dataError = useAtomValue(errorFormSend);
    const disabled = useAtomValue(buttonDisabled);

    const [selectedMembers, setSelectedMembers] = useState<IPublisher[]>([]);
    const [responsible, setResponsible] = useState<IPublisher | null>(null);

    const { data, mutate } = useFetch<IFormDataFamily>(
        `/form-data?form=family`
    );

    const [currentFamily, setCurrentFamily] = useState<IFamily | null>(null);

    useEffect(() => {
        console.log(responsible)
    }, [responsible])

    // Buscar a família atual
    useEffect(() => {
        if (data?.families) {
            console.log(data.families)
            const family = data.families.find(f => f.id === family_id) ?? null;
            setCurrentFamily(family);
            if (family) {
                setSelectedMembers(family.members ?? []);
                setResponsible(family.responsible ?? null);
            }
        }
    }, [data, family_id]);

    // Criar conjuntos de publishers já membros e já responsáveis, exceto desta família
    const publishersInFamilies = new Set<string>();
    const publishersResponsible = new Set<string>();

    if (data?.families) {
        data.families.forEach(family => {
            if (family.id !== family_id) {
                family.members?.forEach((p: IPublisher) => publishersInFamilies.add(p.id));
                if (family.responsible) {
                    publishersResponsible.add(family.responsible.id);
                }
            }
        });
    }

    // Filtrar publishers disponíveis
    const availablePublishers = sortArrayByProperty(data?.publishers ?? [], "fullName")
        .filter(p => !publishersInFamilies.has(p.id) && !publishersResponsible.has(p.id));

    const validation = yup.object({
        name: yup.string().required("Campo obrigatório"),
    });

    const { register, reset, handleSubmit, formState: { errors } } =
        useForm<FormValues>({
            defaultValues: { name: currentFamily?.name ?? "" },
            resolver: yupResolver(validation)
        });

    useEffect(() => {
        reset({ name: currentFamily?.name ?? "" });
    }, [currentFamily, reset]);

    async function onSubmit(formData: FormValues) {
        if (!responsible) {
            toast.info("É obrigatório escolher um responsável.");
            return;
        }

        if (selectedMembers.length === 0) {
            toast.info("É obrigatório escolher pelo menos um membro.");
            return;
        }

        await toast.promise(
            updateFamily(family_id, {
                name: formData.name,
                responsible_publisher_id: responsible.id,
                memberIds: selectedMembers.map(m => m.id)
            }),
            { pending: "Atualizando família..." }
        );

        mutate();
    }

    function onError() {
        toast.error("Preencha todos os campos corretamente.");
    }

    if (!currentFamily) return null;

    return (
        <FormStyle onSubmit={handleSubmit(onSubmit, onError)}>
            <div className="w-full h-fit flex-col justify-center items-center">
                <div className="my-6 m-auto w-11/12 font-semibold text-2xl sm:text-3xl text-primary-200">
                    Editar Família
                </div>

                <Input
                    type="text"
                    placeholder="Nome da família"
                    registro={{ ...register("name") }}
                    invalid={errors?.name?.message ? "invalido" : ""}
                />
                {errors?.name?.type && <InputError type={errors.name.type} field="name" />}

                <div className='mt-3'>
                    {availablePublishers && (
                        <DropdownObject<IPublisher>
                            title="Responsável da família"
                            items={availablePublishers}
                            selectedItem={responsible}
                            handleChange={setResponsible}
                            labelKey="fullName"
                            border
                            textVisible
                            full
                            textAlign='left'
                            searchable
                        />
                    )}
                </div>

                <div className="mt-3">
                    <DropdownMulti<IPublisher>
                        title="Membros da família"
                        items={availablePublishers}
                        selectedItems={selectedMembers}
                        handleChange={setSelectedMembers}
                        border
                        full
                        position="left"
                        textAlign="left"
                        labelKey="fullName"
                        textVisible
                        searchable
                    />
                </div>

                <div className="flex justify-center items-center m-auto w-11/12 h-12 my-[5%]">
                    <Button
                        className="text-typography-200"
                        error={dataError}
                        disabled={disabled}
                        success={dataSuccess}
                        type="submit"
                    >
                        Salvar alterações
                    </Button>
                </div>
            </div>
        </FormStyle>
    );
}
