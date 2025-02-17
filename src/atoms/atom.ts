import { IBreadCrumbs } from '@/Components/BreadCrumbs/types'
import { IReports } from '@/entities/types'
import { atom } from 'jotai'

export const toogleMenu = atom(false)
export const resetForm = atom(false)
export const successFormSend = atom(false)
export const errorFormSend = atom(false)
export const buttonDisabled = atom(false)

export const crumbsAtom = atom<IBreadCrumbs[]>([
    { label: 'Início', link: '/dashboard' }
])

export const pageActiveAtom = atom('')

export const territoryHistoryToUpdate = atom('')
export const atomTerritoryHistoryAction = atom<"create" | "update" | "">("")

export const selectedPublishersAtom = atom<string[]>([])
export const selectedPublishersToS21Atom = atom<string[]>([])
export const selectedTotalsToS21Atom = atom<string[]>([])
export const groupPublisherList = atom<'add-publishers' | 'remove-publishers' | 'disabled' | 'invisible'>('disabled')

export const domainUrl = atom('')

export const buttonStyledEdit = "flex items-center border rounded-none border-gray-300 bg-white hover:bg-sky-100 p-3 text-primary-200 font-semibold"

export const reportsAtom = atom<IReports[]>([])

export const showSubmenu = atom<string[]>([])
export const submenuActive = atom('')
