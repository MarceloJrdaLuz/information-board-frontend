import { API_ROUTES } from "@/constants/apiRoutes"
import { useAuthorizedFetch } from "./useFetch"
import { IPublicWitnessArrangement } from "@/types/publicWitness"
import { IPublisher } from "@/types/types"
import { IPublicWitnessScheduleResponse } from "@/atoms/publicWitnessAtoms.ts/schedules/types"

export const useArrangements = (congregation_id: string | undefined) => {
  return useAuthorizedFetch<IPublicWitnessArrangement[]>(
    congregation_id ? `${API_ROUTES.PUBLIC_WITNESS_ARRANGEMENTS}/congregation/${congregation_id}` : "",
    { allowedRoles: ["ADMIN_CONGREGATION", "FIELD_SERVICE_MANAGER"] }
  )
}

export const useArrangement = (arrangement_id: string) => {
  return useAuthorizedFetch<IPublicWitnessArrangement>(
    `${API_ROUTES.PUBLIC_WITNESS_ARRANGEMENTS}/${arrangement_id}`,
    { allowedRoles: ["ADMIN_CONGREGATION", "FIELD_SERVICE_MANAGER"] }
  )
}

export const usePublishers = () => {
  return useAuthorizedFetch<IPublisher[]>(
    `form-data?form=publicWitness`,
    { allowedRoles: ["ADMIN_CONGREGATION", "FIELD_SERVICE_MANAGER"] }
  )
}

export const usePublicWitnessSchedules = ({ arrangement_id, start_date, end_date }: UsePublicWitnessSchedulesArgs) => {
  const urlFetch = arrangement_id && start_date && end_date
    ? `public-witness/arrangements/${arrangement_id}/schedules?start_date=${start_date}&end_date=${end_date}`
    : "" // <-- usa null em vez de ""

  return useAuthorizedFetch<IPublicWitnessScheduleResponse>(
    urlFetch,
    { allowedRoles: ["ADMIN_CONGREGATION", "FIELD_SERVICE_MANAGER"] }
  )
}

export interface UsePublicWitnessSchedulesArgs {
  arrangement_id: string
  start_date: string
  end_date: string
}

