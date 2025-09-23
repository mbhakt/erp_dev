import React from 'react';

export default function ItemRow({ item, onChangeQty }) {
  return (
    <div className="flex items-center gap-3 p-2 border-b">
      <div className="w-6 text-sm">{item.index}</div>
      <div className="flex-1 text-sm">{item.name}</div>
      <div className="w-24">
        <input type="number" value={item.qty} onChange={(e) => onChangeQty(item.index-1, e.target.value)} className="w-full p-1 border rounded" />
      </div>
      <div className="w-28 text-right">₹ {Number(item.price).toFixed(2)}</div>
      <div className="w-28 text-right">₹ {(item.qty * item.price).toFixed(2)}</div>
    </div>
  );
}
