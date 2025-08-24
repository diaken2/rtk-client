import React, { useState, useEffect } from "react";
import InputMask from "react-input-mask";
import { useRouter } from "next/navigation";
import { submitLead } from '@/lib/submitLead';
import Image from 'next/image';
import { useSupportOnly } from '@/context/SupportOnlyContext';
import Link from 'next/link';

interface TimeSlot {
  value: string;
  label: string;
}

const categories = [
  { key: "connection", label: "Подключение" },
  { key: "support", label: "Поддержка" },
  { key: "other", label: "Другое" },
];

const houseTypes = [
  "Квартира",
  "Частный дом",
  "Офис"
];

const supportOptions = [
  "Оплата услуг",
  "Оборудование",
  "Не работает интернет/ТВ"
];

const otherOptions = [
  "Смена тарифа домашнего интернета (я абонент Ростелеком)",
  "Подключение ТВ или мобильной связи в мой тариф",
  "Другое"
];

const QuestionsBlock: React.FC = () => {
  const [category, setCategory] = useState<string | null>(null);
  const [houseType, setHouseType] = useState(houseTypes[0]);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [supportValue, setSupportValue] = useState<string | null>(null);
  const [otherValue, setOtherValue] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { setSupportOnly, isSupportOnly } = useSupportOnly();

  // Генерация временных слотов на основе текущего времени
  useEffect(() => {
    if (category === "connection" || (category === "other" && otherValue === otherOptions[1])) {
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
  }, [category, otherValue]);

  // Закрытие дропдауна при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const timeDropdown = document.querySelector('.time-dropdown');
      if (timeDropdown && !timeDropdown.contains(event.target as Node)) {
        setIsTimeDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isFormValid = phone.replace(/\D/g, "").length === 10 && name.trim().length > 1 && selectedTime;

  const showSupportInfo =
    (category === "support" && supportValue) ||
    (category === "other" && (otherValue === otherOptions[0] || otherValue === otherOptions[2]));

  const showOtherForm = category === "other" && otherValue === otherOptions[1];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitted(true);

    try {
      const selectedSlot = timeSlots.find(slot => slot.value === selectedTime);
      const result = await submitLead({
        type: `Вопросы - ${category}`,
        name: name,
        phone: phone,
        houseType: houseType,
        supportValue: supportValue || undefined,
        otherValue: otherValue || undefined,
        callTime: selectedSlot?.label || selectedTime,
      });

      if (result.success) {
        setTimeout(() => {
          setSubmitted(false);
          setPhone("");
          setName("");
          setCategory(null);
          setSupportValue(null);
          setOtherValue(null);
          setSelectedTime("");
          router.push('/complete');
        }, 2000);
      } else {
        console.error('Failed to submit lead:', result.error);
        setTimeout(() => {
          setSubmitted(false);
          setPhone("");
          setName("");
          setCategory(null);
          setSupportValue(null);
          setOtherValue(null);
          setSelectedTime("");
          router.push('/complete');
        }, 2000);
      }
    } catch (error) {
      console.error('Error submitting lead:', error);
      setTimeout(() => {
        setSubmitted(false);
        setPhone("");
        setName("");
        setCategory(null);
        setSupportValue(null);
        setOtherValue(null);
        setSelectedTime("");
        router.push('/complete');
      }, 2000);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (showSupportInfo) {
      setSupportOnly(true);
    }
  }, [showSupportInfo, setSupportOnly]);

  if (isSupportOnly) {
    return (
      <section className="w-full bg-[#f7f7f9] py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white rounded-3xl shadow-lg flex flex-col-reverse md:flex-row overflow-hidden min-h-[420px] md:min-h-[420px]">
            <div className="w-full md:w-[380px] flex-shrink-0 flex items-end justify-center bg-gray-50 order-1 md:order-none">
              <Image
                src="/questions/operator.png"
                alt="Оператор"
                className="object-cover w-full h-auto md:h-auto md:max-h-none max-h-64 md:max-w-none"
                width={220}
                height={220}
              />
            </div>
            <div className="flex-1 flex flex-col justify-start items-stretch p-8 md:p-12 order-2 md:order-none">
              <div className="w-full max-w-2xl h-full flex flex-col justify-center">
                <div className="flex flex-col justify-center h-full animate-fade-in" data-support-info>
                  <h2 className="text-2xl md:text-3xl font-bold mb-2 text-left">Вы являетесь действующим абонентом Ростелеком</h2>
                  <p className="text-base text-gray-500 mb-4 text-left">Мы не сможем ответить на вопросы по действующему подключению или сменить ваш текущий тариф</p>
                  <div className="mb-2 text-left">
                    <span className="text-base">Рекомендуем позвонить по номеру</span><br />
                    <a href="tel:88001000800" className="text-2xl md:text-3xl font-bold text-[#2250a7] hover:underline">8 800 100-08-00</a>
                  </div>
                  <div className="text-base text-left">
                    или узнать информацию в <a href="#" className="text-[#2250a7] underline">личном кабинете</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full bg-[#f7f7f9] py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-3xl shadow-lg flex flex-col-reverse md:flex-row overflow-hidden min-h-[420px] md:min-h-[420px]">
          {/* Фото оператора */}
          <div className="w-full md:w-[380px] flex-shrink-0 flex items-end justify-center bg-gray-50 order-1 md:order-none">
            <Image
              src="/questions/operator.png"
              alt="Оператор"
              className="object-cover w-full h-auto md:h-auto md:max-h-none max-h-64 md:max-w-none"
              width={220}
              height={220}
            />
          </div>
          {/* Форма/инфо */}
          <div className="flex-1 flex flex-col justify-start items-stretch p-8 md:p-12 order-2 md:order-none">
            <div className="w-full max-w-2xl h-full flex flex-col justify-start">
              {!(showSupportInfo || showOtherForm) ? (
                <>
                  <p className="text-2xl font-bold mb-1 text-left leading-tight">Остались вопросы?</p>
                  <span className="text-base font-normal text-gray-400 mb-3 block text-left">Выберите вариант</span>
                  <div className="flex gap-2 mb-5 overflow-x-auto pb-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.key}
                        className={`
                          flex-shrink-0 px-1.5 py-1.5 md:px-7 md:py-3
                          rounded-full border-2 font-normal md:font-semibold text-xs md:text-base transition focus:outline-none
                          ${category === cat.key
                            ? "bg-[#ff5c00] border-[#ff5c00] text-white"
                            : "border-[#ff5c00] text-[#ff5c00] bg-white"}
                        `}
                        onClick={() => {
                          setCategory(cat.key);
                          setSupportValue(null);
                          setOtherValue(null);
                          setSelectedTime("");
                        }}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                  {/* SUPPORT: show options */}
                  {category === "support" && (
                    <div className="flex flex-col gap-3 mb-4">
                      {supportOptions.map((opt) => (
                        <label key={opt} className="flex items-center cursor-pointer select-none">
                          <span
                            className={`w-6 h-6 flex items-center justify-center rounded-full border-2 mr-2 transition-all duration-150 ${
                              supportValue === opt
                                ? "border-[#ff5c00] bg-[#ff5c00]"
                                : "border-gray-300 bg-white"
                            }`}
                          >
                            {supportValue === opt && (
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <circle cx="8" cy="8" r="5" fill="#fff" />
                              </svg>
                            )}
                          </span>
                          <input
                            type="radio"
                            name="supportOption"
                            value={opt}
                            checked={supportValue === opt}
                            onChange={() => setSupportValue(opt)}
                            className="hidden"
                          />
                          <span className="text-base font-normal text-gray-700">{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  {/* OTHER: show options */}
                  {category === "other" && (
                    <div className="flex flex-col gap-3 mb-4">
                      {otherOptions.map((opt) => (
                        <label key={opt} className="flex items-start cursor-pointer select-none">
                          <span
                            className={`
                              w-5 h-5 md:w-6 md:h-6 flex items-center justify-center rounded-full border-2 mr-2 mt-1 transition-all duration-150
                              ${otherValue === opt ? "border-[#ff5c00] bg-[#ff5c00]" : "border-gray-300 bg-white"}
                            `}
                          >
                            {otherValue === opt && (
                              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                                <circle cx="8" cy="8" r="5" fill="#fff" />
                              </svg>
                            )}
                          </span>
                          <input
                            type="radio"
                            name="otherOption"
                            value={opt}
                            checked={otherValue === opt}
                            onChange={() => setOtherValue(opt)}
                            className="hidden"
                          />
                          <span className="text-xs md:text-base font-normal text-gray-700 break-words text-left">{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  {/* CONNECTION: show form */}
                  {category === "connection" && (
                    <form className="flex flex-col gap-4 animate-fade-in" autoComplete="off" onSubmit={handleSubmit}>
                      {/* Тип жилья */}
                      <div className="flex gap-2 mb-2 overflow-x-auto pb-2">
                        {houseTypes.map((type) => (
                          <label key={type} className="flex items-center cursor-pointer select-none flex-shrink-0">
                            <span
                              className={`
                                w-5 h-5 md:w-6 md:h-6 flex items-center justify-center rounded-full border-2 mr-2 transition-all duration-150
                                ${houseType === type ? "border-[#ff5c00] bg-[#ff5c00]" : "border-gray-300 bg-white"}
                              `}
                            >
                              {houseType === type && (
                                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                                  <circle cx="8" cy="8" r="5" fill="#fff" />
                                </svg>
                              )}
                            </span>
                            <input
                              type="radio"
                              name="houseType"
                              value={type}
                              checked={houseType === type}
                              onChange={() => setHouseType(type)}
                              className="hidden"
                            />
                            <span className={`text-xs md:text-base font-medium ${houseType === type ? "text-[#ff5c00]" : "text-gray-700"} break-words text-left`}>
                              {type}
                            </span>
                          </label>
                        ))}
                      </div>
                      {/* Поля ввода */}
                      <div className="flex flex-col md:flex-row gap-4 items-end w-full">
                        <div className="w-full md:flex-1">
                          <label className="block text-gray-500 mb-1 text-base">Введите телефон</label>
                          <div className="flex items-center rounded-full border border-gray-300 bg-white overflow-hidden w-full">
                            <span className="px-4 py-3 text-base text-[#2196f3] bg-[#f5f7fa] font-medium">+7</span>
                            <InputMask
                              mask="(999) 999-99-99"
                              value={phone}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
                              className="bg-transparent outline-none flex-1 text-base px-2 py-3 w-full"
                              placeholder="(___) ___-__-__"
                              type="tel"
                              autoComplete="tel"
                            />
                          </div>
                        </div>
                        <div className="w-full md:flex-1">
                          <label className="block text-gray-500 mb-1 text-base">Введите имя</label>
                          <input
                            type="text"
                            value={name}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                            className="w-full rounded-full border border-gray-300 bg-white px-4 py-3 text-base outline-none"
                            placeholder="Имя"
                            autoComplete="name"
                          />
                        </div>
                        <button
                          type="submit"
                          className={`w-full md:w-auto px-8 py-3 rounded-full text-base font-bold transition ml-0 md:ml-4 ${
                            isFormValid && !submitted && !isSubmitting
                              ? "bg-[#ff5c00] text-white"
                              : "bg-gray-300 text-white cursor-not-allowed"
                          }`}
                          disabled={!isFormValid || submitted || isSubmitting}
                        >
                          {submitted ? 'Отправлено!' : isSubmitting ? 'Отправляем...' : 'Жду звонка'}
                        </button>
                      </div>
                      {/* Выбор времени звонка */}
                      <div className="flex items-center gap-2 mt-1 relative time-dropdown">
                        <button
                          type="button"
                          onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
                          className="text-gray-500 text-base hover:underline flex items-center gap-1"
                        >
                          {timeSlots.find(slot => slot.value === selectedTime)?.label || 'Перезвоним в течение 15 минут'}
                          <svg 
                            className={`w-4 h-4 transition-transform ${isTimeDropdownOpen ? 'rotate-180' : ''}`}
                            fill="none" 
                            viewBox="0 0 24 24"
                          >
                            <path d="M7 10l5 5 5-5" stroke="#bdbdbd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>

                        {isTimeDropdownOpen && (
                          <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg py-2 z-20 min-w-[250px] max-h-[200px] overflow-y-auto border border-gray-200">
                            {timeSlots.map((slot) => (
                              <button
                                key={slot.value}
                                type="button"
                                onClick={() => {
                                  setSelectedTime(slot.value);
                                  setIsTimeDropdownOpen(false);
                                }}
                                className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                                  selectedTime === slot.value 
                                    ? 'bg-[#FFF4F0] text-[#FF4D15] font-semibold' 
                                    : 'text-[#0F191E] hover:bg-gray-100'
                                }`}
                              >
                                {slot.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-2 text-right">
                        Отправляя заявку, вы соглашаетесь с <Link href="/privacy" className="underline text-[#2196f3]">политикой обработки данных</Link>
                      </p>
                    </form>
                  )}
                </>
              ) : showOtherForm ? (
                // OTHER FORM BLOCK
                <>
                  <p className="text-2xl font-bold mb-1 text-left leading-tight">Остались вопросы?</p>
                  <span className="text-base font-normal text-gray-400 mb-3 block text-left">Подключение дополнительных услуг</span>
                  <form className="flex flex-col gap-4 animate-fade-in" autoComplete="off" onSubmit={handleSubmit}>
                    <div className="flex flex-col md:flex-row gap-4 items-end w-full">
                      <div className="w-full md:flex-1">
                        <label className="block text-gray-500 mb-1 text-base">Введите телефон</label>
                        <div className="flex items-center rounded-full border border-gray-300 bg-white overflow-hidden w-full">
                          <span className="px-4 py-3 text-base text-[#2196f3] bg-[#f5f7fa] font-medium">+7</span>
                          <InputMask
                            mask="(999) 999-99-99"
                            value={phone}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
                            className="bg-transparent outline-none flex-1 text-base px-2 py-3 w-full"
                            placeholder="(___) ___-__-__"
                            type="tel"
                            autoComplete="tel"
                          />
                        </div>
                      </div>
                      <div className="w-full md:flex-1">
                        <label className="block text-gray-500 mb-1 text-base">Введите имя</label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                          className="w-full rounded-full border border-gray-300 bg-white px-4 py-3 text-base outline-none"
                          placeholder="Имя"
                          autoComplete="name"
                        />
                      </div>
                      <button
                        type="submit"
                        className={`w-full md:w-auto px-8 py-3 rounded-full text-base font-bold transition ml-0 md:ml-4 ${
                          isFormValid
                            ? "bg-[#ff5c00] text-white"
                            : "bg-gray-300 text-white cursor-not-allowed"
                        }`}
                        disabled={!isFormValid}
                      >
                        Жду звонка
                      </button>
                    </div>
                    {/* Выбор времени звонка */}
                    <div className="flex items-center gap-2 mt-1 relative time-dropdown">
                      <button
                        type="button"
                        onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
                        className="text-gray-500 text-base hover:underline flex items-center gap-1"
                      >
                        {timeSlots.find(slot => slot.value === selectedTime)?.label || 'Перезвоним в течение 15 минут'}
                        <svg 
                          className={`w-4 h-4 transition-transform ${isTimeDropdownOpen ? 'rotate-180' : ''}`}
                          fill="none" 
                          viewBox="0 0 24 24"
                        >
                          <path d="M7 10l5 5 5-5" stroke="#bdbdbd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>

                      {isTimeDropdownOpen && (
                        <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg py-2 z-20 min-w-[250px] max-h-[200px] overflow-y-auto border border-gray-200">
                          {timeSlots.map((slot) => (
                            <button
                              key={slot.value}
                              type="button"
                              onClick={() => {
                                setSelectedTime(slot.value);
                                setIsTimeDropdownOpen(false);
                              }}
                              className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                                selectedTime === slot.value 
                                  ? 'bg-[#FFF4F0] text-[#FF4D15] font-semibold' 
                                  : 'text-[#0F191E] hover:bg-gray-100'
                              }`}
                            >
                              {slot.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-2 text-right">
                      Отправляя заявку, вы соглашаетесь с <Link href="/privacy" className="underline text-[#2196f3]">политикой обработки данных</Link>
                    </p>
                  </form>
                </>
              ) : (
                // SUPPORT/OTHER INFO BLOCK
                <div className="flex flex-col justify-center h-full animate-fade-in" data-support-info>
                  <h2 className="text-2xl md:text-3xl font-bold mb-2 text-left">Вы являетесь действующим абонентом Ростелеком</h2>
                  <p className="text-base text-gray-500 mb-4 text-left">Мы не сможем ответить на вопросы по действующему подключению или сменить ваш текущий тариф</p>
                  <div className="mb-2 text-left">
                    <span className="text-base">Рекомендуем позвонить по номеру</span><br />
                    <a href="tel:88001000800" className="text-2xl md:text-3xl font-bold text-[#2250a7] hover:underline">8 800 100-08-00</a>
                  </div>
                  <div className="text-base text-left">
                    или узнать информацию в <a href="#" className="text-[#2250a7] underline">личном кабинете</a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuestionsBlock;