"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import QuestionsBlock from "@/components/blocks/QuestionsBlock";
import InputMask from "react-input-mask";
import { submitLead } from '@/lib/submitLead';

const houseTypes = [
  "Квартира",
  "Частный дом",
  "Офис"
];

const supportOptions = [
  "Оплата услуг",
  "Оборудование",
  "Не работает интернет/ТВ"
];

export default function ContactsBlock() {
  const router = useRouter();

  const handleFooterCategoryClick = (category: string) => {
    console.log('Footer category clicked:', category);
  };

  const scrollToTariffs = () => {
    console.log('Scroll to tariffs');
  };

  // Компонент формы подбора тарифа (как на главной странице)
  function TariffHelpForm() {
    const [step, setStep] = React.useState<null | 'connection' | 'support'>(null);
    const [houseType, setHouseType] = React.useState(houseTypes[0]);
    const [phone, setPhone] = React.useState("");
    const [name, setName] = React.useState("");
    const [supportValue, setSupportValue] = React.useState<string | null>(null);
    const isFormValid = phone.replace(/\D/g, "").length === 10 && name.trim().length > 1;
    const [submitted, setSubmitted] = React.useState(false);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      setSubmitted(true);

      try {
        const result = await submitLead({
          type: step === 'connection' ? 'Новое подключение (страница контактов)' : 'Поддержка существующего абонента (страница контактов)',
          name: name,
          phone: phone,
          houseType: houseType,
          supportValue: supportValue || undefined,
        });

        if (result.success) {
          setTimeout(() => {
            setSubmitted(false);
            setPhone(""); 
            setName("");
            router.push('/complete');
          }, 2000);
        } else {
          console.error('Failed to submit lead:', result.error);
          // В случае ошибки все равно показываем успех пользователю
          setTimeout(() => {
            setSubmitted(false);
            setPhone(""); 
            setName("");
            router.push('/complete');
          }, 2000);
        }
      } catch (error) {
        console.error('Error submitting lead:', error);
        // В случае ошибки все равно показываем успех пользователю
        setTimeout(() => {
          setSubmitted(false);
          setPhone(""); 
          setName("");
          router.push('/complete');
        }, 2000);
      } finally {
        setIsSubmitting(false);
      }
    };

    if (!step) {
      return (
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button className="bg-[#ff4d06] text-white font-bold rounded-full px-10 py-4 text-lg transition hover:bg-[#ff7f2a]" onClick={() => setStep('connection')}>Новое подключение</button>
          <button className="bg-transparent border-2 border-white text-white font-bold rounded-full px-10 py-4 text-lg transition hover:bg-white hover:text-[#8000ff]" onClick={() => setStep('support')}>Я существующий абонент</button>
        </div>
      );
    }

    if (step === 'connection') {
      return (
        <>
          <form className="w-full flex flex-col gap-4" autoComplete="off" onSubmit={handleSubmit}>
            {/* Радиокнопки */}
            <div className="flex flex-row gap-8 items-center mb-2 overflow-x-auto pb-2">
              {houseTypes.map((type) => (
                <label key={type} className="flex items-center cursor-pointer select-none text-[16px] font-medium font-sans flex-shrink-0">
                  <span className={`w-7 h-7 flex items-center justify-center rounded-full border-2 mr-2 transition-all duration-150 ${houseType === type ? "border-[#FF4F12] bg-[#FF4F12]" : "border-gray-300 bg-white"}`}>
                    {houseType === type && (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5" fill="#fff" /></svg>
                    )}
                  </span>
                  <input type="radio" name="houseType" value={type} checked={houseType === type} onChange={() => setHouseType(type)} className="hidden" />
                  <span className={`text-[16px] font-medium font-sans ${houseType === type ? "text-white" : "text-white/80"}`}>{type}</span>
                </label>
              ))}
            </div>
            {/* Поля и кнопка в один ряд */}
            <div className="flex flex-col md:flex-row gap-4 items-end w-full">
              {/* Телефон */}
              <div className="w-full md:flex-1">
                <label className="text-[14px] font-medium font-sans mb-1 text-white text-left">Введите телефон</label>
                <div className="flex flex-row items-center bg-white rounded-full overflow-hidden h-[44px]">
                  <span className="bg-gray-100 text-gray-500 px-3 h-full flex items-center font-semibold text-base rounded-l-full select-none">+7</span>
                  <InputMask
                    mask="(999) 999-99-99"
                    value={phone}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
                    className="flex-1 bg-transparent border-none px-2 py-2 text-base text-[#222] placeholder-[#bbb] outline-none focus:ring-2 focus:ring-orange-500 transition font-sans"
                    placeholder="(___) ___-__-__"
                    type="tel"
                    autoComplete="tel"
                  />
                </div>
              </div>
              {/* Имя */}
              <div className="w-full md:flex-1">
                <label className="text-[14px] font-medium font-sans mb-1 text-white text-left">Введите имя</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                  className="w-full rounded-full bg-white px-4 py-2 text-base text-[#222] placeholder-[#bbb] outline-none focus:ring-2 focus:ring-orange-500 transition h-[44px] font-sans"
                  placeholder="Имя"
                  autoComplete="name"
                />
              </div>
              {/* Кнопка */}
              <button
                type="submit"
                className={`w-full md:w-[200px] h-[44px] rounded-full px-6 text-[16px] font-medium font-sans transition ml-0 md:ml-4 ${isFormValid && !submitted && !isSubmitting ? "bg-[#FF4F12] text-white" : "bg-[#FFD6C2] text-white cursor-not-allowed"}`}
                disabled={!isFormValid || submitted || isSubmitting}
              >
                {submitted ? 'Отправлено!' : isSubmitting ? 'Отправляем...' : 'Жду звонка'}
              </button>
            </div>
            {/* Подпись под полем */}
            <div className="flex items-center gap-2 mt-3 justify-start">
              <span className="text-white text-[13px] font-normal font-sans">Перезвоним в течение 15 минут</span>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            {/* Юридическая строка */}
            <p className="text-[12px] font-light font-sans mt-2 text-left text-[#D8B5FF]">Отправляя заявку, вы соглашаетесь с <a href="#" className="underline">политикой обработки персональных данных</a></p>
          </form>
        </>
      );
    }

    // step === 'support'
    return (
      <div className="flex flex-col gap-4 items-center animate-fade-in">
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 w-full">
          {supportOptions.map((opt) => (
            <button key={opt} className={`px-7 py-3 rounded-full border-2 font-semibold text-base transition focus:outline-none flex-shrink-0 ${supportValue === opt ? "bg-[#ff4d06] border-[#ff4d06] text-white" : "border-white text-white bg-transparent"}`} onClick={() => setSupportValue(opt)}>{opt}</button>
          ))}
        </div>
        {supportValue && (
          <div className="bg-white/10 rounded-xl p-6 max-w-lg text-center">
            <h3 className="text-xl font-bold mb-2 text-white">Вы являетесь действующим абонентом Ростелеком</h3>
            <p className="mb-2 text-white/80">Мы не сможем ответить на вопросы по действующему подключению или сменить ваш текущий тариф.</p>
            <div className="mb-2">
              <span className="text-base text-white/80">Рекомендуем позвонить по номеру</span><br />
              <a href="tel:88001000800" className="text-2xl md:text-3xl font-bold text-white hover:underline">8 800 100-08-00</a>
              <div className="text-xs text-white/60">Звонок бесплатный по РФ</div>
            </div>
            <div className="text-base text-white/80">
              или узнать информацию в <a href="#" className="underline text-white">личном кабинете</a>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-900">
              Контакты официального дилера Ростелеком
            </h1>
            
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8">
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-6">
                  <h2 className="text-xl font-semibold mb-4 text-gray-900">Контактная информация</h2>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <span className="font-medium text-gray-700 w-48">Телефон для подключения:</span>
                      <a href="tel:88003509015" className="text-rt-cta font-semibold hover:underline">
                        8 800 350-90-15
                      </a>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium text-gray-700 w-48">Телефон поддержки:</span>
                      <a href="tel:88001000800" className="text-rt-cta font-semibold hover:underline">
                        8 800 100-08-00
                      </a>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium text-gray-700 w-48">Электронная почта:</span>
                      <a href="mailto:contact-compas@internet.ru" className="text-rt-cta font-semibold hover:underline">
                        contact-compas@internet.ru
                      </a>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    Весь контент этого веб-сайта предоставлен на основании договора о партнерских отношениях с ПАО «Ростелеком». Подавая заявку на подключение услуг через наш сайт, вы автоматически соглашаетесь с нашей «Политикой обработки персональных данных».
                  </p>
                  
                  <p>
                    На данном сайте вы можете ознакомиться с правилами и процедурой подключения следующих услуг провайдера: &ldquo;Интернет&rdquo;, &ldquo;Интернет + ТВ&rdquo;, &ldquo;Интернет + Мобильная связь&rdquo;, &ldquo;Интернет + ТВ + Мобильная связь&rdquo;.
                  </p>
                  
                  <p>
                    Любая информация, предоставленная пользователями сайта, используется исключительно для проверки технической возможности подключения к услугам Ростелеком. Помните, что консультация, подключение и подача заявок для клиентов являются бесплатными.
                  </p>
                  
                  <p>
                    Cайт home-rtk.ru не является средством массовой информации (СМИ). Представленная на сайте информация не является публичной офертой в соответствии со Статьей 437 (2) Гражданского кодекса РФ.
                  </p>
                  
                  <p>
                    Для получения последних официальных новостей и документов ПАО «Ростелеком», пожалуйста, посетите официальный сайт rt.ru.
                  </p>
                  
                  <p>
                    Если вам требуется подключение интернета, телевидения, мобильной связи и телефонии от «Ростелеком», обращайтесь к нам. Услуги связи предоставляются ПАО «Ростелеком».
                  </p>
                </div>
              </div>
            </div>

            {/* Блок "Хотите быстро найти самый выгодный тариф?" */}
            <section className="mt-12 rounded-3xl bg-[#7000FF] p-6 md:p-12 text-white flex flex-col items-center justify-center max-w-3xl mx-auto shadow-lg">
              <div className="w-full flex flex-col gap-2 md:gap-4">
                <h2 className="text-[28px] leading-[1.05] font-bold font-sans mb-2 md:mb-3 text-left text-white">
                  Хотите быстро найти самый выгодный тариф?
                </h2>
                <p className="text-[18px] leading-[1.2] font-normal font-sans mb-4 md:mb-6 text-left max-w-xl text-white">
                  Подберите тариф с экспертом. Найдём для вас лучшее решение с учетом ваших пожеланий
                </p>
                <TariffHelpForm />
              </div>
            </section>
          </div>
        </div>
      </main>
      
      {/* Блок "Остались вопросы?" */}
      <QuestionsBlock />
      
      <Footer />
    </>
  );
} 