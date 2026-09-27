import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className = "", ...props }: InputProps) {
  return (
    <label className="block">
      {label && <span className="mb-2 block text-xs font-medium uppercase tracking-wider text-[#68717f]">{label}</span>}

      <input
        className={`
          w-full rounded-lg
          border border-[#252b35]
          bg-[#0e1117]
          px-3.5 py-2.5
          text-sm text-[#f1f3f5]
          outline-none
          placeholder:text-[#505865]
          transition
          focus:border-[#5969c8]
          focus:ring-2
          focus:ring-[#8b9cff]/10
          ${className}
        `}
        {...props}
      />
    </label>
  );
}
