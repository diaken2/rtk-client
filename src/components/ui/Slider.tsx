"use client";

import React from 'react';

interface SliderProps {
  min: number;
  max: number;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function Slider({ min, max, value, onChange }: SliderProps) {
  return (
    <div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={onChange}
        className="w-full"
      />
      <div className="flex justify-between text-sm text-gray-600">
        <span>{min}</span>
        <span>до {value}</span>
      </div>
    </div>
  );
}