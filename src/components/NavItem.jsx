import React from 'react';

export default function NavItem({ icon: Icon, label, active }) {
  return (
    <div className={`flex items-center gap-3 px-3 py-2 rounded cursor-pointer ${active ? 'bg-white/6' : 'hover:bg-white/4'}`}>
      <div className="w-8 h-8 rounded bg-[rgba(0,0,0,0.2)] flex items-center justify-center text-white">
        {Icon && <Icon />}
      </div>
      <div className="text-sm text-white/90">{label}</div>
    </div>
  );
}
