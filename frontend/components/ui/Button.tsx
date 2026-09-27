"use client";

import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
}

export function Button({ children, variant = "primary", className = "", ...props }: ButtonProps) {
  const styles = {
    primary: "bg-[#f1f3f5] text-[#090b0f] hover:bg-white",
    secondary: "bg-[#141820] text-[#f1f3f5] border border-[#252b35] hover:bg-[#191e27]",
    danger: "bg-[#ff6262]/10 text-[#ff7b7b] border border-[#ff6262]/20 hover:bg-[#ff6262]/15",
    ghost: "text-[#9ca4b1] hover:text-[#f1f3f5] hover:bg-[#141820]",
  };

  return (
    <button
      className={`
        inline-flex items-center justify-center
        rounded-lg px-4 py-2
        text-sm font-medium
        transition-colors
        disabled:pointer-events-none
        disabled:opacity-50
        ${styles[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
