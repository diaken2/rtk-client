"use client";

import React from 'react';

export default function PromoBlock() {
  return (
    <section className="mt-8 bg-gradient-to-r from-[#ff4f12] to-[#7800ff] text-white rounded-xl p-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Акции Ростелеком</h2>
        <p className="mb-6">
          Подключите тариф с акционной ценой
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { title: "Семейный тариф", description: "Скидка 20% на 6 месяцев" },
            { title: "Бесплатное подключение", description: "Оборудование и установка бесплатно" },
            { title: "Игровые бонусы", description: "Для геймеров" }
          ].map((promo, index) => (
            <div key={index} className="bg-white rounded-xl p-6 text-center">
              <h3 className="text-xl font-bold mb-2">{promo.title}</h3>
              <p>{promo.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}