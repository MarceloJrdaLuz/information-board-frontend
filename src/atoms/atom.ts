import { IBreadCrumbs } from '@/Components/BreadCrumbs/types';
import { atom } from 'jotai'

export const toogleMenu = atom(false)

export const crumbsAtom = atom<IBreadCrumbs[]>([
    {label: 'Início', link: '/dashboard'}
])

export const pageActiveAtom = atom('')