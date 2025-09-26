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
  selectedTariff?: any; // Добавьте это (опционально)
}
interface TimeSlot {
  value: string;
  label: string;
}

export default function ConnectionForm({ isOpen,selectedTariff, onClose }: ConnectionFormProps) {
  // показываем форму сразу, убираем выбор "Вас интересует"
  const [step, setStep] = useState<'form'>('form');
  // по умолчанию считаем, что это новое подключение
  const [requestType, setRequestType] = useState<'new' | 'support'>('new');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ phone?: string; name?: string }>({});
  const [isMobile, setIsMobile] = useState(false);
  const [shouldOpenUp, setShouldOpenUp] = useState(false);
  const router = useRouter();
  const { isSupportOnly, setSupportOnly } = useSupportOnly();
  const modalRef = useRef<HTMLDivElement>(null);
  const timeDropdownRef = useRef<HTMLDivElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  console.log("connectionformselectedtariff:", selectedTariff)
console.log('connectionform')
  // Определяем мобильное устройство
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Автофокус на поле телефона при открытии формы
  useEffect(() => {
    if (step === 'form' && phoneInputRef.current && isOpen) {
      setTimeout(() => {
        phoneInputRef.current?.focus();
      }, 300);
    }
  }, [step, isOpen]);

  // Генерация временных слотов
  useEffect(() => {
    if (isOpen && step === 'form') {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const slots: TimeSlot[] = [];

      const isWorkingHours = currentHour >= 6 && currentHour < 21;

      if (!isWorkingHours) {
        slots.push({
          value: 'out-of-hours',
          label: 'Перезвоним в рабочее время'
        });

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

      // ASAP вариант
      slots.push({
        value: 'asap',
        label: 'Перезвоним в течение 15 минут'
      });

      // Слоты на сегодня
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

        if (endHour > 21 || (endHour === 21 && endMinute > 0)) {
          break;
        }

        slots.push({
          value: `today-${slotHour}-${slotMinute}`,
          label: `сегодня ${slotHour.toString().padStart(2, '0')}:${slotMinute.toString().padStart(2, '0')}–${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`
        });

        slotMinute += 15;
        if (slotMinute >= 60) {
          slotHour += 1;
          slotMinute = 0;
        }
      }

      // Слоты на завтра
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
  }, [isOpen, step]);

  // Определяем направление открытия дропдауна и учитываем необходимую высоту
  useEffect(() => {
    if (isTimeDropdownOpen && timeDropdownRef.current) {
      const rect = timeDropdownRef.current.getBoundingClientRect();

      // примерная высота одного элемента (px)
      const itemHeight = 48;
      const maxVisibleItems = Math.min(timeSlots.length, 8);
      const requiredHeight = maxVisibleItems * itemHeight + 8; // паддинги

      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      // откроем наверх, если снизу недостаточно места и сверху места больше
      setShouldOpenUp(spaceBelow < requiredHeight && spaceAbove > spaceBelow);
    }
  }, [isTimeDropdownOpen, timeSlots]);

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

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Закрытие по Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  const validateField = (field: 'phone' | 'name', value: string) => {
    if (field === 'phone') {
      const cleanValue = value.replace(/\D/g, '');
      if (cleanValue.length !== 10) {
        setErrors(prev => ({ ...prev, phone: 'Введите 10 цифр' }));
        return false;
      }
    } else if (field === 'name') {
      const nameRegex = /^[А-ЯЁа-яё\s-]{2,30}$/;
      if (!nameRegex.test(value.trim())) {
        setErrors(prev => ({ ...prev, name: 'Только кириллица' }));
        return false;
      }
    }
    setErrors(prev => ({ ...prev, [field]: undefined }));
    return true;
  };

  const isValidPhone = /^\d{10}$/.test(phone.replace(/\D/g, ''));
  const isValidName = /^[А-ЯЁа-яё\s-]{2,30}$/.test(name.trim());
  const isFormValid = isValidPhone && isValidName && selectedTime;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isPhoneValid = validateField('phone', phone);
    const isNameValid = validateField('name', name);

    if (!isPhoneValid || !isNameValid || !selectedTime) return;

    setIsSubmitting(true);

    try {
      const selectedSlot = timeSlots.find(slot => slot.value === selectedTime);
      const cleanPhone = phone.replace(/\D/g, '');
      const fullPhone = `+7${cleanPhone}`;
 console.log('тариффы',{
        type: requestType === 'new' ? 'Заявка на подключение' : 'Вопрос по подключению',
        name: name,
        phone: fullPhone,
        callTime: selectedSlot?.label || selectedTime,
         tariffName: selectedTariff?.name || 'Не указан', // Добавьте название тарифа
      tariffPrice: selectedTariff?.price || 0, // Добавьте цену тарифа
      tariffSpeed: selectedTariff?.speed || 0, // Добавьте скорость тарифа
      })
      await submitLead({
        type: requestType === 'new' ? 'Заявка на подключение' : 'Вопрос по подключению',
        name: name,
        phone: fullPhone,
        callTime: selectedSlot?.label || selectedTime,
         tariffName: selectedTariff?.name || 'Не указан', // Добавьте название тарифа
      tariffPrice: selectedTariff?.price || 0, // Добавьте цену тарифа
      tariffSpeed: selectedTariff?.speed || 0, // Добавьте скорость тарифа
      });

     

      setTimeout(() => {
        setPhone('');
        setName('');
        setSelectedTime('');
        setRequestType('new');
        setStep('form');
        setErrors({});
        onClose();
        router.push('/complete');
      }, 1000);
    } catch (error) {
      console.error('Error submitting lead:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  if (isSupportOnly) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600"></div>

          <div className="p-6 text-center">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 12h-2v-2h2v2zm0-4h-2V6h2v4z"/>
              </svg>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-2">Вы являетесь действующим абонентом</h2>
            <p className="text-gray-600 text-sm mb-4">Для вопросов по текущему подключению обратитесь в поддержку</p>

            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <a href="tel:88001000800" className="text-lg font-bold text-blue-600 hover:text-blue-700 block mb-1">
                8 800 100-08-00
              </a>
              <p className="text-xs text-blue-500">Бесплатно по России</p>
            </div>

            <button
              onClick={onClose}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors w-full"
            >
              Понятно
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
      <div
        className={`
          bg-white relative overflow-visible
          ${isMobile 
            ? 'w-full max-w-lg rounded-t-2xl shadow-2xl bottom-0 fixed animate-slideUp max-h-[90vh] overflow-y-auto' 
            : 'w-full max-w-lg rounded-2xl shadow-2xl'
          }
        `}
        ref={modalRef}
      >
        {isMobile && (
          <div className="sticky top-0 bg-white py-4 px-4 flex justify-center border-b z-10">
            <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
          </div>
        )}

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 text-gray-500 text-lg hover:bg-gray-200 transition-colors flex items-center justify-center z-10"
        >
          ×
        </button>

        <div className="p-6">
          {/* Форма показывается сразу */}
          {step === 'form' && (
            <div>
              <div className="text-center mb-6">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12z"/>
                    <path d="M8 10h8v2H8zm0 3h8v2H8z"/>
                  </svg>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-1">Заявка на подключение</h2>
                <p className="text-gray-600 text-sm">
                  Перезвоним для уточнения деталей<br/>и согласования времени установки
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2 text-sm font-medium">Телефон</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 font-medium z-10">
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
                      className={`w-full h-12 pl-12 pr-3 border rounded-lg text-base transition-all ${
                        errors.phone 
                          ? 'border-red-400 bg-red-50' 
                          : 'border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200'
                      }`}
                      placeholder="(___) ___-__-__"
                      type="tel"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1 animate-fadeIn">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 mb-2 text-sm font-medium">Имя</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setName(e.target.value);
                      if (errors.name) validateField('name', e.target.value);
                    }}
                    onBlur={() => validateField('name', name)}
                    className={`w-full h-12 px-3 border rounded-lg text-base transition-all ${
                      errors.name 
                        ? 'border-red-400 bg-red-50' 
                        : 'border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200'
                    }`}
                    placeholder="Ваше имя"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1 animate-fadeIn">{errors.name}</p>
                  )}
                </div>

                <div className="relative" ref={timeDropdownRef}>
                  <label className="block text-gray-700 mb-2 text-sm font-medium">Время звонка</label>
                  <button
                    type="button"
                    onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
                    className="w-full h-12 px-3 border border-gray-300 rounded-lg text-left text-base hover:border-gray-400 transition-colors flex items-center justify-between bg-white"
                  >
                    <span className="whitespace-normal break-words">
                      {timeSlots.find(slot => slot.value === selectedTime)?.label || 'Выберите время'}
                    </span>
                    <svg 
                      className={`w-4 h-4 text-gray-500 transition-transform ${isTimeDropdownOpen ? 'rotate-180' : ''}`}
                      fill="none" 
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isTimeDropdownOpen && (
                    <div className={`absolute left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-20 max-h-[40vh] overflow-y-auto ${
                      shouldOpenUp ? 'bottom-full mb-1' : 'top-full'
                    }`}>
                      {timeSlots.map((slot) => (
                        <button
                          key={slot.value}
                          type="button"
                          onClick={() => {
                            setSelectedTime(slot.value);
                            setIsTimeDropdownOpen(false);
                          }}
                          className={`w-full px-4 py-3 text-left text-sm transition-colors ${
                            selectedTime === slot.value 
                              ? 'bg-orange-50 text-orange-700 font-medium' 
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          {slot.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!isFormValid || isSubmitting}
                  className={`w-full h-12 rounded-lg font-semibold transition-all duration-200 mt-2 ${
                    isFormValid && !isSubmitting
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 shadow-md hover:shadow-lg'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Отправка...
                    </div>
                  ) : (
                    'Получить консультацию'
                  )}
                </button>
              </form>

              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  Отправляя, вы соглашаетесь с{' '}
                  <Link href="/privacy" className="text-blue-600 hover:text-blue-800 underline">
                    политикой обработки данных
                  </Link>
                </p>
              </div>
            </div>
          )}
        </div>

        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-2px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes slideUp {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.2s ease-in-out;
          }
          .animate-slideUp {
            animation: slideUp 0.3s ease-out;
          }
        `}</style>
      </div>
    </div>
  );
}
