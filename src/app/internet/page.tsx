"use client";

import React, { useState, useCallback, Suspense, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import TariffCard from "@/components/tariff/TariffCard";
import ContactModal from "@/components/forms/ContactModal";
import ConnectionForm from "@/components/forms/ConnectionForm";
import MobileFiltersDrawer from "@/components/filters/MobileFiltersDrawer";
import { FiFilter } from "react-icons/fi";
import 'rc-slider/assets/index.css';
import Slider from 'rc-slider';
import SegmentationModal from '@/components/ui/SegmentationModal';
import CallRequestModal from '@/components/ui/CallRequestModal';
import HowConnect from '@/components/blocks/HowConnect';
import Bonuses from '@/components/blocks/Bonuses';
import PromoSlider from '@/components/blocks/PromoSlider';
import EquipmentBlock from '@/components/blocks/EquipmentBlock';
import QuestionsBlock from '@/components/blocks/QuestionsBlock';
import InfoBlockKrasnodar from '@/components/blocks/InfoBlockKrasnodar';
import FaqBlock from "@/components/blocks/FaqBlock";
import SupportOnlyBlock from '@/components/ui/SupportOnlyBlock';
import { tariffsData } from '@/components/tariff/tariffsData';
import InputMask from "react-input-mask";
import { submitLead } from '@/lib/submitLead';
import { useSupportOnly } from '@/context/SupportOnlyContext';

const city = "в России";

type Filters = {
  internet: boolean;
  tv: boolean;
  mobile: boolean;
  onlineCinema: boolean;
  gameBonuses: boolean;
  promotions: boolean;
  freeInstallation: boolean;
  wifiRouter: boolean;
  hitsOnly: boolean;
  connectionType: string;
  priceRange: number[];
  speedRange: number[];
  [key: string]: any;
};

const defaultFilters = {
  internet: true,
  tv: false,
  mobile: false,
  onlineCinema: false,
  gameBonuses: false,
  promotions: false,
  freeInstallation: false,
  wifiRouter: false,
  hitsOnly: false,
  connectionType: "apartment",
  priceRange: [300, 1700],
  speedRange: [50, 1000],
};

const getServiceFiltersForCategory = (categoryId: string) => {
  switch (categoryId) {
    case "internet":
      return { internet: true, tv: false, mobile: false };
    case "internet-tv":
      return { internet: true, tv: true, mobile: false };
    case "internet-mobile":
      return { internet: true, tv: false, mobile: true };
    case "internet-tv-mobile":
      return { internet: true, tv: true, mobile: true };
    default:
      return { internet: false, tv: false, mobile: false };
  }
};

const isTariffInCategory = (tariff: any, categoryId: string) => {
  switch (categoryId) {
    case "internet":
      return tariff.type === "Интернет";
    case "internet-tv":
      return tariff.type === "Интернет + ТВ";
    case "internet-mobile":
      return tariff.type === "Интернет + Моб. связь";
    case "internet-tv-mobile": {
      const hasInternet = tariff.speed > 0;
      const hasTV = (tariff.tvChannels || 0) > 0;
      const hasMobile = (tariff.mobileData || 0) > 0 || (tariff.mobileMinutes || 0) > 0;
      if (hasInternet && hasTV && hasMobile) return true;
      if (tariff.type === "Интернет + ТВ + Моб. связь") {
        const categoryKeywords = ['выгоды', 'семейный', 'игровой', 'комбинированный', 'тест-драйв'];
        if (categoryKeywords.some(keyword => tariff.name.toLowerCase().includes(keyword))) {
          return true;
        }
      }
      if (tariff.name.toLowerCase().includes('тест-драйв')) {
        const hasAnyTV = tariff.type.includes('ТВ') || (tariff.tvChannels || 0) > 0;
        const hasAnyMobile = tariff.type.includes('Моб. связь') || (tariff.mobileData || 0) > 0 || (tariff.mobileMinutes || 0) > 0;
        if (hasInternet && hasAnyTV && hasAnyMobile) return true;
      }
      return false;
    }
    default:
      return true;
  }
};

const houseTypes = ["Квартира", "Частный дом", "Офис"];

function TariffHelpForm() {
  // ... скопируй реализацию из page.tsx ...
  return null; // временно
}

function getCityFromCookie() {
  if (typeof document === "undefined") return "в России";
  const match = document.cookie.match(/(?:^|; )user-city=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : "в России";
}

function InternetPageContent() {
  const [visibleCount, setVisibleCount] = useState(6);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isConnectionModalOpen, setIsConnectionModalOpen] = useState(false);
  const [isCallRequestModalOpen, setIsCallRequestModalOpen] = useState(false);
  const [selectedTariff, setSelectedTariff] = useState(null);
  const [isSegmentationModalOpen, setIsSegmentationModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState("popular");
  const [activeCategory, setActiveCategory] = useState("internet");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    ...defaultFilters,
    internet: true,
    tv: false,
    mobile: false
  });
  const { isSupportOnly } = useSupportOnly();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [city, setCity] = useState("");

  useEffect(() => {
    setCity(getCityFromCookie());
  }, []);

  // Обработка URL параметров
  React.useEffect(() => {
    const urlCategory = searchParams.get('filter');
    if (urlCategory && urlCategory !== activeCategory) {
      setActiveCategory(urlCategory);
      setFilters(prev => ({ ...prev, ...getServiceFiltersForCategory(urlCategory) }));
    } else if (!urlCategory) {
      // Если нет параметра в URL, устанавливаем фильтры для текущей страницы
      const serviceFilters = getServiceFiltersForCategory(activeCategory);
      setFilters(prev => ({ ...prev, ...serviceFilters }));
    }
  }, [searchParams, activeCategory, pathname, router]);

  // Мемоизированная фильтрация и сортировка тарифов
  const filteredTariffs = React.useMemo(() => {
    let filtered = tariffsData;
    const isDefaultPrice = filters.priceRange[0] === 300 && filters.priceRange[1] === 1700;
    const isDefaultSpeed = filters.speedRange[0] === 50 && filters.speedRange[1] === 1000;
    const hasActiveFilters = filters.internet || filters.tv || filters.mobile || filters.onlineCinema || filters.gameBonuses;

    if (
      activeCategory !== "all" ||
      hasActiveFilters ||
      !isDefaultPrice ||
      !isDefaultSpeed ||
      filters.promotions ||
      filters.hitsOnly
    ) {
      filtered = tariffsData.filter(tariff => {
        let categoryMatch = true;
        if (activeCategory !== "all") {
          categoryMatch = isTariffInCategory(tariff, activeCategory);
        }
        let sidebarMatch = true;
        if (activeCategory === "all" && hasActiveFilters) {
          sidebarMatch = 
            (filters.internet && tariff.type.includes("Интернет")) ||
            (filters.tv && tariff.type.includes("ТВ")) ||
            (filters.mobile && tariff.type.includes("Моб. связь")) ||
            (filters.onlineCinema && tariff.features.some(f => f.includes("Wink"))) ||
            (filters.gameBonuses && tariff.features.some(f => f.includes("Игровой") || f.includes("Бонусы в играх")));
        }
        const promoMatch = !filters.promotions || 
          tariff.discountPrice !== undefined || 
          tariff.name.toLowerCase().includes('тест-драйв');
        const hitsMatch = !filters.hitsOnly || tariff.isHit;
        const basePrice = tariff.price;
        const priceMatch = basePrice >= filters.priceRange[0] && basePrice <= filters.priceRange[1];
        const speedMatch = tariff.speed >= filters.speedRange[0] && tariff.speed <= filters.speedRange[1];
        return categoryMatch && sidebarMatch && promoMatch && hitsMatch && priceMatch && speedMatch;
      });
    }
    switch (sortBy) {
      case "speed":
        filtered = [...filtered].sort((a, b) => b.speed - a.speed);
        break;
      case "price-low":
        filtered = [...filtered].sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered = [...filtered].sort((a, b) => b.price - a.price);
        break;
      default:
        filtered = [...filtered].sort((a, b) => {
          if (a.isHit && !b.isHit) return -1;
          if (!a.isHit && b.isHit) return 1;
          if (a.isHit === b.isHit) return b.speed - a.speed;
          return 0;
        });
    }
    return filtered;
  }, [filters, activeCategory, sortBy]);

  // Категории для быстрого фильтра
  const categories = [
    { id: "all", label: "Все", count: tariffsData.length },
    { id: "internet", label: "Интернет", count: tariffsData.filter(t => t.type === "Интернет").length },
    { id: "internet-tv", label: "Интернет + ТВ", count: tariffsData.filter(t => t.type === "Интернет + ТВ").length },
    { id: "internet-mobile", label: "Интернет + Моб. связь", count: tariffsData.filter(t => t.type === "Интернет + Моб. связь").length },
    { id: "internet-tv-mobile", label: "Интернет + ТВ + Моб. связь", count: tariffsData.filter(t => {
      const hasInternet = t.speed > 0;
      const hasTV = (t.tvChannels || 0) > 0;
      const hasMobile = (t.mobileData || 0) > 0 || (t.mobileMinutes || 0) > 0;
      if (hasInternet && hasTV && hasMobile) return true;
      if (t.type === "Интернет + ТВ + Моб. связь") {
        const categoryKeywords = ['выгоды', 'семейный', 'игровой', 'комбинированный', 'тест-драйв'];
        if (categoryKeywords.some(keyword => t.name.toLowerCase().includes(keyword))) {
          return true;
        }
      }
      if (t.name.toLowerCase().includes('тест-драйв')) {
        const hasAnyTV = t.type.includes('ТВ') || (t.tvChannels || 0) > 0;
        const hasAnyMobile = t.type.includes('Моб. связь') || (t.mobileData || 0) > 0 || (t.mobileMinutes || 0) > 0;
        if (hasInternet && hasAnyTV && hasAnyMobile) return true;
      }
      return false;
    }).length }
  ];

  const mapFiltersToCategory = (f: Filters) => {
    if (f.internet && f.tv && f.mobile) return "internet-tv-mobile";
    if (f.internet && f.tv && !f.mobile) return "internet-tv";
    if (f.internet && !f.tv && f.mobile) return "internet-mobile";
    if (f.internet && !f.tv && !f.mobile) return "internet";
    return "all";
  };

  const handleTariffClick = (tariff: any) => {
    setSelectedTariff(tariff);
    setIsSegmentationModalOpen(true);
  };

  const handleFilterChange = (newFilters: Partial<Filters>) => {
    setFilters(prev => {
      const updated = { ...prev, ...newFilters };
      const cat = mapFiltersToCategory(updated);
      setActiveCategory(cat);
      return updated;
    });
  };

  const resetFilters = useCallback(() => {
    setActiveCategory("all");
    setFilters({
      ...defaultFilters,
      internet: true,
      tv: false,
      mobile: false
    });
  }, []);

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    if (categoryId === "all") {
      setFilters(prev => ({
        ...prev,
        internet: true,
        tv: false,
        mobile: false,
        onlineCinema: false,
        gameBonuses: false
      }));
    } else {
      const serviceFilters = getServiceFiltersForCategory(categoryId);
      setFilters(prev => ({
        ...prev,
        ...serviceFilters,
      }));
    }
  };

  const handleMobileFiltersApply = () => {
    setIsMobileFiltersOpen(false);
  };

  const scrollToTariffs = () => {
    const tariffsSection = document.getElementById('tariffs-section');
    if (tariffsSection) {
      tariffsSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const handleFooterCategoryClick = (categoryId: string) => {
    handleCategoryChange(categoryId);
    setTimeout(() => {
      scrollToTariffs();
    }, 100);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div style={{background: "linear-gradient(90deg, #F26A2E 0%, #7B2FF2 100%)", padding: "20px 0 32px 0", color: "#fff"}} className="md:py-8 md:pb-12">
        <div style={{maxWidth: 1200, margin: "0 auto", padding: "0 16px"}}>
          <div style={{fontSize: 14, opacity: 0.8, marginBottom: 12}} className="md:text-base md:mb-4">
            Ростелеком / {city} / <b>Интернет</b>
          </div>
          <h1 style={{fontSize: 28, fontWeight: 700, lineHeight: 1.1}} className="md:text-5xl">
            Тарифы Ростелеком на интернет в {city}
          </h1>
        </div>
      </div>
      <main className="flex-grow container py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="hidden lg:block lg:w-1/4 order-2 lg:order-1">
            <div className="card sticky top-4">
              <h3 className="text-lg font-bold mb-6">Фильтры</h3>
              <div className="mb-6">
                <h4 className="font-semibold mb-3">Услуги</h4>
                <div className="space-y-3">
                  {[
                    { key: 'internet', label: 'Интернет' },
                    { key: 'tv', label: 'ТВ' },
                    { key: 'mobile', label: 'Мобильная связь' },
                    { key: 'onlineCinema', label: 'Онлайн-кинотеатры' },
                    { key: 'gameBonuses', label: 'Игровые бонусы' }
                  ].map(item => (
                    <label key={item.key} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters[item.key]}
                        onChange={() => handleFilterChange({ [item.key]: !filters[item.key] })}
                        className="checkbox-custom mr-3"
                      />
                      <span className="text-sm">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="mb-6">
                <h4 className="font-semibold mb-3">Спецпредложения</h4>
                <div className="space-y-3">
                  {[
                    { key: 'promotions', label: '% Акции' },
                    { key: 'hitsOnly', label: 'Только хиты' }
                  ].map(item => (
                    <label key={item.key} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters[item.key]}
                        onChange={() => handleFilterChange({ [item.key]: !filters[item.key] })}
                        className="checkbox-custom mr-3"
                      />
                      <span className="text-sm">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="mb-6">
                <h4 className="font-semibold mb-3">Стоимость в месяц (₽)</h4>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>{filters.priceRange[0]}</span>
                  <span>{filters.priceRange[1]}</span>
                </div>
                <Slider
                  range
                  min={300}
                  max={1700}
                  value={filters.priceRange}
                  onChange={(value) => Array.isArray(value) && handleFilterChange({ priceRange: value })}
                  trackStyle={[{ backgroundColor: '#FF6600' }]}
                  handleStyle={[{ borderColor: '#FF6600', backgroundColor: '#FF6600' }, { borderColor: '#FF6600', backgroundColor: '#FF6600' }]}
                  railStyle={{ backgroundColor: '#eee' }}
                />
              </div>
              <div className="mb-6">
                <h4 className="font-semibold mb-3">Скорость (Мбит/с)</h4>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>{filters.speedRange[0]}</span>
                  <span>{filters.speedRange[1]}</span>
                </div>
                <Slider
                  range
                  min={50}
                  max={1000}
                  value={filters.speedRange}
                  onChange={(value) => Array.isArray(value) && handleFilterChange({ speedRange: value })}
                  trackStyle={[{ backgroundColor: '#FF6600' }]}
                  handleStyle={[{ borderColor: '#FF6600', backgroundColor: '#FF6600' }, { borderColor: '#FF6600', backgroundColor: '#FF6600' }]}
                  railStyle={{ backgroundColor: '#eee' }}
                />
              </div>
            </div>
          </aside>
          <div id="tariffs-section" className="lg:w-3/4 order-1 lg:order-2">
            <div className="mb-6 -mx-4 lg:mx-0">
              <div className="flex gap-3 items-center px-4 overflow-x-auto scroll-smooth whitespace-nowrap lg:flex-wrap lg:overflow-visible lg:whitespace-normal">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition ${activeCategory === category.id ? 'bg-rt-cta text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    {category.label}
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
            {filteredTariffs.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredTariffs.slice(0, visibleCount).map((tariff) => (
                    <TariffCard
                      key={tariff.id}
                      tariff={tariff}
                      onClick={() => handleTariffClick(tariff)}
                    />
                  ))}
                </div>
                {visibleCount < filteredTariffs.length && (
                  <div className="text-center mt-6">
                    <button className="btn-secondary" onClick={() => setVisibleCount(prev => Math.min(prev + 5, filteredTariffs.length))}>Показать ещё</button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">Тарифы не найдены</h3>
                <p className="text-gray-600 mb-6">Попробуйте изменить параметры фильтрации</p>
                <button
                  onClick={resetFilters}
                  className="btn-secondary"
                >
                  Сбросить фильтры
                </button>
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
        </div>
      </main>
      <HowConnect onOpenSegmentationModal={() => setIsSegmentationModalOpen(true)} />
      <Bonuses />
      <PromoSlider onOpenSegmentationModal={() => setIsSegmentationModalOpen(true)} />
      <InfoBlockKrasnodar />
      <EquipmentBlock />
      <FaqBlock />
      <SupportOnlyBlock isQuestionsBlock={true}>
        <QuestionsBlock />
      </SupportOnlyBlock>
      <Footer cityName={city} />
      <SegmentationModal
        isOpen={isSegmentationModalOpen}
        onClose={() => setIsSegmentationModalOpen(false)}
        onNewConnection={() => setIsConnectionModalOpen(true)}
        onExistingConnection={() => setIsConnectionModalOpen(true)}
      />
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
      <ConnectionForm
        isOpen={isConnectionModalOpen}
        onClose={() => setIsConnectionModalOpen(false)}
      />
      <CallRequestModal
        isOpen={isCallRequestModalOpen}
        onClose={() => setIsCallRequestModalOpen(false)}
      />
      <MobileFiltersDrawer
        open={isMobileFiltersOpen}
        onClose={() => setIsMobileFiltersOpen(false)}
        filters={filters}
        onFiltersChange={handleFilterChange}
        onApply={handleMobileFiltersApply}
        onClear={resetFilters}
      />
    </div>
  );
}

export default function InternetPage() {
  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <InternetPageContent />
    </Suspense>
  );
}