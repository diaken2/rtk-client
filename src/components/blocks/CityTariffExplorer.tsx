"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import TariffCard from "@/components/tariff/TariffCard";
import ContactModal from "@/components/forms/ContactModal";
import ConnectionForm from "@/components/forms/ConnectionForm";
import SegmentationModal from "@/components/ui/SegmentationModal";
import CallRequestModal from "@/components/ui/CallRequestModal";
import MobileFiltersDrawer from "@/components/filters/MobileFiltersDrawer";
import { FiFilter } from "react-icons/fi";
import HowConnect from "@/components/blocks/HowConnect";
import Bonuses from "@/components/blocks/Bonuses";
import PromoSlider from "@/components/blocks/PromoSlider";
import EquipmentBlock from "@/components/blocks/EquipmentBlock";
import QuestionsBlock from "@/components/blocks/QuestionsBlock";
import InfoBlockKrasnodar from "@/components/blocks/InfoBlockKrasnodar";
import FaqBlock from "@/components/blocks/FaqBlock";
import SupportOnlyBlock from "@/components/ui/SupportOnlyBlock";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { useSupportOnly } from "@/context/SupportOnlyContext";
import HeroAddressSearch from "./HeroAddressSearch";
import { submitLead } from "@/lib/submitLead";
import InputMask from "react-input-mask";

type Filters = {
  internet: boolean;
  tv: boolean;
  mobile: boolean;
  onlineCinema: boolean;
  gameBonuses: boolean;
  promotions: boolean;
  hitsOnly: boolean;
  priceRange: number[];
  speedRange: number[];
};
type BooleanFilterKey = 
  | 'internet'
  | 'tv'
  | 'mobile'
  | 'onlineCinema'
  | 'gameBonuses'
  | 'promotions'
  | 'hitsOnly';
