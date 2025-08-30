"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useSupportOnly } from '@/context/SupportOnlyContext';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const { isSupportOnly } = useSupportOnly();

  // Определение мобильного устройства
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Обработка клика вне модалки
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  
  if (isSupportOnly) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-45 flex items-center justify-center z-[1000] p-4">
        <div className="bg-white rounded-xl shadow-lg w-full max-w-md relative flex flex-col items-center justify-center p-8">
          <h2 className="text-2xl font-bold mb-4 text-center">Вы являетесь действующим абонентом Ростелеком</h2>
          <p className="text-gray-600 mb-4 text-center">Мы не сможем ответить на вопросы по действующему подключению или сменить ваш текущий тариф.</p>
          <div className="bg-blue-50 rounded-xl p-4 mb-4 text-center">
            <p className="text-gray-700 mb-2 font-medium">Рекомендуем позвонить по номеру</p>
            <a href="tel:88001000800" className="text-2xl font-bold text-blue-600 tracking-wider block mb-1 hover:underline">8 800 100-08-00</a>
            <p className="text-sm text-gray-500">Звонок бесплатный по РФ</p>
          </div>
          <div className="text-base text-center">
            или узнать информацию в <a href="https://lk.rt.ru/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-700">личном кабинете</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-45 flex items-center justify-center z-[1000] p-4">
      <div
        className={
          isMobile
            ? "fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-[1001] overflow-y-auto"
            : "w-[400px] max-w-[90vw] bg-white rounded-[24px] p-8 md:p-10 relative shadow-xl"
        }
        style={isMobile ? { maxHeight: '90vh' } : {}}
        ref={modalRef}
      >
        {isMobile && (
          <div className="sticky top-0 bg-white py-4 px-4 flex justify-center border-b z-10">
            <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
          </div>
        )}
        
        <button 
          onClick={onClose}
          className={
            isMobile
              ? "absolute top-4 right-4 w-10 h-10 rounded-full bg-[#E9E9E9] text-[#6E6E6E] text-xl border-0 cursor-pointer hover:bg-[#DCDCDC] transition-colors flex items-center justify-center z-10"
              : "absolute top-6 right-6 w-10 h-10 rounded-full bg-[#E9E9E9] text-[#6E6E6E] text-xl border-0 cursor-pointer hover:bg-[#DCDCDC] transition-colors flex items-center justify-center"
          }
        >
          ×
        </button>

        <div className={isMobile ? "p-4" : ""}>
          <h2 className="text-2xl md:text-[28px] font-bold text-[#1B1B1B] mb-6 text-center">
            Контакты
          </h2>
          
          <div className="space-y-6">
            {/* Блок 1: Интересует подключение? */}
            <div className="bg-[#F8F9FA] rounded-[16px] p-6">
              <h3 className="font-semibold text-lg text-[#1B1B1B] mb-3">Интересует подключение?</h3>
              <div className="flex items-center mb-2">
                <div className="w-12 h-12 bg-[#174A8D] rounded-full flex items-center justify-center mr-3">
                  <svg width={20} height={20} fill="none" viewBox="0 0 24 24">
                    <path d="M8 9.5C8 8.11929 9.11929 7 10.5 7H13.5C14.8807 7 16 8.11929 16 9.5V14.5C16 15.8807 14.8807 17 13.5 17H10.5C9.11929 17 8 15.8807 8 14.5V9.5Z" fill="#fff"/>
                  </svg>
                </div>
                <div>
                  <a href="tel:+79956738579" className="text-xl font-bold text-[#174A8D] hover:underline block" style={{letterSpacing: 0.7}}>
                    8 995 673-85-79
                  </a>
                  <div className="text-sm text-[#6E6E6E]">Звонок бесплатный по РФ</div>
                </div>
              </div>
            </div>

            {/* Блок 2: Нужна техподдержка? */}
            <div className="bg-[#F8F9FA] rounded-[16px] p-6">
              <h3 className="font-semibold text-lg text-[#1B1B1B] mb-3">Нужна техподдержка?</h3>
              <div className="flex items-center mb-2">
                <div className="w-12 h-12 bg-[#174A8D] rounded-full flex items-center justify-center mr-3">
                  <svg width={20} height={20} fill="none" viewBox="0 0 24 24">
                    <path d="M8 9.5C8 8.11929 9.11929 7 10.5 7H13.5C14.8807 7 16 8.11929 16 9.5V14.5C16 15.8807 14.8807 17 13.5 17H10.5C9.11929 17 8 15.8807 8 14.5V9.5Z" fill="#fff"/>
                  </svg>
                </div>
                <div>
                  <a href="tel:+78001000800" className="text-xl font-bold text-[#174A8D] hover:underline block" style={{letterSpacing: 0.7}}>
                    8 800 100-08-00
                  </a>
                  <div className="text-sm text-[#6E6E6E]">Звонок бесплатный по РФ</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// tailwind: добавьте @keyframes fadeSlide {0%{opacity:0;transform:translateY(-10px);}100%{opacity:1;transform:none;}} и класс animate-fadeSlide
// для xs-адаптива используйте media-запросы или tailwind breakpoints (<640px — bottom-0 left-0 w-full rounded-t-2xl p-4)