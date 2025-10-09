// src/components/SidebarItem.jsx
import React from "react";

export default function SidebarItem({
  icon: Icon,
  label,
  onClick,
  badge,
  className = "",
  ariaLabel,
}) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel || label}
      className={
        "w-full flex items-center gap-3 px-4 py-3 text-sm rounded transition-colors hover:bg-slate-700/40 focus:outline-none " +
        className
      }
    >
      {Icon ? <Icon className="w-5 h-5 flex-shrink-0" /> : <span className="w-5" />}
      <span className="flex-1 text-left">{label}</span>
      {badge ? <span className="text-xs font-medium">{badge}</span> : null}
    </button>
  );
}