const defaultFilters: Filters = {
  internet: false,
  tv: false,
  mobile: false,
  onlineCinema: false,
  gameBonuses: false,
  promotions: false,
  hitsOnly: false,
  priceRange: [100, 5000],
  speedRange: [0, 2000],
};
type FilterKey = keyof Filters;
interface TimeSlot {
  value: string;
  label: string;
}
const houseTypes = ["Квартира", "Частный дом", "Офис"];
const supportOptions = [
  "Оплата услуг",
  "Оборудование",
  "Не работает интернет/ТВ"
];
function TariffHelpForm() {
  const [step, setStep] = React.useState<null | 'connection' | 'support'>(null);
  const [houseType, setHouseType] = React.useState(houseTypes[0]);
  const [phone, setPhone] = React.useState("");
  const [name, setName] = React.useState("");
  const [supportValue, setSupportValue] = React.useState<string | null>(null);
  const [selectedTime, setSelectedTime] = React.useState("");
  const [timeSlots, setTimeSlots] = React.useState<TimeSlot[]>([]);
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const router = useRouter();
  const { setSupportOnly } = useSupportOnly();
  const timeDropdownRef = React.useRef<HTMLDivElement>(null);

  // Генерация временных слотов на основе текущего времени
  React.useEffect(() => {
    if (step === 'connection') {
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
  }, [step]);

  // Закрытие дропдауна при клике вне его
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (timeDropdownRef.current && !timeDropdownRef.current.contains(event.target as Node)) {
        setIsTimeDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isFormValid = phone.replace(/\D/g, "").length === 10 && name.trim().length > 1 && selectedTime;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitted(true);

    try {
      const selectedSlot = timeSlots.find(slot => slot.value === selectedTime);
      const result = await submitLead({
        type: step === 'connection' ? 'Новое подключение' : 'Поддержка существующего абонента',
        name: name,
        phone: phone,
        houseType: houseType,
        supportValue: supportValue || undefined,
        callTime: selectedSlot?.label || selectedTime,
      });

      if (result.success) {
        setTimeout(() => {
          setSubmitted(false);
          setPhone(""); 
          setName("");
          router.push('/complete');
        }, 2000);
      } else {
        console.error('Failed to submit lead:', result.error);
        setTimeout(() => {
          setSubmitted(false);
          setPhone(""); 
          setName("");
          router.push('/complete');
        }, 2000);
      }
    } catch (error) {
      console.error('Error submitting lead:', error);
      setTimeout(() => {
        setSubmitted(false);
        setPhone(""); 
        setName("");
        router.push('/complete');
      }, 2000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // step === 'support'
  React.useEffect(() => {
    if (step === 'support' && supportValue) {
      setSupportOnly(true);
    }
  }, [step, supportValue, setSupportOnly]);

  if (!step) {
    return (
      <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4">
        <button 
          className="bg-[#ff4d06] text-white font-bold rounded-full px-3 sm:px-6 md:px-10 py-2 sm:py-3 text-[11px] sm:text-sm md:text-lg transition hover:bg-[#ff7f2a] whitespace-nowrap min-h-[44px] flex items-center justify-center"
          onClick={() => setStep('connection')}
        >
          Новое подключение
        </button>
        <button 
          className="bg-transparent border-2 border-white text-white font-bold rounded-full px-3 sm:px-4 md:px-10 py-2 sm:py-3 text-[11px] sm:text-sm md:text-lg transition hover:bg-white hover:text-[#8000ff] whitespace-nowrap min-h-[44px] flex items-center justify-center"
          onClick={() => setStep('support')}
        >
          <span className="hidden sm:inline">Я действующий абонент</span>
          <span className="sm:hidden">Я абонент</span>
        </button>
      </div>
    );
  }

  if (step === 'connection') {
    return (
      <>
        <form className="w-full flex flex-col gap-4" autoComplete="off" onSubmit={handleSubmit}>
          {/* Радиокнопки */}
          <div className="flex flex-row gap-8 items-center mb-2 overflow-x-auto pb-2">
            {houseTypes.map((type) => (
              <label key={type} className="flex items-center cursor-pointer select-none text-[16px] font-medium font-sans flex-shrink-0">
                <span className={`w-7 h-7 flex items-center justify-center rounded-full border-2 mr-2 transition-all duration-150 ${houseType === type ? "border-[#FF4F12] bg-[#FF4F12]" : "border-gray-300 bg-white"}`}>
                  {houseType === type && (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5" fill="#fff" /></svg>
                  )}
                </span>
                <input type="radio" name="houseType" value={type} checked={houseType === type} onChange={() => setHouseType(type)} className="hidden" />
                <span className={`text-[16px] font-medium font-sans ${houseType === type ? "text-white" : "text-white/80"}`}>{type}</span>
              </label>
            ))}
          </div>
          {/* Поля и кнопка в один ряд */}
          <div className="flex flex-col md:flex-row gap-4 items-end w-full">
            {/* Телефон */}
            <div className="w-full md:flex-1">
              <label className="text-[14px] font-medium font-sans mb-1 text-white text-left">Введите телефон</label>
              <div className="flex flex-row items-center bg-white rounded-full overflow-hidden h-[44px]">
                <span className="bg-gray-100 text-gray-500 px-3 h-full flex items-center font-semibold text-base rounded-l-full select-none">+7</span>
                <InputMask
                  mask="(999) 999-99-99"
                  value={phone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
                  className="flex-1 bg-transparent border-none px-2 py-2 text-base text-[#222] placeholder-[#bbb] outline-none focus:ring-2 focus:ring-orange-500 transition font-sans"
                  placeholder="(___) ___-__-__"
                  type="tel"
                  autoComplete="tel"
                />
              </div>
            </div>
            {/* Имя */}
            <div className="w-full md:flex-1">
              <label className="text-[14px] font-medium font-sans mb-1 text-white text-left">Введите имя</label>
              <input
                type="text"
                value={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                className="w-full rounded-full bg-white px-4 py-2 text-base text-[#222] placeholder-[#bbb] outline-none focus:ring-2 focus:ring-orange-500 transition h-[44px] font-sans"
                placeholder="Имя"
                autoComplete="name"
              />
            </div>
            {/* Кнопка */}
            <button
              type="submit"
              className={`w-full md:w-[200px] h-[44px] rounded-full px-6 text-[16px] font-medium font-sans transition ml-0 md:ml-4 ${isFormValid && !submitted && !isSubmitting ? "bg-[#FF4F12] text-white" : "bg-[#FFD6C2] text-white cursor-not-allowed"}`}
              disabled={!isFormValid || submitted || isSubmitting}
            >
              {submitted ? 'Отправлено!' : isSubmitting ? 'Отправляем...' : 'Жду звонка'}
            </button>
          </div>
          {/* Подпись под полем с выпадающим списком */}
          <div className="flex items-center gap-2 mt-3 justify-start relative" ref={timeDropdownRef}>
            <button
              type="button"
              onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
              className="text-white text-[13px] font-normal font-sans hover:underline flex items-center gap-1"
            >
              {timeSlots.find(slot => slot.value === selectedTime)?.label || 'Перезвоним в течение 15 минут'}
              <svg 
                className={`w-4 h-4 transition-transform ${isTimeDropdownOpen ? 'rotate-180' : ''}`}
                fill="none" 
                viewBox="0 0 24 24"
              >
                <path d="M7 10l5 5 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {isTimeDropdownOpen && (
              <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg py-2 z-20 min-w-[250px] max-h-[200px] overflow-y-auto">
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
          {/* Юридическая строка */}
          <p className="text-[12px] font-light font-sans mt-2 text-left text-[#D8B5FF]">Отправляя заявку, вы соглашаетесь с <a href="#" className="underline">политикой обработки персональных данных</a></p>
        </form>
      </>
    );
  }

  // step === 'support'
  return (
    <div className="flex flex-col gap-4 items-center animate-fade-in">
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2 w-full">
        {supportOptions.map((opt) => (
          <button key={opt} className={`px-7 py-3 rounded-full border-2 font-semibold text-base transition focus:outline-none flex-shrink-0 ${supportValue === opt ? "bg-[#ff4d06] border-[#ff4d06] text-white" : "border-white text-white bg-transparent"}`} onClick={() => setSupportValue(opt)}>{opt}</button>
        ))}
      </div>
      {supportValue && (
        <div className="bg-white/10 rounded-xl p-6 max-w-lg text-center">
          <h3 className="text-xl font-bold mb-2 text-white">Вы являетесь действующим абонентом Ростелеком</h3>
          <p className="mb-2 text-white/80">Мы не сможем ответить на вопросы по действующему подключению или сменить ваш текущий тариф.</p>
          <div className="mb-2">
            <span className="text-base text-white/80">Рекомендуем позвонить по номеру</span><br />
            <a href="tel:88001000800" className="text-2xl md:text-3xl font-bold text-white hover:underline">8 800 100-08-00</a>
            <div className="text-xs text-white/60">Звонок бесплатный по РФ</div>
          </div>
          <div className="text-base text-white/80">
            или узнать информацию в <a href="#" className="underline text-white">личном кабинете</a>
          </div>
        </div>
      )}
    </div>
  );
}
export default function CityTariffExplorer({
  tariffs,
  cityName,
  citySlug
}: {
  tariffs: any[];
  cityName: string;
  citySlug: string;
}) {
  const [visibleCount, setVisibleCount] = useState(6);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isConnectionModalOpen, setIsConnectionModalOpen] = useState(false);
  const [isCallRequestModalOpen, setIsCallRequestModalOpen] = useState(false);
  const [isSegmentationModalOpen, setIsSegmentationModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState("popular");
  const [activeCategory, setActiveCategory] = useState("all");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({ ...defaultFilters });
  const { isSupportOnly } = useSupportOnly();
  const searchParams = useSearchParams();
  const router = useRouter();
    const [priceLimits, setPriceLimits] = useState({ min: 100, max: 5000 });
    const [speedLimits, setSpeedLimits] = useState({ min: 0, max: 1000 });
     const visibleTariffs = useMemo(() => {
    return tariffs.filter(tariff => !tariff.hidden);
  }, [tariffs]);
useEffect(() => {
  if (visibleTariffs.length > 0) {
    const prices = visibleTariffs.map(t => t.price).filter(price => price > 0);
    const speeds = visibleTariffs.map(t => t.speed || 0).filter(speed => speed > 0);
    
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const minSpeed = speeds.length > 0 ? Math.min(...speeds) : 0;
    const maxSpeed = speeds.length > 0 ? Math.max(...speeds) : 1000;
    
    setPriceLimits({
      min: Math.max(100, Math.floor(minPrice / 100) * 100),
      max: Math.min(10000, Math.ceil(maxPrice / 100) * 100)
    });

    setSpeedLimits({
      min: 0, // Минимальная скорость всегда 0
      max: Math.max(1000, Math.ceil(maxSpeed / 100) * 100)
    });

    // Устанавливаем фильтры по умолчанию
    setFilters(prev => ({
      ...prev,
      priceRange: [minPrice, maxPrice],
      speedRange: [0, maxSpeed] // Начинаем с 0 чтобы включить все тарифы
    }));
  }
}, [visibleTariffs]);
  const categoryMapping = useMemo((): Record<string, string> => ({
    internet: "Интернет",
    "internet-tv": "Интернет + ТВ",
    "internet-mobile": "Интернет + Моб. связь",
    "internet-tv-mobile": "Интернет + ТВ + Моб. связь",
  }), []);
  const normalize = (str: string) =>
str
.toLowerCase()
.replace(/\s+/g, '')
.replace(/[.,+]/g, '')
.replace('интернет', 'internet')
.replace('тв', 'tv')
.replace('моб', 'mobile');

const getTariffTypeKey = (type: string): string => {
    if (!type) return 'other';
    
    const normalizedType = type.toLowerCase().replace(/\s+/g, '');
    
    if (normalizedType.includes('интернет') && normalizedType.includes('тв') && normalizedType.includes('моб')) 
      return 'internet-tv-mobile';
    if (normalizedType.includes('интернет') && normalizedType.includes('тв')) 
      return 'internet-tv';
    if (normalizedType.includes('интернет') && normalizedType.includes('моб')) 
      return 'internet-mobile';
    if (normalizedType.includes('интернет')) 
      return 'internet';
    
    return 'other';
  };
const isAllCategoryActive =
!filters.internet && !filters.tv && !filters.mobile;
  useEffect(() => {
    const urlCategory = searchParams.get("filter");
    if (urlCategory && categoryMapping[urlCategory]) {
      setActiveCategory(urlCategory);
      setFilters((prev) => ({
        ...prev,
        ...getServiceFiltersForCategory(urlCategory),
      }));
    }
  }, [searchParams, categoryMapping]);



const filteredTariffs = useMemo(() => {
    return visibleTariffs.filter((tariff) => {
      // 1. Фильтр по категории (вкладки)
      if (activeCategory !== 'all') {
        const tariffCategory = getTariffTypeKey(tariff.type);
        if (tariffCategory !== activeCategory) return false;
      }

      // 2. Фильтр по боковым чекбоксам (только когда активна категория 'all')
      if (activeCategory === 'all') {
        const hasInternet = filters.internet && /интернет/i.test(tariff.type);
        const hasTV = filters.tv && /тв/i.test(tariff.type);
        const hasMobile = filters.mobile && /моб/i.test(tariff.type);
        
        // Если какие-то боковые фильтры активны, применяем их
        if (filters.internet || filters.tv || filters.mobile) {
          if (!(hasInternet || hasTV || hasMobile)) return false;
        }
      }

      // 3. Фильтр по особенностям
      const featureText = `${tariff.name ?? ''} ${(tariff.features || []).join(' ')}`.toLowerCase();
      
      if (filters.onlineCinema && !(
        featureText.includes('wink') ||
        featureText.includes('фильм') ||
        featureText.includes('сериал') ||
        featureText.includes('кино')
      )) return false;

      if (filters.gameBonuses && !(
        featureText.includes('игр') ||
        featureText.includes('бонус')
      )) return false;

      // 4. Фильтр по акциям
      if (filters.promotions && !(
        tariff.discountPrice !== undefined ||
        tariff.discountPercentage !== undefined ||
        tariff.name?.toLowerCase().includes('тест-драйв') ||
        tariff.name?.toLowerCase().includes('акция')
      )) return false;

      // 5. Фильтр по хитам
      if (filters.hitsOnly && !tariff.isHit) return false;

      // 6. Фильтр по цене
      if (tariff.price < filters.priceRange[0] || tariff.price > filters.priceRange[1]) 
        return false;

      // 7. Фильтр по скорости (только для тарифов с интернетом)
       if (tariff.speed > 0) {
      if (tariff.speed < filters.speedRange[0] || tariff.speed > filters.speedRange[1]) 
        return false;
    }

      return true;
    });
  }, [visibleTariffs, activeCategory, filters]);

  // сортировка
  const sortedTariffs = (() => {
    switch (sortBy) {
      case "speed":
        return [...filteredTariffs].sort((a, b) => (b.speed || 0) - (a.speed || 0));
      case "price-low":
        return [...filteredTariffs].sort((a, b) => a.price - b.price);
      case "price-high":
        return [...filteredTariffs].sort((a, b) => b.price - a.price);
      default:
        return filteredTariffs;
    }
  })();

  const handleFilterChange = (newFilters: Partial<Filters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);

    // Автоматически определяем категорию на основе фильтров
    if (updatedFilters.internet || updatedFilters.tv || updatedFilters.mobile) {
      if (updatedFilters.internet && updatedFilters.tv && updatedFilters.mobile) {
        setActiveCategory('internet-tv-mobile');
      } else if (updatedFilters.internet && updatedFilters.tv) {
        setActiveCategory('internet-tv');
      } else if (updatedFilters.internet && updatedFilters.mobile) {
        setActiveCategory('internet-mobile');
      } else if (updatedFilters.internet) {
        setActiveCategory('internet');
      }
    } else {
      setActiveCategory('all');
    }
  };
   useEffect(() => {
    console.log('Total tariffs:', tariffs.length);
    console.log('Visible tariffs:', visibleTariffs.length);
    console.log('Filtered tariffs:', filteredTariffs.length);
    console.log('Active category:', activeCategory);
    console.log('Filters:', filters);
  }, [tariffs, visibleTariffs, filteredTariffs, activeCategory, filters]);
function isSameCombination(filters: Filters, combo: Partial<Filters>) {
  return (
    filters.internet === !!combo.internet &&
    filters.tv === !!combo.tv &&
    filters.mobile === !!combo.mobile
  );
}
const isAllCategory =
  !filters.internet ||
  (!filters.internet &&
    (filters.tv || filters.mobile || (!filters.tv && !filters.mobile)));

 const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    
    // Сбрасываем только интернет/ТВ/мобильные фильтры при смене категории
    if (categoryId === 'all') {
      setFilters(prev => ({
        ...prev,
        internet: false,
        tv: false,
        mobile: false
      }));
    }
  };

  const resetFilters = () => {
    setActiveCategory("all");
    setFilters({ ...defaultFilters });
  };

  return (
    <div className="flex flex-col min-h-screen">
         <HeroAddressSearch />
      <main className="container py-8 flex-grow flex flex-col lg:flex-row gap-8">
        <aside className="hidden lg:block w-1/4">
          <div className="card sticky top-4 p-4 shadow rounded-xl">
            <h3 className="text-lg font-semibold mb-4">Фильтры</h3>

            {
[
  { key: 'internet', label: 'Интернет' },
  { key: 'tv', label: 'ТВ' },
  { key: 'mobile', label: 'Мобильная связь' },
  { key: 'onlineCinema', label: 'Онлайн-кинотеатр' },
  { key: 'gameBonuses', label: 'Игровые бонусы' },
].map(item => (
  <label key={item.key} className="flex items-center space-x-2 mb-2">
    <input
      type="checkbox"
      checked={filters[item.key as BooleanFilterKey]}
      onChange={() =>
        handleFilterChange({
          [item.key]: !filters[item.key as BooleanFilterKey],
        })
      }
      className="checkbox-custom"
    />
    <span>{item.label}</span>
  </label>
))}

            {/* спецпредложения */}
            <div className="my-4">
               <h4 className="font-semibold mb-3">Спецпредложения</h4>
              <label className="flex items-center space-x-2 mb-2">
                <input
                  type="checkbox"
                  checked={filters.promotions}
                  onChange={() => handleFilterChange({ promotions: !filters.promotions })}
                  className="checkbox-custom"
                />
                <span>% Акции</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.hitsOnly}
                  onChange={() => handleFilterChange({ hitsOnly: !filters.hitsOnly })}
                  className="checkbox-custom"
                />
                <span>Только хиты</span>
              </label>
            </div>

            {/* цена */}
    <div className="mb-6">
            <h4 className="font-semibold mb-3">Стоимость в месяц (₽)</h4>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>{filters.priceRange[0]}</span>
              <span>{filters.priceRange[1]}</span>
            </div>
            <Slider
              range
              min={priceLimits.min}
              max={priceLimits.max}
              value={filters.priceRange}
              onChange={(value) => Array.isArray(value) && handleFilterChange({ priceRange: value })}
              trackStyle={[{ backgroundColor: '#FF6600' }]}
              handleStyle={[{ borderColor: '#FF6600', backgroundColor: '#FF6600' }, { borderColor: '#FF6600', backgroundColor: '#FF6600' }]}
              railStyle={{ backgroundColor: '#eee' }}
            />
          </div>

            {/* скорость */}
      <div className="mb-6">
  <h4 className="font-semibold mb-3">Скорость (Мбит/с)</h4>
  <div className="flex justify-between text-sm text-gray-600 mb-2">
    <span>{filters.speedRange[0]}</span>
    <span>{filters.speedRange[1]}</span>
  </div>
  <Slider
    range
    min={speedLimits.min}
    max={speedLimits.max}
    value={filters.speedRange}
    onChange={(value) => Array.isArray(value) && handleFilterChange({ speedRange: value })}
    trackStyle={[{ backgroundColor: '#FF6600' }]}
    handleStyle={[{ borderColor: '#FF6600', backgroundColor: '#FF6600' }, { borderColor: '#FF6600', backgroundColor: '#FF6600' }]}
    railStyle={{ backgroundColor: '#eee' }}
  />
</div>
          </div>
        </aside>

        <div className="w-full lg:w-3/4">
          <div className="mb-6 -mx-4 lg:mx-0">
        <div className="flex gap-3 items-center px-4 overflow-x-auto">
          <button
            onClick={() => handleCategoryChange("all")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              activeCategory === "all" ? "bg-rt-cta text-white" : "bg-gray-100 text-gray-700"
            }`}
          >
            Все
          </button>
          
          {Object.entries(categoryMapping).map(([id, label]) => (
            <button
              key={id}
              onClick={() => handleCategoryChange(id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                activeCategory === id ? "bg-rt-cta text-white" : "bg-gray-100 text-gray-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

          
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold">
                Доступные тарифы 
                <span className="text-lg font-normal text-gray-600 ml-2">
                  ({filteredTariffs.length})
                </span>
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Сортировка:</span>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                  }}
                  className="form-input py-2 text-sm min-w-[140px]"
                >
                  <option value="popular">Популярные</option>
                  <option value="speed">Быстрые</option>
                  <option value="price-low">Подешевле</option>
                  <option value="price-high">Подороже</option>
                </select>
                <span
                  role="button"
                  tabIndex={0}
                  onClick={() => setIsMobileFiltersOpen(true)}
                  onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setIsMobileFiltersOpen(true)}
                  className="lg:hidden inline-flex items-center gap-1 text-sm font-medium text-rt-cta active:opacity-60"
                >
                  <FiFilter size={16} />
                  Все фильтры
                </span>
              </div>
            </div>

          {sortedTariffs.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sortedTariffs.slice(0, visibleCount).map((t) => (
                <TariffCard key={t.id} tariff={t} onClick={() => setIsSegmentationModalOpen(true)} />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-600 py-12">
              Тарифы не найдены
              <div>
                <button className="btn-secondary mt-4" onClick={resetFilters}>Сбросить фильтры</button>
              </div>
            </div>
          )}
          {visibleCount < sortedTariffs.length && (
            <div className="text-center mt-4">
              <button className="btn-secondary" onClick={() => setVisibleCount(visibleCount + 5)}>Показать ещё</button>
            </div>
          )}
               <section className="mt-12 rounded-3xl bg-[#7000FF] p-6 md:p-12 text-white flex flex-col items-center justify-center max-w-3xl mx-auto shadow-lg">
              <div className="w-full flex flex-col gap-2 md:gap-4">
                <h2 className="text-[28px] leading-[1.05] font-bold font-sans mb-2 md:mb-3 text-left text-white">Хотите быстро найти самый выгодный тариф?</h2>
                <p className="text-[18px] leading-[1.2] font-normal font-sans mb-4 md:mb-6 text-left max-w-xl text-white">Подберите тариф с экспертом. Найдём для вас лучшее решение с учетом ваших пожеланий</p>
                <SupportOnlyBlock>
                  <TariffHelpForm />
                </SupportOnlyBlock>
              </div>
            </section>
        </div>
        
      </main>

      {/* блоки */}
  
      <HowConnect onOpenSegmentationModal={() => setIsSegmentationModalOpen(true)} />
      <Bonuses />
      <PromoSlider onOpenSegmentationModal={() => setIsSegmentationModalOpen(true)} />
      <InfoBlockKrasnodar />
      <EquipmentBlock />
      <FaqBlock />
      <SupportOnlyBlock isQuestionsBlock>
        <QuestionsBlock />
      </SupportOnlyBlock>

      {/* модалки */}
<SegmentationModal
  isOpen={isSegmentationModalOpen}
  onClose={() => setIsSegmentationModalOpen(false)}
  onNewConnection={() => setIsConnectionModalOpen(true)}
  onExistingConnection={() => setIsConnectionModalOpen(true)}
/>      <ContactModal isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} />
      <ConnectionForm isOpen={isConnectionModalOpen} onClose={() => setIsConnectionModalOpen(false)} />
      <CallRequestModal isOpen={isCallRequestModalOpen} onClose={() => setIsCallRequestModalOpen(false)} />
      <MobileFiltersDrawer
        open={isMobileFiltersOpen}
        onClose={() => setIsMobileFiltersOpen(false)}
        filters={filters}
        onFiltersChange={handleFilterChange}
        onApply={() => setIsMobileFiltersOpen(false)}
        onClear={resetFilters}
      />
    </div>
  );
}

function getServiceFiltersForCategory(categoryId: string) {
  switch (categoryId) {
    case "internet": return { internet: true, tv: false, mobile: false };
    case "internet-tv": return { internet: true, tv: true, mobile: false };
    case "internet-mobile": return { internet: true, tv: false, mobile: true };
    case "internet-tv-mobile": return { internet: true, tv: true, mobile: true };
    default: return { internet: false, tv: false, mobile: false };
  }
}
