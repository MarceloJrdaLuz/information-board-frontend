import { Gender, Hope, Privileges, Situation } from '@/types/types'

// Garante que é array de Gender e não string[]
export const genderOptions: Gender[] = Object.values(Gender)

export const hopeOptions: Hope[] = Object.values(Hope)

export const situationOptions: Situation[] = Object.values(Situation)

export const privilegeOptions: Privileges[] = [
  Privileges.ANCIAO,
  Privileges.SM,
] as Privileges[]

export const additionalsPrivilegeOptions: Privileges[] = [
  Privileges.LEITOR,
  Privileges.PRESIDENTE,
  Privileges.ORADOR, 
  Privileges.DIRIGENTECAMPO
] as Privileges[]

export const pioneerOptions: Privileges[] = [
  Privileges.PIONEIROAUXILIAR,
  Privileges.AUXILIARINDETERMINADO,
  Privileges.MISSIONARIOEMCAMPO,
  Privileges.PIONEIROESPECIAL,
  Privileges.PIONEIROREGULAR,
] as Privileges[]
