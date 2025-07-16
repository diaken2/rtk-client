import React from 'react';
import { useSupportOnly } from '@/context/SupportOnlyContext';
import Image from 'next/image';

interface PromoSliderProps {
  onOpenSegmentationModal?: () => void;
}

const promos = [
  {
    img: '/promos/velikolepnaya_chetverka.png',
    title: 'Великолепная четверка: интернет, мобильная связь, интерактивное ТВ и онлайн-кинотеатр',
    link: '#'
  },
  // Добавьте сюда другие акции по аналогии
];

export default function PromoSlider({ onOpenSegmentationModal }: PromoSliderProps) {
  const { isSupportOnly } = useSupportOnly();

  return (
    <section className="container my-8">
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">Акции от Ростелеком</h2>
      <div className="relative">
        <div className="flex gap-6 overflow-x-auto pb-4 hide-scrollbar md:overflow-x-visible md:flex-wrap">
          {promos.map((promo, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl shadow p-4 md:p-8 flex flex-col md:flex-row items-center relative min-w-0 w-full md:min-w-[1000px] md:w-[1000px]"
            >
              <div className="w-full md:w-1/2 flex justify-center mb-4 md:mb-0 md:order-2">
                <Image src={promo.img} alt={promo.title} width={180} height={180} className="h-40 md:h-48 w-auto object-contain rounded-lg" />
              </div>
              <div className="flex-1 flex flex-col justify-center h-full md:pr-6 md:order-1">
                <p className="font-bold mb-4 text-xl leading-snug">{promo.title}</p>
                {isSupportOnly ? (
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-blue-600 font-medium mb-2">Для действующих абонентов</p>
                    <a 
                      href="tel:88001000800" 
                      className="text-blue-600 font-bold text-lg hover:underline"
                    >
                      8 800 100-08-00
                    </a>
                  </div>
                ) : (
                  <button 
                    className="btn-primary w-full md:w-[180px] h-12 text-base"
                    onClick={onOpenSegmentationModal}
                  >
                    Подробнее
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 