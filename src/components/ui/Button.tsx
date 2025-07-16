"use client";

import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "tertiary";
  onClick?: () => void;
}

export default function Button({ children, variant = "primary", onClick }: ButtonProps) {
  const buttonStyles = {
    primary: "bg-orange-500 hover:bg-orange-600 text-white",
    secondary: "border-2 border-orange-500 text-orange-500 hover:bg-orange-50",
    tertiary: "text-orange-500 hover:underline"
  };

  return (
    <button 
      onClick={onClick}
      className={`${buttonStyles[variant]} font-bold py-3 px-6 rounded-full transition duration-300`}
    >
      {children}
    </button>
  );
}