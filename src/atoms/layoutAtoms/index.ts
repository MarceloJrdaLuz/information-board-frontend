import { atom } from "jotai";
import { ICongregation } from "@/types/types";

// layout público (ex: número da congregação)
export const congregationNumberAtom = atom<string | null>(null);
export const congregationDataAtom = atom<ICongregation | null>(null);

// layout privado (ex: menu lateral)
export const openSubMenuAtom = atom<string | null>(null);
export const menuOpenAtom = atom<boolean>(false);
