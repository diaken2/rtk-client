"use client";
import React, { useState, useEffect, useRef } from 'react';
import InputMask from 'react-input-mask';
import { useRouter } from 'next/navigation';
import { submitLead } from '@/lib/submitLead';
import { useSupportOnly } from '@/context/SupportOnlyContext';
import Link from 'next/link';

interface ConnectionFormProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TimeSlot {
  value: string;
  label: string;
}

export default function ConnectionForm({ isOpen, onClose }: ConnectionFormProps) {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const [touched, setTouched] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [errors, setErrors] = useState<{ phone?: string; name?: string }>({});
  const router = useRouter();
  const { isSupportOnly } = useSupportOnly();
  const modalRef = useRef<HTMLDivElement>(null);
  const timeDropdownRef = useRef<HTMLDivElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const [shouldOpenUp, setShouldOpenUp] = useState(false);

  // Определение мобильного устройства
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Генерация временных слотов на основе текущего времени
  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const slots: TimeSlot[] = [];

      // Определяем рабочее время (6:00-21:00)
      const isWorkingHours = currentHour >= 6 && currentHour < 21;

      // Вне рабочего времени (21:00-6:00)
      if (!isWorkingHours) {
        slots.push({
          value: 'out-of-hours',
          label: 'Перезвоним в рабочее время'
        });
        
        // Добавляем утренние слоты на завтра
        for (let hour = 6; hour <= 11; hour++) {
          slots.push({
            value: `tomorrow-${hour}`,
            label: `завтра с ${hour.toString().padStart(2, '0')}:00 до ${(hour + 1).toString().padStart(2, '0')}:00`
          });
        }
        
        setTimeSlots(slots);
        setSelectedTime('out-of-hours');
        return;
      }

      // Рабочее время (6:00-21:00)
      // 1. ASAP вариант
      slots.push({
        value: 'asap',
        label: 'Перезвоним в течение 15 минут'
      });

      // 2. Слоты на сегодня (каждые 15 минут до конца рабочего дня)
      let slotHour = currentHour;
      let slotMinute = Math.ceil(currentMinute / 15) * 15;
      
      if (slotMinute === 60) {
        slotHour += 1;
        slotMinute = 0;
      }
      
      while (slotHour < 21 && slots.length < 8) {
        let endMinute = slotMinute + 15;
        let endHour = slotHour;
        
        if (endMinute >= 60) {
          endHour += 1;
          endMinute = endMinute - 60;
        }
        
        // Пропускаем слоты, которые заканчиваются после 21:00
        if (endHour > 21 || (endHour === 21 && endMinute > 0)) {
          break;
        }
        
        slots.push({
          value: `today-${slotHour}-${slotMinute}`,
          label: `сегодня ${slotHour.toString().padStart(2, '0')}:${slotMinute.toString().padStart(2, '0')}–${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`
        });
        
        // Переходим к следующему слоту
        slotMinute += 15;
        if (slotMinute >= 60) {
          slotHour += 1;
          slotMinute = 0;
        }
      }

      // 3. Слоты на завтра (если не набрали 8 пунктов)
      if (slots.length < 8) {
        for (let hour = 6; hour <= 11; hour++) {
          if (slots.length >= 8) break;
          slots.push({
            value: `tomorrow-${hour}`,
            label: `завтра ${hour.toString().padStart(2, '0')}:00–${(hour + 1).toString().padStart(2, '0')}:00`
          });
        }
      }

      setTimeSlots(slots);
      setSelectedTime('asap');
    }
  }, [isOpen]);

  // Обработка клика вне модалки и дропдауна
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
      if (timeDropdownRef.current && !timeDropdownRef.current.contains(event.target as Node)) {
        setIsTimeDropdownOpen(false);
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

  useEffect(() => {
    if (isTimeDropdownOpen && timeDropdownRef.current) {
      const rect = timeDropdownRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setShouldOpenUp(spaceBelow < 350);
    }
  }, [isTimeDropdownOpen]);

  const validateField = (field: 'phone' | 'name', value: string) => {
    if (field === 'phone') {
      const phoneRegex = /^\(\d{3}\)\s?\d{3}-\d{2}-\d{2}$/;
      if (!phoneRegex.test(value)) {
        setErrors(prev => ({ ...prev, phone: 'Введите корректный номер телефона' }));
        return false;
      }
    } else if (field === 'name') {
      const nameRegex = /^[А-ЯЁа-яё\s-]{2,30}$/;
      if (!nameRegex.test(value.trim())) {
        setErrors(prev => ({ ...prev, name: 'Только кириллические символы' }));
        return false;
      }
    }
    setErrors(prev => ({ ...prev, [field]: undefined }));
    return true;
  };

  const isValidPhone = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/.test(phone);
  const isValidName = /^[А-ЯЁа-яё\s-]{2,30}$/.test(name.trim());
  const isFormValid = isValidPhone && isValidName && selectedTime;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    
    // Валидация всех полей
    const isPhoneValid = validateField('phone', phone);
    const isNameValid = validateField('name', name);
    
    if (!isPhoneValid || !isNameValid || !selectedTime) return;

    setIsSubmitting(true);
    setSubmitted(true);

    try {
      const selectedSlot = timeSlots.find(slot => slot.value === selectedTime);
      const result = await submitLead({
        type: 'Заявка на подключение',
        name: name,
        phone: phone,
        callTime: selectedSlot?.label || selectedTime,
      });

      if (result.success) {
        setTimeout(() => {
          setSubmitted(false);
          setPhone('');
          setName('');
          setSelectedTime('');
          setTouched(false);
          onClose();
          router.push('/complete');
        }, 2000);
      } else {
        console.error('Failed to submit lead:', result.error);
        setTimeout(() => {
          setSubmitted(false);
          setPhone('');
          setName('');
          setSelectedTime('');
          setTouched(false);
          onClose();
          router.push('/complete');
        }, 2000);
      }
    } catch (error) {
      console.error('Error submitting lead:', error);
      setTimeout(() => {
        setSubmitted(false);
        setPhone('');
        setName('');
        setSelectedTime('');
        setTouched(false);
        onClose();
        router.push('/complete');
      }, 2000);
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <h2 className="text-2xl md:text-[28px] font-bold text-[#1B1B1B] mb-2 text-center">
            Заявка на подключение
          </h2>
          <p className="mb-6 text-center text-[#6E6E6E] text-lg">
            Перезвоним для уточнения деталей<br/>и согласования времени установки
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[#1B1B1B] mb-2 font-medium flex items-center">
                Телефон
                {errors.phone && (
                  <span className="ml-2 text-xs text-red-500 flex items-center">
                    <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                    </svg>
                    {errors.phone}
                  </span>
                )}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 font-semibold text-[#1B1B1B] z-10">
                  +7
                </span>
                <InputMask
                  mask="(999) 999-99-99"
                  value={phone}
                  inputRef={phoneInputRef}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setPhone(e.target.value);
                    if (errors.phone) validateField('phone', e.target.value);
                  }}
                  onBlur={() => validateField('phone', phone)}
                  className={`w-full h-12 pl-14 pr-5 border rounded-[36px] text-lg transition-all ${
                    errors.phone 
                      ? 'border-2 border-[#E63946]' 
                      : 'border border-[#C5C5C5] hover:border-[#9C9C9C] focus:border-2 focus:border-[#FF4D15] focus:shadow-[0_0_0_2px_rgba(255,77,21,0.25)]'
                  }`}
                  placeholder="(___) ___-__-__"
                  type="tel"
                  autoComplete="tel"
                  aria-invalid={!!errors.phone}
                />
              </div>
            </div>

            <div>
              <label className="block text-[#1B1B1B] mb-2 font-medium flex items-center">
                Имя
                {errors.name && (
                  <span className="ml-2 text-xs text-red-500 flex items-center">
                    <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                    </svg>
                    {errors.name}
                  </span>
                )}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setName(e.target.value);
                  if (errors.name) validateField('name', e.target.value);
                }}
                onBlur={() => validateField('name', name)}
                className={`w-full h-12 px-5 border rounded-[36px] text-lg transition-all placeholder-[#B3B3B3] ${
                  errors.name 
                    ? 'border-2 border-[#E63946]' 
                    : 'border border-[#C5C5C5] hover:border-[#9C9C9C] focus:border-2 focus:border-[#FF4D15] focus:shadow-[0_0_0_2px_rgba(255,77,21,0.25)]'
                }`}
                placeholder="Имя"
                autoComplete="name"
                aria-invalid={!!errors.name}
              />
            </div>

            <div className="relative" ref={timeDropdownRef}>
              <label className="block text-[#1B1B1B] mb-2 font-medium">Время звонка</label>
              <button
                type="button"
                onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
                className={`w-full inline-flex items-center justify-between gap-2 text-base cursor-pointer p-3 border rounded-[36px] hover:border-[#9C9C9C] transition-colors
                  ${selectedTime === 'asap' ? 'text-[#0F191E]' : 'text-[#FF4D15] font-semibold'} ${
                  isTimeDropdownOpen ? 'border-[#FF4D15] border-2' : 'border-[#C5C5C5]'
                }`}
                style={{ background: 'none', outline: 'none', boxShadow: 'none' }}
              >
                <span>{timeSlots.find(slot => slot.value === selectedTime)?.label || 'Выберите время'}</span>
                <svg 
                  className={`w-6 h-6 transition-transform duration-200 ${isTimeDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none" 
                  viewBox="0 0 32 32"
                >
                  <path d="M16.0008 19.6668C15.8674 19.6668 15.7452 19.6445 15.6341 19.6001C15.523 19.5557 15.423 19.4779 15.3341 19.3668L9.00078 13.0334C8.86745 12.9001 8.80078 12.7223 8.80078 12.5001C8.80078 12.2779 8.86745 12.1001 9.00078 11.9668C9.17856 11.789 9.36189 11.7112 9.55078 11.7334C9.73967 11.7557 9.91189 11.8334 10.0674 11.9668L16.0008 17.9001L21.9341 11.9668C22.0674 11.8334 22.2452 11.7612 22.4674 11.7501C22.6897 11.739 22.8674 11.8112 23.0008 11.9668C23.1786 12.1223 23.2563 12.3057 23.2341 12.5168C23.2119 12.7279 23.1341 12.9112 23.0008 13.0668L16.6674 19.3668C16.5786 19.4779 16.4786 19.5557 16.3674 19.6001C16.2563 19.6445 16.1341 19.6668 16.0008 19.6668Z" fill="#0F191E"/>
                </svg>
              </button>

              {isTimeDropdownOpen && (
                <div className={`absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-lg py-2 z-20 ${
                  shouldOpenUp ? 'bottom-full mb-2' : 'top-full'
                } max-h-[50vh] overflow-y-auto border border-gray-200`}
                >
                  {timeSlots.map((slot) => (
                    <button
                      key={slot.value}
                      type="button"
                      onClick={() => {
                        setSelectedTime(slot.value);
                        setIsTimeDropdownOpen(false);
                      }}
                      className={`w-full px-6 py-3 text-left transition-colors ${
                        selectedTime === slot.value 
                          ? 'bg-[#FFF4F0] text-[#FF4D15] font-semibold' 
                          : 'text-[#0F191E] hover:bg-gray-100'
                      }`}
                      role="option"
                      aria-selected={selectedTime === slot.value}
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={!isFormValid || submitted || isSubmitting}
              className={`w-full h-14 rounded-[36px] text-lg font-semibold transition-all duration-300 flex items-center justify-center mt-8 ${
                isFormValid && !submitted && !isSubmitting 
                  ? 'bg-[#FF4D15] text-white hover:bg-[#E34612] shadow-md hover:shadow-lg transform hover:-translate-y-0.5' 
                  : 'bg-gray-200 text-gray-500'
              }`}
              aria-disabled={!isFormValid || submitted || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Отправка...
                </>
              ) : submitted ? (
                'Отправлено!'
              ) : (
                'Получить консультацию'
              )}
            </button>
          </form>
          
          <p className="text-xs text-[#6E6E6E] text-center mt-6">
            Отправляя, вы соглашаетесь с <Link href="/privacy" className="underline text-[#174A8D]">политикой обработки данных</Link>
          </p>
        </div>
      </div>
    </div>
  );
}