import { yupResolver } from "@hookform/resolvers/yup";
import { useAtomValue, useSetAtom } from "jotai";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import * as yup from "yup";

import { buttonDisabled, errorFormSend, successFormSend } from "@/atoms/atom";
import { createFamilyAtom } from "@/atoms/familyAtoms";
import Button from "@/Components/Button";
import DropdownMulti from "@/Components/DropdownMulti";
import DropdownObject from "@/Components/DropdownObjects";
import Input from "@/Components/Input";
import InputError from "@/Components/InputError";
import { useCongregationContext } from "@/context/CongregationContext";
import { sortArrayByProperty } from "@/functions/sortObjects";
import { useFetch } from "@/hooks/useFetch";
import { IFormDataFamily } from "@/types/family";
import { IPublisher } from "@/types/types";
import FormStyle from "../FormStyle";

interface FormValues {
    name: string;
}

export default function FormAddFamily() {
    const { congregation } = useCongregationContext();
    const congregation_id = congregation?.id;

    const createFamily = useSetAtom(createFamilyAtom);
    const dataSuccess = useAtomValue(successFormSend);
    const dataError = useAtomValue(errorFormSend);
    const disabled = useAtomValue(buttonDisabled);

    const [selectedMembers, setSelectedMembers] = useState<IPublisher[]>([]);
    const [responsible, setResponsible] = useState<IPublisher | null>(null);

    const { data, mutate } = useFetch<IFormDataFamily>(
        `/form-data?form=family`
    );

    const publishersInFamilies = new Set<string>();
    const publishersResponsible = new Set<string>();

    if (data?.families) {
        data.families.forEach(family => {
            family.members?.forEach((p: IPublisher) => publishersInFamilies.add(p.id));
            if (family.responsible) {
                publishersResponsible.add(family.responsible.id);
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
            defaultValues: { name: "" },
            resolver: yupResolver(validation)
        });

    async function onSubmit(formData: FormValues) {
        if (selectedMembers.length === 0) {
            toast.info("É obrigatório escolher pelo menos um membro.");
            return;
        }

        await toast.promise(
            createFamily(congregation_id ?? "", {
                name: formData.name,
                responsible_publisher_id: responsible?.id,
                memberIds: selectedMembers.map(m => m.id)
            }),
            { pending: "Criando nova família..." }
        ).then(() => {
            reset();
            setSelectedMembers([]);
            setResponsible(null);
            mutate();
        }).catch(err => {
            console.log(err)
        })
    }

    function onError() {
        toast.error("Preencha todos os campos corretamente.");
    }

    return (
        <FormStyle onSubmit={handleSubmit(onSubmit, onError)}>
            <div className="w-full h-fit flex-col justify-center items-center">
                <div className="my-6 m-auto w-11/12 font-semibold text-2xl sm:text-3xl text-primary-200">
                    Nova Família
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
                        Criar família
                    </Button>
                </div>
            </div>
        </FormStyle>
    );
}
