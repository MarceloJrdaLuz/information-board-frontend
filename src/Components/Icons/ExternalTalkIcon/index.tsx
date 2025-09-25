import React, { ElementType } from "react"

interface ExternalTalkIconProps {
  w?: string
  h?: string
  strokeWidth?: number
}

const ExternalTalkIcon: ElementType = ({
  w = "24",
  h = "24",
  strokeWidth = 13,
}: ExternalTalkIconProps) => {
  return (
    <svg
      fill="currentColor"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      height={h}
      width={w}
      viewBox="0 0 512 512"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="Outline">
        <path d="m124.849 407.354 112 48a8 8 0 0 0 11.151-7.354v-40.16l40.011-.054a8 8 0 0 0 7.989-8v-87.786h-16v79.8l-32 .043v-167.843a8 8 0 0 0 -4.849-7.353l-76.176-32.647h113.025v80h16v-88a8 8 0 0 0 -8-8h-160a8 8 0 0 0 -8 8v224a8 8 0 0 0 4.849 7.354zm11.151-29.461v-189.761l96 41.143v206.593l-96-41.143z" />
        <path d="m264 280v16h100.686l-26.343 26.343 11.314 11.314 40-40a8 8 0 0 0 0-11.314l-40-40-11.314 11.314 26.344 26.343z" />
        <path d="m200 320h16v32h-16z" />
        <path d="m472 48h-24v-8a24 24 0 0 0 -48 0v8h-64v-8a24 24 0 0 0 -48 0v8h-64v-8a24 24 0 0 0 -48 0v8h-64v-8a24 24 0 0 0 -48 0v8h-24a24.028 24.028 0 0 0 -24 24v400a24.028 24.028 0 0 0 24 24h432a24.028 24.028 0 0 0 24-24v-400a24.028 24.028 0 0 0 -24-24zm-56-8a8 8 0 0 1 16 0v32a8 8 0 0 1 -16 0zm-112 0a8 8 0 0 1 16 0v32a8 8 0 0 1 -16 0zm-112 0a8 8 0 0 1 16 0v32a8 8 0 0 1 -16 0zm-112 0a8 8 0 0 1 16 0v32a8 8 0 0 1 -16 0zm400 432a8.009 8.009 0 0 1 -8 8h-432a8.009 8.009 0 0 1 -8-8v-328h448zm0-344h-448v-56a8.009 8.009 0 0 1 8-8h24v8a24 24 0 0 0 48 0v-8h64v8a24 24 0 0 0 48 0v-8h64v8a24 24 0 0 0 48 0v-8h64v8a24 24 0 0 0 48 0v-8h24a8.009 8.009 0 0 1 8 8z" />
      </g>
    </svg>
  )
}

export default ExternalTalkIcon
