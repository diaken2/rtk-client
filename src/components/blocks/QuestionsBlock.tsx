import React, { useState, useEffect } from "react";
import InputMask from "react-input-mask";
import { useRouter } from "next/navigation";
import { submitLead } from '@/lib/submitLead';
import Image from 'next/image';
import { useSupportOnly } from '@/context/SupportOnlyContext';
import Link from 'next/link';

const categories = [
  { key: "connection", label: "Подключение" },
  { key: "support", label: "Поддержка" },
  { key: "other", label: "Другое" },
];

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

const otherOptions = [
  "Смена тарифа домашнего интернета (я абонент Ростелеком)",
  "Подключение ТВ или мобильной связи в мой тариф",
  "Другое"
];

const QuestionsBlock: React.FC = () => {
  const [category, setCategory] = useState<string | null>(null);
  const [houseType, setHouseType] = useState(houseTypes[0]);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [supportValue, setSupportValue] = useState<string | null>(null);
  const [otherValue, setOtherValue] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { setSupportOnly, isSupportOnly } = useSupportOnly();

  const isFormValid = phone.replace(/\D/g, "").length === 10 && name.trim().length > 1;

  const showSupportInfo =
    (category === "support" && supportValue) ||
    (category === "other" && (otherValue === otherOptions[0] || otherValue === otherOptions[2]));

  const showOtherForm = category === "other" && otherValue === otherOptions[1];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitted(true);

    try {
      const result = await submitLead({
        type: `Вопросы - ${category}`,
        name: name,
        phone: phone,
        houseType: houseType,
        supportValue: supportValue || undefined,
        otherValue: otherValue || undefined,
      });

      if (result.success) {
        setTimeout(() => {
          setSubmitted(false);
          setPhone("");
          setName("");
          setCategory(null);
          setSupportValue(null);
          setOtherValue(null);
          // Перенаправляем на страницу завершения
          router.push('/complete');
        }, 2000);
      } else {
        console.error('Failed to submit lead:', result.error);
        // В случае ошибки все равно показываем успех пользователю
        setTimeout(() => {
          setSubmitted(false);
          setPhone("");
          setName("");
          setCategory(null);
          setSupportValue(null);
          setOtherValue(null);
          // Перенаправляем на страницу завершения
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
        setCategory(null);
        setSupportValue(null);
        setOtherValue(null);
        // Перенаправляем на страницу завершения
        router.push('/complete');
      }, 2000);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (showSupportInfo) {
      setSupportOnly(true);
    }
  }, [showSupportInfo, setSupportOnly]);

  if (isSupportOnly) {
    return (
      <section className="w-full bg-[#f7f7f9] py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white rounded-3xl shadow-lg flex flex-col-reverse md:flex-row overflow-hidden min-h-[420px] md:min-h-[420px]">
            <div className="w-full md:w-[380px] flex-shrink-0 flex items-end justify-center bg-gray-50 order-1 md:order-none">
              <Image
                src="/questions/operator.png"
                alt="Оператор"
                className="object-cover w-full h-auto md:h-auto md:max-h-none max-h-64 md:max-w-none"
                width={220}
                height={220}
              />
            </div>
            <div className="flex-1 flex flex-col justify-start items-stretch p-8 md:p-12 order-2 md:order-none">
              <div className="w-full max-w-2xl h-full flex flex-col justify-center">
                <div className="flex flex-col justify-center h-full animate-fade-in" data-support-info>
                  <h2 className="text-2xl md:text-3xl font-bold mb-2 text-left">Вы являетесь действующим абонентом Ростелеком</h2>
                  <p className="text-base text-gray-500 mb-4 text-left">Мы не сможем ответить на вопросы по действующему подключению или сменить ваш текущий тариф</p>
                  <div className="mb-2 text-left">
                    <span className="text-base">Рекомендуем позвонить по номеру</span><br />
                    <a href="tel:88001000800" className="text-2xl md:text-3xl font-bold text-[#2250a7] hover:underline">8 800 100-08-00</a>
                  </div>
                  <div className="text-base text-left">
                    или узнать информацию в <a href="#" className="text-[#2250a7] underline">личном кабинете</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full bg-[#f7f7f9] py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-3xl shadow-lg flex flex-col-reverse md:flex-row overflow-hidden min-h-[420px] md:min-h-[420px]">
          {/* Фото оператора */}
          <div className="w-full md:w-[380px] flex-shrink-0 flex items-end justify-center bg-gray-50 order-1 md:order-none">
            <Image
              src="/questions/operator.png"
              alt="Оператор"
              className="object-cover w-full h-auto md:h-auto md:max-h-none max-h-64 md:max-w-none"
              width={220}
              height={220}
            />
          </div>
          {/* Форма/инфо */}
          <div className="flex-1 flex flex-col justify-start items-stretch p-8 md:p-12 order-2 md:order-none">
            <div className="w-full max-w-2xl h-full flex flex-col justify-start">
              {!(showSupportInfo || showOtherForm) ? (
                <>
                  <p className="text-2xl font-bold mb-1 text-left leading-tight">Остались вопросы?</p>
                  <span className="text-base font-normal text-gray-400 mb-3 block text-left">Выберите вариант</span>
                  <div className="flex gap-2 mb-5 overflow-x-auto pb-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.key}
                        className={`
                          flex-shrink-0 px-1.5 py-1.5 md:px-7 md:py-3
                          rounded-full border-2 font-normal md:font-semibold text-xs md:text-base transition focus:outline-none
                          ${category === cat.key
                            ? "bg-[#ff5c00] border-[#ff5c00] text-white"
                            : "border-[#ff5c00] text-[#ff5c00] bg-white"}
                        `}
                        onClick={() => {
                          setCategory(cat.key);
                          setSupportValue(null);
                          setOtherValue(null);
                        }}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                  {/* SUPPORT: show options */}
                  {category === "support" && (
                    <div className="flex flex-col gap-3 mb-4">
                      {supportOptions.map((opt) => (
                        <label key={opt} className="flex items-center cursor-pointer select-none">
                          <span
                            className={`w-6 h-6 flex items-center justify-center rounded-full border-2 mr-2 transition-all duration-150 ${
                              supportValue === opt
                                ? "border-[#ff5c00] bg-[#ff5c00]"
                                : "border-gray-300 bg-white"
                            }`}
                          >
                            {supportValue === opt && (
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <circle cx="8" cy="8" r="5" fill="#fff" />
                              </svg>
                            )}
                          </span>
                          <input
                            type="radio"
                            name="supportOption"
                            value={opt}
                            checked={supportValue === opt}
                            onChange={() => setSupportValue(opt)}
                            className="hidden"
                          />
                          <span className="text-base font-normal text-gray-700">{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  {/* OTHER: show options */}
                  {category === "other" && (
                    <div className="flex flex-col gap-3 mb-4">
                      {otherOptions.map((opt) => (
                        <label key={opt} className="flex items-start cursor-pointer select-none">
                          <span
                            className={`
                              w-5 h-5 md:w-6 md:h-6 flex items-center justify-center rounded-full border-2 mr-2 mt-1 transition-all duration-150
                              ${otherValue === opt ? "border-[#ff5c00] bg-[#ff5c00]" : "border-gray-300 bg-white"}
                            `}
                          >
                            {otherValue === opt && (
                              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                                <circle cx="8" cy="8" r="5" fill="#fff" />
                              </svg>
                            )}
                          </span>
                          <input
                            type="radio"
                            name="otherOption"
                            value={opt}
                            checked={otherValue === opt}
                            onChange={() => setOtherValue(opt)}
                            className="hidden"
                          />
                          <span className="text-xs md:text-base font-normal text-gray-700 break-words text-left">{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  {/* CONNECTION: show form */}
                  {category === "connection" && (
                    <form className="flex flex-col gap-4 animate-fade-in" autoComplete="off" onSubmit={handleSubmit}>
                      {/* Тип жилья */}
                      <div className="flex gap-2 mb-2 overflow-x-auto pb-2">
                        {houseTypes.map((type) => (
                          <label key={type} className="flex items-center cursor-pointer select-none flex-shrink-0">
                            <span
                              className={`
                                w-5 h-5 md:w-6 md:h-6 flex items-center justify-center rounded-full border-2 mr-2 transition-all duration-150
                                ${houseType === type ? "border-[#ff5c00] bg-[#ff5c00]" : "border-gray-300 bg-white"}
                              `}
                            >
                              {houseType === type && (
                                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                                  <circle cx="8" cy="8" r="5" fill="#fff" />
                                </svg>
                              )}
                            </span>
                            <input
                              type="radio"
                              name="houseType"
                              value={type}
                              checked={houseType === type}
                              onChange={() => setHouseType(type)}
                              className="hidden"
                            />
                            <span className={`text-xs md:text-base font-medium ${houseType === type ? "text-[#ff5c00]" : "text-gray-700"} break-words text-left`}>
                              {type}
                            </span>
                          </label>
                        ))}
                      </div>
                      {/* Поля ввода */}
                      <div className="flex flex-col md:flex-row gap-4 items-end w-full">
                        <div className="w-full md:flex-1">
                          <label className="block text-gray-500 mb-1 text-base">Введите телефон</label>
                          <div className="flex items-center rounded-full border border-gray-300 bg-white overflow-hidden w-full">
                            <span className="px-4 py-3 text-base text-[#2196f3] bg-[#f5f7fa] font-medium">+7</span>
                            <InputMask
                              mask="(999) 999-99-99"
                              value={phone}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
                              className="bg-transparent outline-none flex-1 text-base px-2 py-3 w-full"
                              placeholder="(___) ___-__-__"
                              type="tel"
                              autoComplete="tel"
                            />
                          </div>
                        </div>
                        <div className="w-full md:flex-1">
                          <label className="block text-gray-500 mb-1 text-base">Введите имя</label>
                          <input
                            type="text"
                            value={name}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                            className="w-full rounded-full border border-gray-300 bg-white px-4 py-3 text-base outline-none"
                            placeholder="Имя"
                            autoComplete="name"
                          />
                        </div>
                        <button
                          type="submit"
                          className={`w-full md:w-auto px-8 py-3 rounded-full text-base font-bold transition ml-0 md:ml-4 ${
                            isFormValid && !submitted && !isSubmitting
                              ? "bg-[#ff5c00] text-white"
                              : "bg-gray-300 text-white cursor-not-allowed"
                          }`}
                          disabled={!isFormValid || submitted || isSubmitting}
                        >
                          {submitted ? 'Отправлено!' : isSubmitting ? 'Отправляем...' : 'Жду звонка'}
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-gray-500 text-base">Перезвоним в течение 15 минут</span>
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5" stroke="#bdbdbd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                      <p className="text-xs text-gray-400 mt-2 text-right">
                        Отправляя заявку, вы соглашаетесь с <Link href="/privacy" className="underline text-[#2196f3]">политикой обработки данных</Link>
                      </p>
                    </form>
                  )}
                </>
              ) : showOtherForm ? (
                // OTHER FORM BLOCK
                <>
                  <p className="text-2xl font-bold mb-1 text-left leading-tight">Остались вопросы?</p>
                  <span className="text-base font-normal text-gray-400 mb-3 block text-left">Подключение дополнительных услуг</span>
                  <form className="flex flex-col gap-4 animate-fade-in" autoComplete="off" onSubmit={handleSubmit}>
                    <div className="flex flex-col md:flex-row gap-4 items-end w-full">
                      <div className="w-full md:flex-1">
                        <label className="block text-gray-500 mb-1 text-base">Введите телефон</label>
                        <div className="flex items-center rounded-full border border-gray-300 bg-white overflow-hidden w-full">
                          <span className="px-4 py-3 text-base text-[#2196f3] bg-[#f5f7fa] font-medium">+7</span>
                          <InputMask
                            mask="(999) 999-99-99"
                            value={phone}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
                            className="bg-transparent outline-none flex-1 text-base px-2 py-3 w-full"
                            placeholder="(___) ___-__-__"
                            type="tel"
                            autoComplete="tel"
                          />
                        </div>
                      </div>
                      <div className="w-full md:flex-1">
                        <label className="block text-gray-500 mb-1 text-base">Введите имя</label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                          className="w-full rounded-full border border-gray-300 bg-white px-4 py-3 text-base outline-none"
                          placeholder="Имя"
                          autoComplete="name"
                        />
                      </div>
                      <button
                        type="submit"
                        className={`w-full md:w-auto px-8 py-3 rounded-full text-base font-bold transition ml-0 md:ml-4 ${
                          isFormValid
                            ? "bg-[#ff5c00] text-white"
                            : "bg-gray-300 text-white cursor-not-allowed"
                        }`}
                        disabled={!isFormValid}
                      >
                        Жду звонка
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-gray-500 text-base">Перезвоним в течение 15 минут</span>
                      <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5" stroke="#bdbdbd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <p className="text-xs text-gray-400 mt-2 text-right">
                      Отправляя заявку, вы соглашаетесь с <Link href="/privacy" className="underline text-[#2196f3]">политикой обработки данных</Link>
                    </p>
                  </form>
                </>
              ) : (
                // SUPPORT/OTHER INFO BLOCK
                <div className="flex flex-col justify-center h-full animate-fade-in" data-support-info>
                  <h2 className="text-2xl md:text-3xl font-bold mb-2 text-left">Вы являетесь действующим абонентом Ростелеком</h2>
                  <p className="text-base text-gray-500 mb-4 text-left">Мы не сможем ответить на вопросы по действующему подключению или сменить ваш текущий тариф</p>
                  <div className="mb-2 text-left">
                    <span className="text-base">Рекомендуем позвонить по номеру</span><br />
                    <a href="tel:88001000800" className="text-2xl md:text-3xl font-bold text-[#2250a7] hover:underline">8 800 100-08-00</a>
                  </div>
                  <div className="text-base text-left">
                    или узнать информацию в <a href="#" className="text-[#2250a7] underline">личном кабинете</a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuestionsBlock; 