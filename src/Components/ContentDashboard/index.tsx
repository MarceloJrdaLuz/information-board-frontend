'use client'

import { ReactNode } from "react"
import FooterDashboard from "../FooterDashboard"
import HeaderDashboard from "../HeaderDashboard"

interface IContentDashboard {
    children: ReactNode
}

export default function ContentDashboard(props: IContentDashboard) {
  return (
    <section className="flex flex-col w-full h-[100dvh] min-w-0 bg-secondary-100 overflow-hidden">
      {/* Header Fixo */}
      <div className="shrink-0">
        <HeaderDashboard />
      </div>

      {/* Conteúdo Principal com Scroll */}
      <div className="flex-1 overflow-y-auto overscroll-contain thin-scrollbar">
        {props.children}
      </div>

      {/* Footer Fixo no Rodapé da Página */}
      <div className="shrink-0">
        <FooterDashboard />
      </div>
    </section>
  )
}