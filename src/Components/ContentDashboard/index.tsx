'use client'

import { ReactNode } from "react"
import FooterDashboard from "../FooterDashboard"
import HeaderDashboard from "../HeaderDashboard"

interface IContentDashboard {
    children: ReactNode
}

export default function ContentDashboard(props: IContentDashboard) {
  return (
    <section className="flex flex-col flex-1 w-full h-full min-h-0 min-w-0 bg-secondary-100 overflow-hidden">
      {/* Header Fixo */}
      <div className="shrink-0">
        <HeaderDashboard />
      </div>

      {/* Conteúdo Principal com Scroll */}
      <div id="dashboard-scroll-container" className="flex-1 min-h-0 overflow-y-auto overscroll-contain thin-scrollbar">
        {props.children}
      </div>

      {/* Footer Fixo no Rodapé da Página */}
      <div className="shrink-0 select-none overscroll-contain">
        <FooterDashboard />
      </div>
    </section>
  )
}