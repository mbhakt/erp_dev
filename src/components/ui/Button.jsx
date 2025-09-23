import React from "react";

export default function Button({ children, className = "", variant = "primary", ...props }) {
  const base = "inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium";
  const variants = {
    primary: "bg-accent text-white shadow-sm hover:opacity-95",
    secondary: "bg-accent2 text-white shadow-sm hover:opacity-95",
    ghost: "bg-white border border-border text-muted"
  };
  return (
    <button className={`${base} ${variants[variant] || variants.primary} ${className}`} {...props}>
      {children}
    </button>
  );
}
