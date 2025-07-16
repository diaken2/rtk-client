import React, { useState } from "react";
import { useCity } from '@/context/CityContext';

const FaqBlock = () => {
  const { city } = useCity();
  const cityLabel = city && city.trim().length > 0 ? `в ${city.trim()}` : 'в России';
  const [open, setOpen] = useState<number | null>(null);

  const faq = [
    {
      question: `Как подключить Ростелеком ${cityLabel}?`,
      answer: (
        <>
          Ростелеком предоставляет широкий спектр услуг для физических лиц. Для подключения достаточно оставить заявку на сайте. Заполните форму онлайн за пару минут: укажите тариф, необходимое оборудование, удобное время и день для приезда мастера, а также свой контактный номер. Специалисты быстро обработают ваш запрос и, при необходимости, свяжутся уточнить детали.
        </>
      ),
    },
    {
      question: `Какие услуги Ростелеком предоставляет ${cityLabel}?`,
      answer: (
        <>
          Ростелеком предоставляет полный спектр телекоммуникационных услуг, включая скоростной интернет до 700 Мбит/с и телевидение до 210 каналов. Вы можете выбрать подходящий тарифный план, который будет соответствовать вашим требованиям и бюджету.
        </>
      ),
    },
    {
      question: `Сколько стоит ${cityLabel} подключить Ростелеком?`,
      answer: (
        <>
          Стоимость зависит от наполнения тарифного плана и его характеристик. Можно подобрать вариант под любой бюджет. Недорогие предложения в вашем городе начинаются от 642 руб/мес — они включают себя базовые параметры и минимальную скорость соединения в вашем городе. Более скоростные, а также пакетные тарифы с комплексом услуг могут стоить до 1600 руб/мес.
        </>
      ),
    },
    {
      question: "Как проверить возможность подключения Ростелеком в моем доме?",
      answer: (
        <>
          Чтобы узнать, возможно ли подключение Ростелеком в вашем доме, воспользуйтесь онлайн-проверкой: введите свой адрес на этой странице в специальной форме. Если система показала отсутствие технической возможности, обратитесь в {" "}
          <a href="https://rt.ru/" target="_blank" rel="noopener noreferrer" className="text-[#2250a7] underline">службу поддержки клиентов Rostelecom</a> для получения консультации.
        </>
      ),
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-[24px] font-bold mb-8 text-left text-[#0f191e]">Вопросы и ответы по подключению</h2>
      <div className="flex flex-col gap-2">
        {faq.map((item, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm"
          >
            <button
              className="w-full flex items-center justify-between px-6 py-5 text-[14px] font-medium text-left focus:outline-none transition text-[#0f191e]"
              onClick={() => setOpen(open === idx ? null : idx)}
              aria-expanded={open === idx}
            >
              <span>{item.question}</span>
              <svg
                className={`w-6 h-6 ml-4 transition-transform duration-200 ${open === idx ? "rotate-180" : "rotate-0"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div
              className={`transition-all duration-300 px-6 ${open === idx ? "max-h-[500px] py-4" : "max-h-0 py-0 overflow-hidden"}`}
            >
              <div className="text-[16px] text-[#686868] leading-relaxed">{item.answer}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FaqBlock; 