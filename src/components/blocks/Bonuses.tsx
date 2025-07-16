import React from "react";
import Image from 'next/image';

const bonuses = [
  {
    img: "/bonuses/bonus1.png",
    title: "Копи бонусы и выбирай лучшее",
    desc: 'Стань участником программы "Бонус" от Ростелеком и меняй бонусы на подарки!',
  },
  {
    img: "/bonuses/bonus2.png",
    title: "Облачное хранилище",
    desc: "Получайте +1 ТБ дополнительного места каждый месяц в облачном хранилище от Ростелекома",
  },
  {
    img: "/bonuses/bonus3.png",
    title: "Сервис Лицей",
    desc: "Вся школьная программа по ФГОС и развивающие курсы от лучших учителей",
  },
  {
    img: "/bonuses/bonus4.png",
    title: "Умная колонка",
    desc: "Управляет сервисами Wink, Умный дом от Ростелекома и многое другое.",
  },
  {
    img: "/bonuses/bonus5.png",
    title: "Умный дом",
    desc: "Следите за домом и будьте за него спокойны даже на расстоянии!",
  },
  {
    img: "/bonuses/bonus6.png",
    title: "Подписка Литрес",
    desc: "Подключайтесь на специальных условиях к крупнейшему сервису электронных и аудиокниг Литрес.",
  },
];

const Bonuses: React.FC = () => (
  <section className="max-w-7xl mx-auto px-4 py-8">
    <h2 className="text-3xl font-bold mb-8">Бонусы</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
      {bonuses.map((bonus, idx) => (
        <div key={idx} className="flex items-start gap-5">
          <div className="w-20 h-20 min-w-[80px] min-h-[80px] rounded-full bg-white flex items-center justify-center shadow-md mr-4">
            <Image
              src={bonus.img}
              alt={bonus.title}
              className="w-14 h-14 object-contain"
              width={80}
              height={80}
              loading="lazy"
            />
          </div>
          <div>
            <div className="font-semibold text-lg mb-1 leading-snug">{bonus.title}</div>
            <div className="text-gray-500 text-base leading-snug">{bonus.desc}</div>
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default Bonuses; 