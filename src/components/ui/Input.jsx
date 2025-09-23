import React from "react";

export default function Input({ className = "", ...props }) {
  return (
    <input
      className={`border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent ${className}`}
      {...props}
    />
  );
}
