import { crumbsAtom, pageActiveAtom } from "@/atoms/atom";
import { deleteCleaningGroupAtom } from "@/atoms/cleaningGroupsAtoms";
import BreadCrumbs from "@/Components/BreadCrumbs";
import Button from "@/Components/Button";
import ContentDashboard from "@/Components/ContentDashboard";
import EmptyState from "@/Components/EmptyState";
import GroupIcon from "@/Components/Icons/GroupIcon";
import { ListGeneric } from "@/Components/ListGeneric";
import SkeletonGroupsList from "@/Components/ListGroups/skeletonGroupList";
import { API_ROUTES } from "@/constants/apiRoutes";
import { useCongregationContext } from "@/context/CongregationContext";
import { sortArrayByProperty } from "@/functions/sortObjects";
import { useAuthorizedFetch } from "@/hooks/useFetch";
import { useSubmit } from "@/hooks/useSubmitForms";
import { api } from "@/services/api";
import { ICleaningGroup } from "@/types/cleaning";
import { messageErrorsSubmit, messageSuccessSubmit } from "@/utils/messagesSubmit";
import { withProtectedLayout } from "@/utils/withProtectedLayout";
import { useAtom, useSetAtom } from "jotai";
import Router from "next/router";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

function CleaningGroupsPage() {
  const { congregation } = useCongregationContext();
  const [crumbs] = useAtom(crumbsAtom);
  const [, setPageActive] = useAtom(pageActiveAtom);
  const [groups, setGroups] = useState<ICleaningGroup[]>();
  const setDeleteCleaningGroup = useSetAtom(deleteCleaningGroupAtom)

  const url = congregation ? `${API_ROUTES.CLEANING_GROUPS}/congregation/${congregation.id}` : "";
  const { data, mutate } = useAuthorizedFetch<ICleaningGroup[]>(url, {
    allowedRoles: ["ADMIN_CONGREGATION", "CLEANING_MANAGER"],
  });

  useEffect(() => {
    if (data) setGroups(sortArrayByProperty(data, "name"));
  }, [data]);

  useEffect(() => {
    setPageActive("Grupos de limpeza");
  }, [setPageActive]);

  async function handleDelete(group_id: string) {
    await toast.promise(setDeleteCleaningGroup(group_id), {
      pending: "Excluindo grupo de limpeza..."
    }).then(() => {
      mutate()
    }).catch(err => {
      console.log(err)
    })
  }

  return (
    <ContentDashboard>
      <BreadCrumbs crumbs={crumbs} pageActive="Grupos de limpeza" />
      <section className="flex flex-wrap w-full p-5">
        <div className="w-full h-full">
          <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-primary-200">Grupos de limpeza</h1>
          <div className="flex justify-between items-center mb-3">
            <Button
              outline
              onClick={() => Router.push("/congregacao/grupos-limpeza/add")}
              className="text-primary-200 p-3 border-typography-300 hover:opacity-80"
            >
              <GroupIcon className="w-5 h-5" />
              <span>Novo grupo</span>
            </Button>
          </div>

          {groups && groups.length > 0 ? (
            <ListGeneric
              onDelete={(item_id) => handleDelete(item_id)}
              onUpdate={(group) => { }}
              items={groups}
              path="/congregacao/grupos-limpeza"
              label="do grupo"
              renderItem={(group) => (
                <div className="flex flex-col gap-3 p-4 border rounded-md hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-semibold text-typography-800">{group.name}</h3>

                  <div className="text-sm text-typography-700 flex flex-col gap-2">
                    <div className="flex flex-col gap-1">
                      👥 <span>Membros:</span>
                      {group.publishers && group.publishers.length > 0
                        ? group.publishers.map((p) => (
                          <span key={p.id} className="ml-4 text-typography-700">{p.nickname ? p.nickname : p.fullName
                          }</span>
                        ))
                        : <span className="ml-4 text-typography-700">Nenhum membro adicionado</span>
                      }
                    </div>
                  </div>
                </div>
              )}
            />
          ) : !groups ? (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5 pb-36">
              {Array(6).fill(0).map((_, i) => <SkeletonGroupsList key={i} />)}
            </ul>
          ) : (
            <EmptyState message="Nenhum grupo de limpeza cadastrado!" />
          )}
        </div>
      </section>
    </ContentDashboard>
  );
}

CleaningGroupsPage.getLayout = withProtectedLayout(["ADMIN_CONGREGATION", "CLEANING_MANAGER"]);

export default CleaningGroupsPage;
