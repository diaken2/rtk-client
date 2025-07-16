import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Image from 'next/image';

const deviceTypes = [
  { key: "router", label: "Роутеры" },
  { key: "tvbox", label: "ТВ-приставки" },
];

const devices = [
  {
    type: "router",
    img: "/devices/huawei-hg8120h.png",
    name: "Оптический модем без Wi-Fi",
    model: "Huawei HG8120H",
    payment: "Аренда",
    price: 30,
    period: "₽/мес",
  },
  {
    type: "router",
    img: "/devices/zte-h298a.png",
    name: "Роутер",
    model: "ZTE H298A",
    payment: "Аренда",
    price: 100,
    period: "₽/мес",
  },
  {
    type: "router",
    img: "/devices/tp-link-td854w.png",
    name: "Роутер",
    model: "TP-Link TD854W",
    payment: "Аренда",
    price: 100,
    period: "₽/мес",
  },
  {
    type: "router",
    img: "/devices/zte-rt-gm-4.png",
    name: "Роутер",
    model: "ZTE RT-GM-4",
    payment: "Аренда",
    price: 150,
    period: "₽/мес",
  },
  {
    type: "router",
    img: "/devices/eltex-rg-5440g-wac.png",
    name: "Роутер",
    model: "Eltex RG-5440G-Wac",
    payment: "Аренда",
    price: 150,
    period: "₽/мес",
  },
  // Пример ТВ-приставки (добавьте свои файлы и параметры)
  {
    type: "tvbox",
    img: "/devices/wink-plus.png",
    name: "ТВ приставка",
    model: "Wink+",
    payment: "Рассрочка",
    price: 335,
    period: "₽/мес",
  },
  {
    type: "tvbox",
    img: "/devices/wink.png",
    name: "ТВ приставка",
    model: "Wink",
    payment: "Аренда",
    price: 100,
    period: "₽/мес",
  },
];

const EquipmentBlock: React.FC = () => {
  const [activeType, setActiveType] = useState("router");
  const filtered = devices.filter((d) => d.type === activeType);

  return (
    <section className="bg-[#f7f7f9] my-8">
      <div className="max-w-7xl mx-auto px-4 py-8 bg-white rounded-3xl shadow">
        <div className="mb-6">
          <h2 className="text-[34px] font-bold mb-2">Оборудование</h2>
          <p className="text-[18px] text-gray-500 mb-6">Доступные Wi-Fi роутеры и ТВ-приставки</p>
        </div>
        <div className="flex gap-4 mb-8">
          {deviceTypes.map((t) => (
            <button
              key={t.key}
              className={`px-6 py-2 rounded-full border-2 font-medium transition text-[14px] min-w-[140px] focus:outline-none ${
                activeType === t.key
                  ? "bg-[#ff5c00] border-[#ff5c00] text-white shadow-md"
                  : "bg-white border-[#ff5c00] text-[#ff5c00]"
              }`}
              onClick={() => setActiveType(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={24}
          slidesPerView="auto"
          centeredSlides={false}
          keyboard={{ enabled: true }}
          breakpoints={{
            0: { slidesPerView: 1, spaceBetween: 16 },
            480: { slidesPerView: "auto", spaceBetween: 24 },
          }}
          navigation
          pagination={{ clickable: true }}
          className="equipment-carousel pb-8"
        >
          {filtered.map((d, i) => (
            <SwiperSlide key={i} className="!w-[280px]">
              <div className="flex flex-col h-full bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
                <div className="mb-6 flex items-center justify-center bg-gray-50 rounded-2xl border border-gray-200 h-44">
                  <Image src={d.img} alt={d.name} className="h-36 object-contain mx-auto" width={144} height={144} />
                </div>
                <div className="flex-1 flex flex-col">
                  <span className="text-gray-500 text-lg mb-1">{d.name}</span>
                  <div className="font-bold text-2xl mb-2">{d.model}</div>
                  <span className="text-gray-400 text-base mb-1">{d.payment}</span>
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-bold">{d.price}</span>
                    <span className="text-lg text-gray-500">{d.period}</span>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default EquipmentBlock; 