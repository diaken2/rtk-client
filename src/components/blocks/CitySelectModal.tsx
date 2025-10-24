import React, { useEffect, useRef, useState } from 'react';
import { regions } from './regionsData';

interface CitySelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (city: string, region: string) => void;
}

export default function CitySelectModal({ isOpen, onClose, onSelect }: CitySelectModalProps) {
  const [query, setQuery] = useState('');
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedRegions, setExpandedRegions] = useState<Set<string>>(new Set());
  const searchRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [regionsData, setRegionsData] = useState<any[]>([]);
  
const [isLoading, setIsLoading] = useState(true);
useEffect(() => {
  if (isOpen) {
    const fetchRegions = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('https://rtk-backend-five.vercel.app/api/regions');
        if (response.ok) {
          const data = await response.json();
          setRegionsData(data);
        } else {
          console.error('Ошибка загрузки регионов');
          // Можно загрузить fallback данные или показать ошибку
        }
      } catch (error) {
        console.error('Ошибка:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRegions();
  }
}, [isOpen]);
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

  // Фокус на инпут при открытии
  useEffect(() => {
    if (isOpen && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Поиск городов по запросу
  const searchResults = query.trim() ? (() => {
    const q = query.toLowerCase();
    const results: Array<{ city: string; region: string; regionId: string }> = [];
    
    regionsData.forEach(letterGroup => {
      letterGroup.areas.forEach((region:any) => {
        region.cities.forEach((city:any) => {
          if (city.toLowerCase().includes(q)) {
            results.push({
              city,
              region: region.name,
              regionId: region.id
            });
          }
        });
      });
    });
    
    return results;
  })() : [];

  // Фильтрация регионов и городов (для десктопной версии)
  let filtered = regionsData;
  if (query.trim()) {
    const q = query.toLowerCase();
    filtered = regionsData
      .map(letterGroup => {
        const filteredAreas = letterGroup.areas
          .map((area:any) => {
            const filteredCities = area.cities.filter((city:any) => city.toLowerCase().includes(q));
            if (area.name.toLowerCase().includes(q) || filteredCities.length > 0) {
              return { ...area, cities: filteredCities.length > 0 ? filteredCities : area.cities };
            }
            return null;
          })
          .filter(Boolean);
        if (filteredAreas.length > 0) {
          return { ...letterGroup, areas: filteredAreas };
        }
        return null;
      })
      .filter(Boolean) as typeof regionsData;
  }

  // Выбор региона по умолчанию (первый в списке)
  useEffect(() => {
    if (!selectedRegionId && filtered.length > 0 && filtered[0].areas.length > 0) {
      setSelectedRegionId(filtered[0].areas[0].id);
    }
  }, [filtered, selectedRegionId]);

  // Найти выбранный регион
  const allAreas = filtered.flatMap(l => l.areas);
  const activeRegion = allAreas.find(r => r.id === selectedRegionId) || allAreas[0];
  const filteredCities = activeRegion?.cities || [];

  // Функция для переключения раскрытия региона
  const toggleRegion = (regionId: string) => {
    const newExpanded = new Set(expandedRegions);
    if (newExpanded.has(regionId)) {
      newExpanded.delete(regionId);
    } else {
      newExpanded.add(regionId);
    }
    setExpandedRegions(newExpanded);
  };

  if (!isOpen) return null;
  if(isLoading){
    return (
       <div className="flex justify-center items-center h-40">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ee3c6b]"></div>
  </div>
    )}
  return (
    <div className="fixed inset-0 bg-black bg-opacity-45 flex items-center justify-center z-[1000] p-4">
      <div
        className={
          isMobile
            ? "fixed inset-0 bg-white z-[1001] overflow-y-auto"
            : "w-[800px] max-w-[90vw] bg-white rounded-[24px] relative shadow-xl"
        }
        style={isMobile ? {} : { minHeight: 480, maxHeight: '90vh' }}
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
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-[28px] font-bold text-[#1B1B1B]">
              Введите населённый пункт
            </h2>
          </div>

          {/* SearchBar */}
          <div className="mb-6">
            <div className="relative">
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Оренбург"
                className="w-full h-14 rounded-[28px] border-2 border-[#C5C5C5] bg-white px-6 text-lg focus:border-[#FF4D15] focus:ring-4 focus:ring-[#FFF4F0] outline-none pr-12 transition-all"
              />
              {query && (
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  onClick={() => setQuery('')}
                  tabIndex={-1}
                  aria-label="Очистить"
                >
                  <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                    <path d="M6 6l8 8M6 14L14 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* SplitPane */}
          <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} min-h-0 relative`} style={{ height: isMobile ? 'auto' : 320 }}>
            {/* RegionList */}
            <div className={`${isMobile ? 'w-full mb-4' : 'w-1/2'} overflow-y-auto relative ${!isMobile ? 'border-r border-gray-200' : ''}`}>
              {query.trim() ? (
                // Результаты поиска городов
                <div>
                  <h3 className="px-4 py-2 text-sm font-medium text-[#6E6E6E] mb-2">
                    Результаты поиска ({searchResults.length})
                  </h3>
                  <ul className="space-y-1">
                    {searchResults.map((result, index) => (
                      <li key={`${result.city}-${result.regionId}-${index}`}>
                        <button
                          className="w-full px-4 py-3 text-left text-base font-medium text-[#1B1B1B] hover:bg-[#FFF4F0] hover:text-[#FF4D15] transition-all duration-300 rounded-lg"
                          onClick={() => onSelect(result.city, result.region)}
                          role="option"
                          aria-selected={false}
                        >
                          <div className="font-medium">{result.city}</div>
                          <div className="text-sm text-[#6E6E6E]">{result.region}</div>
                        </button>
                      </li>
                    ))}
                  </ul>
                  {searchResults.length === 0 && (
                    <div className="px-4 py-8 text-center text-[#6E6E6E]">
                      Город не найден
                    </div>
                  )}
                </div>
              ) : isMobile ? (
                // Мобильная версия: регионы с inline городами
                <ul className="space-y-2">
                  {regionsData.map(letterGroup => (
                    <React.Fragment key={letterGroup.letter}>
                      {letterGroup.areas.map((region:any) => {
                        const isExpanded = expandedRegions.has(region.id);
                        const cities = region.cities;
                        
                        return (
                          <li key={region.id} className="space-y-1">
                            {/* Регион с кнопкой раскрытия */}
                            <button
                              className={`w-full px-4 py-4 text-left text-base font-medium transition-all duration-300 rounded-lg flex items-center justify-between ${
                                selectedRegionId === region.id 
                                  ? 'text-[#FF4D15] bg-[#FFF4F0]' 
                                  : 'text-[#1B1B1B] hover:bg-gray-50'
                              }`}
                              onClick={() => toggleRegion(region.id)}
                              role="option"
                              aria-selected={selectedRegionId === region.id}
                            >
                              <span>{region.name}</span>
                              <span className={`text-lg transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                ⌄
                              </span>
                            </button>
                            
                            {/* Раскрытые города */}
                            {isExpanded && (
                              <ul className="ml-4 space-y-1">
                                {cities.map((city:any) => (
                                  <li key={city}>
                                    <button
                                      className="w-full px-4 py-3 text-left text-base font-medium text-[#1B1B1B] hover:bg-[#FFF4F0] hover:text-[#FF4D15] transition-all duration-300 rounded-lg"
                                      onClick={() => onSelect(city, region.name)}
                                      role="option"
                                      aria-selected={false}
                                    >
                                      {city}
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </li>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </ul>
              ) : (
                // Десктопная версия: обычный список регионов
                <ul className="divide-y divide-gray-100">
                  {filtered.map(letterGroup => (
                    <React.Fragment key={letterGroup.letter}>
                      {letterGroup.areas.map((region:any) => (
                        <li
                          key={region.id}
                          className={`px-4 py-4 cursor-pointer text-base font-medium transition-all duration-300 rounded-lg mx-2 ${
                            selectedRegionId === region.id 
                              ? 'text-[#FF4D15] bg-[#FFF4F0]' 
                              : 'text-[#1B1B1B] hover:bg-gray-50'
                          }`}
                          onClick={() => setSelectedRegionId(region.id)}
                          role="option"
                          aria-selected={selectedRegionId === region.id}
                        >
                          {region.name}
                        </li>
                      ))}
                    </React.Fragment>
                  ))}
                </ul>
              )}
            </div>

            {/* Divider */}
            {!isMobile && <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-200" />}

            {/* LocalityList - только для десктопа */}
            {!isMobile && !query.trim() && (
              <div className="w-1/2 overflow-y-auto">
                <ul className="divide-y divide-gray-100">
                  {filteredCities.length > 0 ? filteredCities.map((city:any) => (
                    <li
                      key={city}
                      className="px-4 py-4 cursor-pointer text-base font-medium text-[#1B1B1B] hover:bg-[#FFF4F0] hover:text-[#FF4D15] transition-all duration-300 rounded-lg mx-2"
                      onClick={() => onSelect(city, activeRegion.name)}
                      role="option"
                      aria-selected={false}
                    >
                      {city}
                    </li>
                  )) : (
                    <li className="px-4 py-8 text-gray-400 text-center">Нет городов</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 