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
    if (tariff.discountPrice !== undefined) {
      return (
        <div className="mb-4">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-2xl font-bold text-rt-cta">
              {tariff.discountPrice} ₽
            </span>
            <span className="text-lg text-gray-500 line-through">
              {tariff.price} ₽
            </span>
          </div>
          <div className="inline-flex items-center bg-gradient-to-r from-rt-cta to-rt-accent-blue text-white text-xs font-bold px-3 py-1 rounded-full">
            -{tariff.discountPercentage}% {tariff.discountPeriod}
          </div>
        </div>
      );
    }
    return (
      <div className="text-2xl font-bold text-rt-text mb-4">
        {tariff.price} ₽<span className="text-lg font-normal text-gray-600">/мес</span>
      </div>
    );
  };

  const renderSpecs = () => {
    const specs = [];
    
    if (tariff.speed) {
      specs.push(
        <div key="speed" className="flex items-center text-sm">
          <Image 
            src="/icons/ethernet.svg" 
            alt="Интернет" 
            width={16} 
            height={16} 
            className="mr-2"
          />
          <span className="font-medium">{tariff.speed} Мбит/с</span>
        </div>
      );
    }
    
    if (tariff.tvChannels) {
      specs.push(
        <div key="tv" className="flex items-center text-sm">
          <Image 
            src="/icons/tv.svg" 
            alt="ТВ" 
            width={16} 
            height={16} 
            className="mr-2"
          />
          <span className="font-medium">{tariff.tvChannels} каналов</span>
        </div>
      );
    }
    
    if (tariff.mobileData || tariff.mobileMinutes) {
      specs.push(
        <div key="mobile" className="flex items-center text-sm">
          <Image 
            src="/icons/mobile.svg" 
            alt="Мобильная связь" 
            width={16} 
            height={16} 
            className="mr-2"
          />
          <span className="font-medium">{tariff.mobileData} ГБ, {tariff.mobileMinutes} мин</span>
        </div>
      );
    }

    // Добавляем иконку Wink в блок характеристик
    if (tariff.winkIncluded) {
      specs.push(
        <div key="wink" className="flex items-center text-sm">
          <Image 
            src="/icons/wink.png" 
            alt="Wink" 
            width={16} 
            height={16} 
            className="mr-2"
          />
          <span className="font-medium">Wink включен</span>
        </div>
      );
    }
    
    return specs;
  };

  return (
    <div className="tariff-card hover-lift" {...(!isSupportOnly && onClick ? { onClick } : {})}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="font-bold text-lg text-rt-text mb-1 leading-tight">
            {tariff.name}
          </h3>
          <p className="text-gray-600 text-sm">{tariff.type}</p>
        </div>
        
        <div className="flex flex-col gap-1 ml-4">
          {tariff.isHit && (
            <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap">
              ХИТ
            </span>
          )}
          <span className="bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap">
            {tariff.technology}
          </span>
        </div>
      </div>
      
      {/* Характеристики */}
      <div className="space-y-2 mb-4">
        {renderSpecs()}
      </div>
      
      {/* Цена */}
      {renderPrice()}
      
      {/* Особенности */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-700 mb-3 text-sm">В тарифе:</h4>
        <ul className="text-sm text-gray-600 space-y-2">
          {tariff.features.slice(0, 3).map((feature: string, index: number) => (
            <li key={index} className="flex items-start">
              {feature.trim().toLowerCase().startsWith('wink') ? (
                <Image 
                  src="/icons/wink.png" 
                  alt="Wink" 
                  width={16} 
                  height={16} 
                  className="mr-2 mt-0.5 flex-shrink-0"
                />
              ) : (
                <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
              <span className="leading-tight">{feature}</span>
            </li>
          ))}
          {tariff.features.length > 3 && (
            <li className="text-rt-cta text-sm font-medium">
              +{tariff.features.length - 3} дополнительных услуг
            </li>
          )}
        </ul>
      </div>
      
      {/* Кнопка подключения */}
      <div className="text-center">
        {isSupportOnly ? (
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-blue-600 text-sm font-medium mb-1">Техническая поддержка</p>
            <a 
              href="tel:88001000800" 
              className="text-blue-600 font-bold text-base hover:underline"
            >
              8 800 100-08-00
            </a>
          </div>
        ) : (
          <>
            <button className="btn-primary w-full">
              Подключить
            </button>
            <div className="mt-2 text-xs text-gray-500">
              Подключение — {tariff.connectionPrice !== undefined ? `${tariff.connectionPrice} ₽` : '0 ₽'}
            </div>
          </>
        )}
      </div>
    </div>
  );
}