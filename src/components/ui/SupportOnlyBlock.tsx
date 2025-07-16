import React from 'react';
import { useSupportOnly } from '@/context/SupportOnlyContext';

interface SupportOnlyBlockProps {
  children: React.ReactNode;
  isQuestionsBlock?: boolean;
}

export default function SupportOnlyBlock({ children, isQuestionsBlock = false }: SupportOnlyBlockProps) {
  const { isSupportOnly, setSupportOnly } = useSupportOnly();

  // Специальная логика для QuestionsBlock
  React.useEffect(() => {
    if (isQuestionsBlock && typeof window !== 'undefined') {
      // Проверяем, есть ли в DOM элементы инфоблока поддержки
      const supportInfoElements = document.querySelectorAll('[data-support-info]');
      if (supportInfoElements.length > 0) {
        setSupportOnly(true);
      }
    }
  }, [isQuestionsBlock, setSupportOnly]);

  // Для QuestionsBlock показываем SupportOnlyBlock только если НЕ показывается инфоблок поддержки
  if (isQuestionsBlock && typeof window !== 'undefined') {
    const supportInfoElements = document.querySelectorAll('[data-support-info]');
    if (supportInfoElements.length > 0) {
      return <>{children}</>;
    }
  }

  if (!isSupportOnly) {
    return <>{children}</>;
  }

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-gray-100">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
          </svg>
        </div>
        
        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
          Вы являетесь действующим абонентом Ростелеком
        </h3>
        
        <p className="text-gray-600 mb-6 leading-relaxed">
          Мы не сможем ответить на вопросы по действующему подключению или сменить ваш текущий тариф.
        </p>
        
        <div className="bg-blue-50 rounded-xl p-4 mb-6">
          <p className="text-gray-700 mb-2 font-medium">
            Рекомендуем позвонить по номеру
          </p>
          <a 
            href="tel:88001000800" 
            className="text-2xl md:text-3xl font-bold text-blue-600 tracking-wider block mb-1 hover:underline"
          >
            8 800 100-08-00
          </a>
          <p className="text-sm text-gray-500">Звонок бесплатный по РФ</p>
        </div>
        
        <div className="text-sm text-gray-500">
          или узнать информацию в{' '}
          <a 
            href="https://lk.rt.ru/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 underline hover:text-blue-700"
          >
            личном кабинете
          </a>
        </div>
      </div>
    </div>
  );
} 