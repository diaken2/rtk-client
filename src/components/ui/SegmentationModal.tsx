import React, { useState, useEffect, useRef } from 'react';
import { useSupportOnly } from '@/context/SupportOnlyContext';

interface SegmentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNewConnection: () => void;
  onExistingConnection: () => void;
  selectedTariff: any; // Добавьте это
}
export default function SegmentationModal({ isOpen, onClose, selectedTariff, onNewConnection, onExistingConnection }: SegmentationModalProps) {
  const [step, setStep] = useState<'choose' | 'existing' | 'final'>('choose');
  const [existingChoice, setExistingChoice] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const { setSupportOnly } = useSupportOnly();
  const modalRef = useRef<HTMLDivElement>(null);

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

  // Если пользователь уже выбрал "действующий абонент" (вариант 3), всегда показываем финальное окно
  React.useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('rt_is_existing_abonent') === '1') {
      setStep('final');
      setSupportOnly(true);
    }
  }, [isOpen, setSupportOnly]);

  const handleExistingContinue = () => {
    if (existingChoice === 2) {
      // Сменить тариф без добавления услуг — показываем финальное окно и запоминаем в localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('rt_is_existing_abonent', '1');
      }
      setSupportOnly(true);
      setStep('final');
    } else if (existingChoice === 0 || existingChoice === 1) {
      onExistingConnection();
      onClose();
    }
  };

  const handleExistingClick = () => {
    setStep('existing');
  };

  React.useEffect(() => {
    if (step === 'final') {
      setSupportOnly(true);
    }
  }, [step, setSupportOnly]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-45 flex items-center justify-center z-[1000] p-4">
      <div
        className={
          isMobile
            ? "fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-[1001] overflow-y-auto"
            : "w-[560px] max-w-[90vw] bg-white rounded-[24px] p-8 md:p-10 relative shadow-xl"
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
          {step === 'choose' && (
            <div>
              <h2 className="text-2xl md:text-[28px] font-bold text-[#1B1B1B] mb-6 text-center">
                Новое подключение или уже подключены к Ростелеком?
              </h2>
              <div className="space-y-4">
                <button
                  className="w-full h-14 rounded-[28px] text-lg font-semibold transition-all duration-300 bg-[#FF4D15] text-white hover:bg-[#E34612] shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  onClick={() => {
                    onNewConnection();
                    onClose();
                  }}
                >
                  Новое подключение
                </button>
                <button
                  className="w-full h-14 rounded-[28px] text-lg font-semibold transition-all duration-300 border-2 border-[#FF4D15] text-[#FF4D15] hover:bg-[#FF4D15] hover:text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  onClick={handleExistingClick}
                >
                  Уже подключен к Ростелеком
                </button>
              </div>
            </div>
          )}

          {step === 'existing' && (
            <div>
              <h2 className="text-2xl md:text-[28px] font-bold text-[#1B1B1B] mb-6 text-center">
                Выберите вариант:
              </h2>
              <div className="space-y-3 mb-6">
                <button
                  className={`w-full text-left px-4 py-4 rounded-[16px] border-2 transition-all duration-300 font-medium text-base ${
                    existingChoice === 0 
                      ? 'border-[#FF4D15] bg-[#FFF4F0] text-[#FF4D15]' 
                      : 'border-[#C5C5C5] bg-white text-[#1B1B1B] hover:border-[#FF4D15]'
                  }`}
                  onClick={() => setExistingChoice(0)}
                  type="button"
                >
                  Переоформить договор на себя или оформить на новом адресе
                </button>
                <button
                  className={`w-full text-left px-4 py-4 rounded-[16px] border-2 transition-all duration-300 font-medium text-base ${
                    existingChoice === 1 
                      ? 'border-[#FF4D15] bg-[#FFF4F0] text-[#FF4D15]' 
                      : 'border-[#C5C5C5] bg-white text-[#1B1B1B] hover:border-[#FF4D15]'
                  }`}
                  onClick={() => setExistingChoice(1)}
                  type="button"
                >
                  Добавить домашний интернет, ТВ или мобильную связь в свой тариф
                </button>
                <button
                  className={`w-full text-left px-4 py-4 rounded-[16px] border-2 transition-all duration-300 font-medium text-base ${
                    existingChoice === 2 
                      ? 'border-[#FF4D15] bg-[#FFF4F0] text-[#FF4D15]' 
                      : 'border-[#C5C5C5] bg-white text-[#1B1B1B] hover:border-[#FF4D15]'
                  }`}
                  onClick={() => setExistingChoice(2)}
                  type="button"
                >
                  Сменить тариф без добавления услуг
                </button>
              </div>
              <button
                className={`w-full h-14 rounded-[28px] text-lg font-semibold transition-all duration-300 ${
                  existingChoice !== null
                    ? 'bg-[#FF4D15] text-white cursor-pointer hover:bg-[#E34612] shadow-md hover:shadow-lg transform hover:-translate-y-0.5' 
                    : 'bg-[#BFBFBF] text-white cursor-not-allowed'
                }`}
                disabled={existingChoice === null}
                onClick={handleExistingContinue}
              >
                Далее
              </button>
            </div>
          )}

          {step === 'final' && (
            <div>
              <h2 className="text-2xl md:text-[28px] font-bold text-[#1B1B1B] mb-4 text-center">
                Вы являетесь действующим абонентом Ростелеком
              </h2>
              <p className="text-lg leading-[26px] text-[#1B1B1B] mb-6 text-center">
                Мы не сможем ответить на вопросы по действующему подключению или сменить ваш текущий тариф.
              </p>
              <div className="bg-[#F8F9FA] rounded-[16px] p-6 mb-6">
                <div className="font-semibold mb-2 text-[#1B1B1B]">Для смены тарифа необходимо позвонить по номеру:</div>
                <a href="tel:88001000800" className="text-2xl md:text-[32px] font-bold text-[#174A8D] tracking-wider block mb-1 hover:underline">
                  8 800 100-08-00
                </a>
                <span className="text-sm text-[#6E6E6E] block mb-2">Звонок бесплатный по РФ</span>
                <div className="text-sm text-[#6E6E6E]">
                  или узнать информацию в <a href="https://lk.rt.ru/" target="_blank" rel="noopener noreferrer" className="underline text-[#174A8D]">личном кабинете</a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 