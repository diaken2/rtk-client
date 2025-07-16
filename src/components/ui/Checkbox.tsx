"use client";

import React from 'react';

interface CheckboxProps {
  children: React.ReactNode;
  checked: boolean;
  onChange: () => void;
}

export default function Checkbox({ children, checked, onChange }: CheckboxProps) {
  return (
    <label className="flex items-center">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="mr-2 h-5 w-5 text-orange-500 rounded"
      />
      {children}
    </label>
  );
}