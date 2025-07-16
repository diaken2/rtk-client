"use client";

import React, { useState, useEffect } from 'react';
import Checkbox from "../ui/Checkbox";
import Input from "../ui/Input";
import Slider from "../ui/Slider";

interface FiltersProps {
  onFilterChange: (filters: any) => void;
  initialFilters?: any;
}

interface FilterState {
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
  priceRange: [number, number];
  speedRange: [number, number];
}

export default function Filters({ onFilterChange, initialFilters }: FiltersProps) {
  const [filters, setFilters] = useState<FilterState>(initialFilters || {
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
    priceRange: [300, 1500],
    speedRange: [50, 1000],
  });

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    onFilterChange({ ...filters, ...newFilters });
  };

  return (
    <aside className="lg:w-1/4 order-2 lg:order-1">
      <div className="bg-white rounded-xl shadow-md p-6 sticky top-4">
        <h3 className="text-lg font-bold mb-4">Фильтры</h3>
        
        {/* Услуги */}
        <div className="mb-6">
          <h4 className="font-semibold mb-2 flex items-center">
            Услуги
            <svg className="ml-2 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </h4>
          <div className="space-y-2">
            <div>
              <Checkbox 
                checked={filters.internet}
                onChange={() => handleFilterChange({ internet: !filters.internet })}
              >
                Интернет
              </Checkbox>
            </div>
            <div>
              <Checkbox 
                checked={filters.tv}
                onChange={() => handleFilterChange({ tv: !filters.tv })}
              >
                ТВ
              </Checkbox>
            </div>
            <div>
              <Checkbox 
                checked={filters.mobile}
                onChange={() => handleFilterChange({ mobile: !filters.mobile })}
              >
                Мобильная связь
              </Checkbox>
            </div>
            <div>
              <Checkbox 
                checked={filters.onlineCinema}
                onChange={() => handleFilterChange({ onlineCinema: !filters.onlineCinema })}
              >
                Онлайн-кинотеатры
              </Checkbox>
            </div>
            <div>
              <Checkbox 
                checked={filters.gameBonuses}
                onChange={() => handleFilterChange({ gameBonuses: !filters.gameBonuses })}
              >
                Игровые бонусы
              </Checkbox>
            </div>
          </div>
        </div>
        
        {/* Спецпредложения */}
        <div className="mb-6">
          <h4 className="font-semibold mb-2 flex items-center">
            Спецпредложения
            <svg className="ml-2 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </h4>
          <div className="space-y-2">
            <div>
              <Checkbox 
                checked={filters.promotions}
                onChange={() => handleFilterChange({ promotions: !filters.promotions })}
              >
                % Акции
              </Checkbox>
            </div>
            <div>
              <Checkbox 
                checked={filters.freeInstallation}
                onChange={() => handleFilterChange({ freeInstallation: !filters.freeInstallation })}
              >
                Бесплатное подключение
              </Checkbox>
            </div>
            <div>
              <Checkbox 
                checked={filters.wifiRouter}
                onChange={() => handleFilterChange({ wifiRouter: !filters.wifiRouter })}
              >
                Wi-Fi роутер
              </Checkbox>
            </div>
          </div>
        </div>
        
        {/* Куда подключать */}
        <div className="mb-6">
          <h4 className="font-semibold mb-2 flex items-center">
            Куда подключать
            <svg className="ml-2 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </h4>
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="radio"
                name="connectionType"
                checked={filters.connectionType === "apartment"}
                onChange={() => handleFilterChange({ connectionType: "apartment" })}
                className="mr-2 h-5 w-5 text-orange-500"
              />
              В квартиру
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                name="connectionType"
                checked={filters.connectionType === "house"}
                onChange={() => handleFilterChange({ connectionType: "house" })}
                className="mr-2 h-5 w-5 text-orange-500"
              />
              В частный дом
            </div>
          </div>
        </div>
        
        {/* Дополнительные услуги */}
        <div className="mb-6">
          <h4 className="font-semibold mb-2 flex items-center">
            Дополнительные услуги
            <svg className="ml-2 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </h4>
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={filters.hitsOnly}
                onChange={() => handleFilterChange({ hitsOnly: !filters.hitsOnly })}
                className="mr-2 h-5 w-5 text-orange-500"
              />
              Только хиты
            </div>
          </div>
        </div>
        
        {/* Стоимость */}
        <div className="mb-6">
          <h4 className="font-semibold mb-2 flex items-center">
            Стоимость в месяц (₽)
            <svg className="ml-2 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </h4>
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>{filters.priceRange[0]}</span>
            <span>до {filters.priceRange[1]}</span>
          </div>
          <Slider
            min={300}
            max={1500}
            value={filters.priceRange[1]}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange({ priceRange: [filters.priceRange[0], parseInt(e.target.value)] })}
          />
        </div>
        
        {/* Скорость */}
        <div className="mb-6">
          <h4 className="font-semibold mb-2 flex items-center">
            Скорость (Мбит/с)
            <svg className="ml-2 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </h4>
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>{filters.speedRange[0]}</span>
            <span>до {filters.speedRange[1]}</span>
          </div>
          <Slider
            min={50}
            max={1000}
            value={filters.speedRange[1]}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange({ speedRange: [filters.speedRange[0], parseInt(e.target.value)] })}
          />
        </div>
      </div>
    </aside>
  );
}