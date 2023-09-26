import { IBreadCrumbs } from '@/Components/BreadCrumbs/types';
import { atom } from 'jotai'

export const toogleMenu = atom(false)
export const resetForm = atom(false)
export const successFormSend = atom(false)
export const errorFormSend = atom(false)
export const buttonDisabled = atom(false)

export const crumbsAtom = atom<IBreadCrumbs[]>([
    {label: 'Início', link: '/dashboard'}
])

export const pageActiveAtom = atom('')

export const selectedPublishersAtom = atom<string[]>([])
export const groupPublisherList = atom<'add-publishers' | 'remove-publishers' | 'disabled' | 'invisible'>('disabled')

export const domainUrl = atom('')