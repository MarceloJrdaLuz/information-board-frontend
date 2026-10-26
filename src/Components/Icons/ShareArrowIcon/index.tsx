import React from "react"

interface ShareArrowIconProps {
  className?: string
  size?: number | string
}

export default function ShareArrowIcon({ className = "w-4 h-4", size }: ShareArrowIconProps) {
  return (
    <svg
      viewBox="0 0 512 512"
      fill="none"
      stroke="currentColor"
      strokeWidth="38"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M448 256L272 88v96C103.57 184 64 304.77 64 424c48.61-62.24 91.6-96 208-96v96z" />
    </svg>
  )
}
