import { atom } from "jotai"
import { INotification } from "@/types/notification"

export const isPushSubscribedAtom = atom<boolean>(false)
export const pushPermissionAtom = atom<NotificationPermission>("default")
export const pushLoadingAtom = atom<boolean>(false)

export const notificationsListAtom = atom<INotification[]>([])
export const unreadNotificationsCountAtom = atom<number>(0)
export const isNotificationsModalOpenAtom = atom<boolean>(false)
