import { IBreadCrumbs } from '@/Components/BreadCrumbs/types';
import { atom } from 'jotai'

export const toogleMenu = atom(false)

export const crumbsAtom = atom<IBreadCrumbs[]>([
    {label: 'Início', link: '/dashboard'}
])

export const pageActiveAtom = atom('')

export const removePublisherOption = atom(true)
export const groupPublishersListDisabled = atom(true)
export const selectedPublishersAtom = atom<string[]>([])


export const groupPublisherList = atom<'add-publishers' | 'remove-publishers' | 'disabled' | 'invisible'>('disabled');