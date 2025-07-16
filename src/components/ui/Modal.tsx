"use client";

import React, { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-12">
        <div className="bg-white rounded-xl shadow-md p-8 max-w-md w-full relative">
          <button 
            onClick={onClose}
            className="absolute top-0 right-0 p-2"
          >
            ✕
          </button>
          
          {children}
        </div>
      </div>
    </div>
  );
}