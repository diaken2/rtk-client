"use client";

import React, { useState, useEffect, useRef } from 'react';
import InputMask from 'react-input-mask';
import { useRouter } from 'next/navigation';
import { submitLead } from '@/lib/submitLead';
import { useSupportOnly } from '@/context/SupportOnlyContext';

interface TariffExpertFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TariffExpertForm({ isOpen, onClose }: TariffExpertFormProps) {
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const { isSupportOnly } = useSupportOnly();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitted(true);

    try {
      const result = await submitLead({
        type: 'Консультация специалиста по тарифам',
        phone: phone,
        address: address,
        comment: comment,
      });

      if (result.success) {
        setTimeout(() => {
          setSubmitted(false);
          setAddress('');
          setPhone('');
          setComment('');
          onClose();
          router.push('/complete');
        }, 2000);
      } else {
        console.error('Failed to submit lead:', result.error);
        // В случае ошибки все равно показываем успех пользователю
        setTimeout(() => {
          setSubmitted(false);
          setAddress('');
          setPhone('');
          setComment('');
          onClose();
          router.push('/complete');
        }, 2000);
      }
    } catch (error) {
      console.error('Error submitting lead:', error);
      // В случае ошибки все равно показываем успех пользователю
      setTimeout(() => {
        setSubmitted(false);
        setAddress('');
        setPhone('');
        setComment('');
        onClose();
        router.push('/complete');
      }, 2000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-45 flex items-center justify-center z-[1000] p-4">
      <div
        className={
          isMobile
            ? "fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-[1001] overflow-y-auto"
            : "w-[500px] max-w-[90vw] bg-white rounded-[24px] relative shadow-xl"
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

        <div className={isMobile ? "p-4" : "p-8"}>
          <h2 className="text-2xl md:text-[28px] font-bold text-[#1B1B1B] mb-6 text-center">
            Специалист поможет подобрать тариф
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[#1B1B1B] mb-2 font-medium text-lg">Адрес</label>
              <input
                type="text"
                placeholder="ул. Ленина, д. 1"
                className="w-full h-14 rounded-[28px] border-2 border-[#C5C5C5] bg-white px-4 text-lg focus:border-[#FF4D15] focus:ring-4 focus:ring-[#FFF4F0] outline-none transition-all placeholder-[#B3B3B3]"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label className="block text-[#1B1B1B] mb-2 font-medium text-lg">Телефон</label>
              <InputMask
                mask="+7 (999) 999-99-99"
                maskChar={null}
                type="tel"
                value={phone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
                required
              >
                {(inputProps: any) => (
                  <input
                    {...inputProps}
                    className="w-full h-14 rounded-[28px] border-2 border-[#C5C5C5] bg-white px-4 text-lg focus:border-[#FF4D15] focus:ring-4 focus:ring-[#FFF4F0] outline-none transition-all placeholder-[#B3B3B3]"
                    placeholder="+7 (___) ___-__-__"
                  />
                )}
              </InputMask>
            </div>
            
            <div>
              <label className="block text-[#1B1B1B] mb-2 font-medium text-lg">Комментарий</label>
              <textarea
                placeholder="Опишите ваши предпочтения"
                className="w-full rounded-[16px] border-2 border-[#C5C5C5] bg-white px-4 py-3 text-lg focus:border-[#FF4D15] focus:ring-4 focus:ring-[#FFF4F0] outline-none transition-all placeholder-[#B3B3B3] resize-none"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
              />
            </div>
            
            <button 
              type="submit"
              disabled={submitted || isSubmitting}
              className={`w-full h-14 rounded-[28px] font-semibold text-lg transition-all duration-300 ${
                !submitted && !isSubmitting
                  ? 'bg-[#FF4D15] text-white hover:bg-[#E34612] shadow-md hover:shadow-lg transform hover:-translate-y-0.5' 
                  : 'bg-[#BFBFBF] text-white cursor-not-allowed'
              }`}
            >
              {submitted ? 'Отправлено!' : isSubmitting ? 'Отправляем...' : 'Получить консультацию'}
            </button>
          </form>
          
          <p className="text-xs text-[#6E6E6E] text-center mt-6">
            Отправляя, вы соглашаетесь с <button type="button" className="underline text-[#174A8D]">политикой обработки данных</button>
          </p>
        </div>
      </div>
    </div>
  );
} 