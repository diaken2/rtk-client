"use client";

import React from 'react';
import Image from 'next/image';
import { useSupportOnly } from '@/context/SupportOnlyContext';

interface TariffCardProps {
  tariff: any;
  onClick?: () => void;
}

export default function TariffCard({ tariff, onClick }: TariffCardProps) {
  const { isSupportOnly } = useSupportOnly();

  const renderPrice = () => {
    if (tariff.discountPrice !== undefined && tariff.discountPrice !== null) {
      const discountPercent = Math.round((1 - tariff.discountPrice / tariff.price) * 100);
      
      return (
        <div className="mb-6">
          <div className="flex items-end gap-2 mb-3">
            <span className="text-3xl font-bold text-gray-900">
              {tariff.discountPrice} ₽
            </span>
            <span className="text-lg text-gray-500 line-through">
              {tariff.price} ₽
            </span>
            <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              -{discountPercent}%
            </span>
          </div>
          {tariff.discountPeriod && (
            <div className="text-sm text-green-600 font-medium">
              {tariff.discountPeriod}
            </div>
          )}
        </div>
      );
    }
    
    return (
      <div className="mb-6">
        <div className="text-3xl font-bold text-gray-900">
          {tariff.price} ₽
        </div>
        <div className="text-sm text-gray-600">в месяц</div>
      </div>
    );
  };

  const renderSpecs = () => {
    const specs = [];
    
    if (tariff.speed) {
      specs.push(
        <div key="speed" className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Image 
              src="/icons/ethernet.svg" 
              alt="Скорость интернета" 
              width={20} 
              height={20}
            />
          </div>
          <div>
            <div className="font-semibold text-gray-900">{tariff.speed} Мбит/с</div>
            <div className="text-sm text-gray-600">Интернет</div>
          </div>
        </div>
      );
    }
    
    if (tariff.tvChannels) {
      specs.push(
        <div key="tv" className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <Image 
              src="/icons/tv.svg" 
              alt="ТВ каналы" 
              width={20} 
              height={20}
            />
          </div>
          <div>
            <div className="font-semibold text-gray-900">{tariff.tvChannels} каналов</div>
            <div className="text-sm text-gray-600">Телевидение</div>
          </div>
        </div>
      );
    }
    
    if (tariff.mobileData || tariff.mobileMinutes) {
      specs.push(
        <div key="mobile" className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <Image 
              src="/icons/mobile.svg" 
              alt="Мобильная связь" 
              width={20} 
              height={20}
            />
          </div>
          <div>
            <div className="font-semibold text-gray-900">
              {tariff.mobileData || 0} ГБ + {tariff.mobileMinutes || 0} мин
            </div>
            <div className="text-sm text-gray-600">Мобильная связь</div>
          </div>
        </div>
      );
    }

    if (tariff.winkIncluded) {
      specs.push(
        <div key="wink" className="flex items-center gap-3 p-3 bg-pink-50 rounded-xl">
          <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
            <Image 
              src="/icons/wink.png" 
              alt="Wink" 
              width={20} 
              height={20}
              className="rounded"
            />
          </div>
          <div>
            <div className="font-semibold text-gray-900">Wink включен</div>
            <div className="text-sm text-gray-600">Онлайн-кинотеатр</div>
          </div>
        </div>
      );
    }
    
    return specs;
  };

  const renderFeatures = () => {
    return (
      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">
          Включено в тариф:
        </h4>
        <div className="space-y-2">
          {tariff.features?.slice(0, 4).map((feature: string, index: number) => (
            <div key={index} className="flex items-start gap-2">
              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-sm text-gray-700 leading-relaxed">{feature}</span>
            </div>
          ))}
          
          {tariff.features?.length > 4 && (
            <div className="text-orange-600 text-sm font-medium pt-2">
              +{tariff.features.length - 4} дополнительных услуги
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div 
      className="group relative bg-white rounded-2xl border border-gray-200 hover:border-orange-300 transition-all duration-300 hover:shadow-xl overflow-hidden"
      {...(!isSupportOnly && onClick ? { onClick } : {})}
    >
      {/* Бейдж хита */}
      {tariff.isHit && (
        <div className="absolute -top-2 -right-2 z-10">
          <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg transform rotate-6">
            🔥 ХИТ ПРОДАЖ
          </div>
        </div>
      )}

      {/* Верхняя часть с градиентом */}
      <div className="bg-gradient-to-r from-[#FF6A2B] to-[#FF4D15] p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-6 translate-x-6"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2 leading-tight">
                {tariff.name}
              </h3>
              <p className="text-white/90 text-sm opacity-95">{tariff.type}</p>
            </div>
            
            {tariff.technology && (
              <div className="bg-white/20 text-white text-xs font-medium px-3 py-1 rounded-full backdrop-blur-sm">
                {tariff.technology}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Основное содержимое */}
      <div className="p-6">
        {/* Спецификации */}
        <div className="grid gap-3 mb-6">
          {renderSpecs()}
        </div>

        {/* Цена */}
        {renderPrice()}

        {/* Особенности */}
        {renderFeatures()}

        {/* Кнопка подключения */}
        <div className="text-center">
          {isSupportOnly ? (
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <p className="text-blue-700 text-sm font-medium mb-2">
                Техническая поддержка
              </p>
              <a 
                href="tel:88001000800" 
                className="text-blue-700 font-bold text-lg hover:underline block mb-1"
              >
                8 800 100-08-00
              </a>
              <p className="text-blue-600 text-xs">Бесплатно по РФ</p>
            </div>
          ) : (
            <>
              <button className="w-full bg-gradient-to-r from-[#FF6A2B] to-[#FF4D15] text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 group-hover:scale-105">
                Подключить за {tariff.connectionPrice !== undefined ? `${tariff.connectionPrice} ₽` : '0 ₽'}
              </button>
              
              {tariff.connectionPrice === 0 && (
                <div className="text-green-600 text-sm font-medium mt-3">
                  ✓ Бесплатное подключение
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Декоративный элемент */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#FF6A2B] to-[#FF4D15]"></div>
    </div>
  );
}