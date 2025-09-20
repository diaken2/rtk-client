"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import ContactModal from '@/components/forms/ContactModal';
import Logo from '@/components/ui/Logo';
import CitySelectModal from '@/components/blocks/CitySelectModal';
import { useSupportOnly } from '@/context/SupportOnlyContext';
import { useRouter } from 'next/navigation';
import { useCity } from '@/context/CityContext';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false);
  const servicesDropdownRef = useRef<HTMLDivElement>(null);
  const { isSupportOnly } = useSupportOnly();
  const router = useRouter();
  const { setCity, city } = useCity();
const citySlug = city && city.trim().length > 0 ? slugifyCityName(city) : "moskva";
  const services = [
    { name: "Интернет", filter: "internet" },
    { name: "Интернет + ТВ", filter: "internet-tv" },
    { name: "Интернет + Мобильная связь", filter: "internet-mobile" },
    { name: "Интернет + ТВ + Мобильная связь", filter: "internet-tv-mobile" }
  ];

  // Закрытие выпадающего меню при клике вне его области
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (servicesDropdownRef.current && !servicesDropdownRef.current.contains(event.target as Node)) {
        setIsServicesDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleContactClick = (type: 'connection' | 'support') => {
    setIsContactModalOpen(true);
    setIsMenuOpen(false);
  };

function slugifyCityName(city: string): string {
  const raw = city
    .replace(/^([а-яёa-z\-\.]+)[\s\-]+/i, "") // убираем "г. ", "пгт ", "с. " и т.д.
    .trim()
    .toLowerCase();
  return raw
    .replace(/ /g, "-")
    .replace(/[а-яё]/gi, (c) =>
      ({
        а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh",
        з: "z", и: "i", й: "i", к: "k", л: "l", м: "m", н: "n", о: "o",
        п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "c",
        ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya"
      }[c.toLowerCase()] || "")
    );
}
const handleServiceClick = (filter: string) => {
  const citySlug = city && city.trim().length > 0 ? slugifyCityName(city) : "moskva";
  router.push(`/${citySlug}/${filter}`);
  setIsMenuOpen(false);
};
 const handleCitySelect = (selectedCity: string, selectedRegion: string) => {
  setIsCityModalOpen(false);
  setCity(selectedCity);
  document.cookie = `user-city=${encodeURIComponent(selectedCity)}; path=/; max-age=31536000`;

  // переход в новый город
  const citySlug = slugifyCityName(selectedCity);
  router.push(`/${citySlug}`);
};

  return (
    <>
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            {/* Логотип + выбор города */}
            <div className="flex items-center space-x-6">
              <Logo cityName={city && city.trim().length > 0 ? slugifyCityName(city) : "moskva"} />
              <div className="hidden md:flex items-center text-gray-600 cursor-pointer group" onClick={() => setIsCityModalOpen(true)}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium text-blue-700 group-hover:text-pink-600 transition-colors underline underline-offset-2">{city && city.trim().length > 0 ? city.trim() : "в России"}</span>
              </div>
            </div>
            {/* Навигация */}
            <div className="hidden md:flex items-center space-x-8">
              {/* Меню "Услуги" */}
              <div className="relative" ref={servicesDropdownRef}>
                <button 
                  className="flex items-center font-medium text-gray-700 hover:text-rt-cta transition-colors"
                  onClick={() => setIsServicesDropdownOpen(!isServicesDropdownOpen)}
                >
                  Услуги
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className={`h-4 w-4 ml-1 transition-transform ${isServicesDropdownOpen ? 'rotate-180' : ''}`} 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {isServicesDropdownOpen && (
                  <div className="absolute bg-white shadow-lg rounded-rt-card mt-2 py-2 w-64 z-50 animate-fade-in">
                    {services.map((service, index) => (
                      <button 
                        key={index} 
                        onClick={() => {
                          handleServiceClick(service.filter);
                          setIsServicesDropdownOpen(false);
                        }}
                        className={`block w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors`}
                      >
                        {service.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Ссылка "Все города" удалена */}
              
              {/* Ссылка "Контакты" скрыта при режиме поддержки */}
              {!isSupportOnly && (
                <Link href={`/${citySlug}/contacts`} className="font-medium text-gray-700 hover:text-rt-cta transition-colors">
                  Контакты
                </Link>
              )}
              
              {/* Кнопка консультации - скрыта при режиме поддержки */}
              {!isSupportOnly && (
                <button 
                  onClick={() => handleContactClick('connection')}
                  className="flex items-center font-medium text-gray-700 hover:text-rt-cta transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  Консультация
                </button>
              )}
            </div>
            
            {/* Мобильное меню */}
            <div className="md:hidden flex items-center space-x-3">
              {/* Иконка телефона для консультации - скрыта при режиме поддержки */}
              {!isSupportOnly && (
                <button 
                  className="text-gray-700 hover:text-rt-cta transition-colors p-2"
                  onClick={() => handleContactClick('connection')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                </button>
              )}
              
              {/* Иконка капельки для выбора города */}
              <button 
                className="text-gray-700 hover:text-rt-cta transition-colors p-2"
                onClick={() => setIsCityModalOpen(true)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </button>
              
              {/* Бургер-меню */}
              <button 
                className="text-gray-700 hover:text-rt-cta transition-colors p-2"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Мобильное меню (раскрывающееся) */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 pb-4 space-y-3 animate-slide-up">
              <div className="pt-2 border-t border-gray-200">
                <h3 className="font-semibold text-gray-700 mb-2">Услуги</h3>
                <div className="space-y-2 pl-4">
                  {services.map((service, index) => (
                    <button 
                      key={index} 
                     onClick={() => handleServiceClick(service.filter)}
                      className={`block w-full text-left py-1 text-gray-600 hover:text-rt-cta transition-colors`}
                    >
                      {service.name}
                    </button>
                  ))}
                </div>
              </div>
              {/* Ссылка "Все города" удалена */}
              
              {/* Ссылка "Контакты" скрыта при режиме поддержки */}
              {!isSupportOnly && (
                <Link 
                  href={`/${citySlug}/contacts`}
                  className="block py-2 text-gray-700 hover:text-rt-cta transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Контакты
                </Link>
              )}
            </div>
          )}
        </div>
      </header>

      <ContactModal 
        isOpen={isContactModalOpen} 
        onClose={() => setIsContactModalOpen(false)}
      />
      <CitySelectModal
        isOpen={isCityModalOpen}
        onClose={() => setIsCityModalOpen(false)}
        onSelect={handleCitySelect}
      />
    </>
  );
}
