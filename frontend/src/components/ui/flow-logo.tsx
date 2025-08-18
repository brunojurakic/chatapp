import React from "react"

interface FlowLogoProps {
  className?: string
  size?: number
}

export const FlowLogo: React.FC<FlowLogoProps> = ({ className, size = 24 }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      role="img"
      aria-labelledby="flow-logo-title flow-logo-desc"
      className={className}
      width={size}
      height={size}
    >
      <title id="flow-logo-title">Flow — logo mark</title>
      <desc id="flow-logo-desc">
        A droplet shape representing the flow of communication
      </desc>
      <defs>
        <linearGradient id="flowDropGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.95" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.75" />
        </linearGradient>
      </defs>
      <path
        d="M128 32
           C96 96, 64 128, 64 176
           A64 64 0 0 0 192 176
           C192 128, 160 96, 128 32Z"
        fill="url(#flowDropGrad)"
        className="drop-shadow-sm"
      />
    </svg>
  )
}
