import React from 'react';
import Image from 'next/image';
import { useSupportOnly } from '@/context/SupportOnlyContext';

interface HowConnectProps {
  onOpenSegmentationModal?: () => void;
}

export default function HowConnect({ onOpenSegmentationModal }: HowConnectProps) {
  const { isSupportOnly } = useSupportOnly();

  return (
    <section className="container my-8 how-connect">
      <h2 className="text-[28px] font-bold text-center mb-10 how-connect__title">Как происходит подключение к Ростелеком</h2>
      <div className="flex flex-col md:flex-row justify-between gap-8 how-connect__wrap">
        {/* Шаг 1 */}
        <div className="flex flex-col items-center how-connect__item flex-1">
          <div className="flex flex-col items-center how-connect__item-header mb-2">
            <div className="flex items-center justify-center how-connect__item-img mb-2">
              <Image width={40} height={40} alt="step" src="/steps/step1.svg" />
            </div>
            <p className="font-semibold how-connect__item-title text-[20px]">Шаг 1</p>
          </div>
          <p className="text-center how-connect__item-descr text-[18px]">
            {isSupportOnly ? (
              <>Вы оставляете заявку на сайте</>
            ) : (
              <>
                Вы оставляете <button className="text-rt-cta underline" type="button" onClick={onOpenSegmentationModal}>заявку</button> на сайте или звоните по телефону <a className="text-rt-cta font-semibold" href="tel:89956738579">8 995 673-85-79</a>
              </>
            )}
          </p>
        </div>
        {/* Шаг 2 */}
        <div className="flex flex-col items-center how-connect__item flex-1">
          <div className="flex flex-col items-center how-connect__item-header mb-2">
            <div className="flex items-center justify-center how-connect__item-img mb-2">
              <Image width={40} height={40} alt="step" src="/steps/step2.svg" />
            </div>
            <p className="font-semibold how-connect__item-title text-[20px]">Шаг 2</p>
          </div>
          <p className="text-center how-connect__item-descr text-[18px]">
            Наш специалист связывается с вами для уточнения деталей, согласования даты и времени выезда мастера
          </p>
        </div>
        {/* Шаг 3 */}
        <div className="flex flex-col items-center how-connect__item flex-1">
          <div className="flex flex-col items-center how-connect__item-header mb-2">
            <div className="flex items-center justify-center how-connect__item-img mb-2">
              <Image width={40} height={40} alt="step" src="/steps/step3.svg" />
            </div>
            <p className="font-semibold how-connect__item-title text-[20px]">Шаг 3</p>
          </div>
          <p className="text-center how-connect__item-descr text-[18px]">
            В назначенное время монтажник подключает интернет и настраивает оборудование
          </p>
        </div>
      </div>
    </section>
  );
} 