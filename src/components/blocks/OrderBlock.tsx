"use client";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/ui/Logo';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Checkbox from '@/components/ui/Checkbox';
import { useSupportOnly } from '@/context/SupportOnlyContext';
import classNames from "classnames";
import InputMask from 'react-input-mask';
import { tariffsData } from '@/components/tariff/tariffsData';
import { AddressSuggestions, DaDataSuggestion, DaDataAddress } from 'react-dadata';
import 'react-dadata/dist/react-dadata.css';

const steps = [
  { title: "Адрес подключения", description: "Укажите ваш адрес" },
  { title: "Выбор услуги", description: "Интернет, ТВ или связь" },
  { title: "Контактные данные", description: "ФИО и телефон" },
  { title: "Выбор тарифа", description: "Скорость и цена" },
  { title: "Роутер", description: "Аренда или свой" },
  { title: "ТВ-приставка", description: "При необходимости" },
  { title: "Дата и время", description: "Удобное для вас" },
  { title: "Подтверждение", description: "Проверьте данные" },
];

// Вместо локального массива тарифов:
const getTariffs = (service: string) => {
  let typeName = '';
  if (service === 'access') typeName = 'Интернет';
  if (service === 'entertainment') typeName = 'Интернет + ТВ';
  if (service === 'communication') typeName = 'Интернет + Моб. связь';
  if (service === 'combo') typeName = 'Интернет + ТВ + Моб. связь';

  // 1. Сначала акционные (есть discountPrice или discountPercentage)
  const promo = tariffsData
    .filter(tariff => tariff.type === typeName && (tariff.discountPrice !== undefined || tariff.discountPercentage))
    .sort((a, b) => (a.discountPrice ?? a.price) - (b.discountPrice ?? b.price));

  // 2. Потом обычные (без скидки)
  const regular = tariffsData
    .filter(tariff => tariff.type === typeName && (tariff.discountPrice === undefined && !tariff.discountPercentage))
    .sort((a, b) => a.price - b.price);

  // 3. Собираем итоговый массив (максимум 3)
  return [...promo, ...regular].slice(0, 3);
};
export async function generateMetadata({ params }: { params: { city: string } }) {
 

  return { title: `Заявка на подключение к Ростелеком — подать заявку онлайн в Ростелеком.` };
}

// Оборудование
const routers = [
  { 
    id: 'zte-rt-gm-4', 
    name: 'ZTE RT-GM-4', 
    price: 150, 
    description: 'Оптический модем с Wi-Fi', 
    features: ['GPON', 'Wi-Fi 4', '4 порта LAN', 'Рекомендуем'],
    recommended: true
  },
  { 
    id: 'huawei-hg8120h', 
    name: 'Huawei HG8120H', 
    price: 30, 
    description: 'Оптический модем без Wi-Fi', 
    features: ['GPON', '2 порта LAN', 'Компактный'],
    recommended: false
  },
  { 
    id: 'zte-h298a', 
    name: 'ZTE H298A', 
    price: 100, 
    description: 'Wi-Fi Роутер', 
    features: ['Wi-Fi 4', '4 порта LAN', 'USB порт'],
    recommended: false
  },
  { 
    id: 'eltex-rg-5440g-wac', 
    name: 'Eltex RG-5440G-Wac', 
    price: 150, 
    description: 'Wi-Fi Роутер', 
    features: ['Wi-Fi 4', '4 порта LAN', 'Игровой роутер'],
    recommended: false
  },
];

const tvBoxes = [
  { 
    id: 'wink', 
    name: 'Wink', 
    price: 100, 
    description: 'Android ТВ-приставка', 
    features: ['Android TV', 'Full HD', 'Голосовой пульт'],
    recommended: true
  },
  { 
    id: 'wink-plus', 
    name: 'Wink+', 
    price: 335, 
    description: 'Android ТВ-приставка', 
    features: ['Android TV', '4K Ultra HD', 'Голосовой пульт', '24 месяца'],
    recommended: false
  },
];

// Компонент счетчика оборудования
const EquipmentCounter = ({ 
  id, 
  name, 
  price, 
  description, 
  features, 
  recommended, 
  count, 
  onIncrement, 
  onDecrement 
}: {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  recommended?: boolean;
  count: number;
  onIncrement: () => void;
  onDecrement: () => void;
}) => (
  <div className={`border rounded-lg p-4 transition-all relative ${count > 0 ? 'border-[#FF4B00] bg-[#FF4B0008]' : 'border-[#E0E0E0] hover:border-[#FF4B00]'}`}>
    {recommended && (
      <div className="absolute -top-2 -right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
        Рекомендуем
      </div>
    )}
    
    <div className="flex justify-between items-start mb-2">
      <div className="font-bold text-lg">{name}</div>
      <div className="font-bold text-lg text-[#FF4B00]">{price} ₽/мес</div>
    </div>
    
    <div className="text-sm text-[#6D7683] mb-3">{description}</div>
    
    <div className="flex gap-2 mb-4">
      {features.map(feature => (
        <span key={feature} className="bg-gray-100 px-2 py-1 rounded text-xs">
          {feature}
        </span>
      ))}
    </div>
    
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <button
          onClick={onDecrement}
          disabled={count === 0}
          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:border-[#FF4B00] hover:text-[#FF4B00] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          -
        </button>
        <span className="w-8 text-center font-medium">{count}</span>
        <button
          onClick={onIncrement}
          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:border-[#FF4B00] hover:text-[#FF4B00]"
        >
          +
        </button>
      </div>
      {count > 0 && (
        <div className="text-sm text-[#6D7683]">
          Итого: {count * price} ₽/мес
        </div>
      )}
    </div>
  </div>
);

// Функция для правильного склонения и текста промо
const getPromoText = (months: number) => {
  if (months === 1) return '0 ₽ в первый месяц';
  if (months >= 2 && months <= 4) return `0 ₽ в первые ${months} месяца`;
  return `0 ₽ в первые ${months} месяцев`;
};

// Функция для проверки, содержит ли адрес квартиру
const hasApartmentInAddress = (address: string) => {
  if (!address) return false;
  const apartmentPatterns = [
    /кв\.?\s*\d+/i,
    /квартира\s*\d+/i,
    /квартиры\s*\d+/i,
    /апартаменты\s*\d+/i,
    /помещение\s*\d+/i,
    /офис\s*\d+/i,
    /комната\s*\d+/i,
    /,\s*\d+\s*$/  // просто номер в конце адреса
  ];
  return apartmentPatterns.some(pattern => pattern.test(address));
};

export default function OrderBlock() {
  const router = useRouter();
  const { isSupportOnly } = useSupportOnly();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<{
    address: { street: DaDataSuggestion<DaDataAddress> | undefined; propertyType: string; apartment: string };
    service: string;
    contacts: { lastname: string; firstname: string; middlename: string; phone: string };
    tariff: { id: string; name: string; price: number; discountPrice?: number; discountPercentage?: number; discountPeriod?: string };
    routers: Record<string, number>;
    tvBoxes: Record<string, number>;
    ownRouter: boolean;
    ownTVBox: boolean;
    date: { day: number; time: string; asap: boolean; fullDate: Date | null; dayOfWeek: number };
  }>({
    address: { street: undefined, propertyType: '', apartment: '' },
    service: '',
    contacts: { lastname: '', firstname: '', middlename: '', phone: '' },
    tariff: { id: '', name: '', price: 0, discountPrice: undefined, discountPercentage: undefined, discountPeriod: undefined },
    routers: { 'zte-rt-gm-4': 0, 'huawei-hg8120h': 0, 'zte-h298a': 0, 'eltex-rg-5440g-wac': 0 },
    tvBoxes: { 'wink': 0, 'wink-plus': 0 },
    ownRouter: false,
    ownTVBox: false,
    date: { day: 0, time: '12:00-15:00', asap: false, fullDate: null, dayOfWeek: 0 },
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Автоматически устанавливаем тип недвижимости, если в адресе есть квартира
  useEffect(() => {
    const addressValue = formData.address.street?.value || '';
    if (hasApartmentInAddress(addressValue) && formData.address.propertyType !== 'apartment') {
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, propertyType: 'apartment' }
      }));
    }
  }, [formData.address.street, formData.address.propertyType]);

  // Прогресс-бар для мобильных
  const visibleSteps = steps.length;
  const progressPercent = ((currentStep - 1) / (visibleSteps - 1)) * 100;

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};
    
    switch(step) {
      case 1:
        if (!formData.address.street) newErrors.street = 'Введите улицу и номер дома';
        if (!formData.address.propertyType && !hasApartmentInAddress(formData.address.street?.value || '')) {
          newErrors.propertyType = 'Выберите тип недвижимости';
        }
        if (formData.address.propertyType === 'apartment' && !formData.address.apartment && !hasApartmentInAddress(formData.address.street?.value || '')) {
          newErrors.apartment = 'Введите номер квартиры';
        }
        break;
      case 2:
        if (!formData.service) newErrors.service = 'Выберите услугу';
        break;
      case 3:
        if (!formData.contacts.lastname) newErrors.lastname = 'Введите фамилию';
        if (!formData.contacts.firstname) newErrors.firstname = 'Введите имя';
        if (!formData.contacts.phone) newErrors.phone = 'Введите номер телефона';
        else if (formData.contacts.phone.replace(/\D/g, '').length < 10) {
          newErrors.phone = 'Введите корректный номер телефона';
        }
        break;
      case 4:
        if (!formData.tariff.id) newErrors.tariff = 'Выберите тариф';
        break;
      case 5:
        if (!formData.ownRouter && !formData.routers['zte-rt-gm-4'] && !formData.routers['huawei-hg8120h'] && !formData.routers['zte-h298a'] && !formData.routers['eltex-rg-5440g-wac']) newErrors.routers = 'Выберите роутер или укажите свой';
        break;
      case 6:
        if (!formData.ownTVBox && !formData.tvBoxes['wink'] && !formData.tvBoxes['wink-plus']) newErrors.tvBoxes = 'Выберите ТВ-приставку или укажите свою';
        break;
      case 7:
        if (!formData.date.asap && !formData.date.day) newErrors.date = 'Выберите дату и время';
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
      } else {
        submitForm();
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const submitForm = async () => {
    setIsSubmitting(true);
    try {
      // Формируем данные для отправки
      const leadData = {
        type: 'Подключение интернета',
        name: `${formData.contacts.lastname} ${formData.contacts.firstname} ${formData.contacts.middlename}`.trim(),
        phone: formData.contacts.phone,
        address: `${formData.address.street?.value || ''}${formData.address.apartment ? `, кв. ${formData.address.apartment}` : ''}`,
        houseType: formData.address.propertyType === 'apartment' ? 'Квартира' : 'Частный дом',
        callTime: formData.date.asap ? 'Как можно быстрее' : 
                 formData.date.fullDate ? 
                 `${formData.date.fullDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}, ${formData.date.time}` :
                 `${formData.date.day} число, ${formData.date.time}`,
        comment: `Услуга: ${formData.service === 'access' ? 'Интернет' :
                 formData.service === 'entertainment' ? 'Интернет + ТВ' :
                 formData.service === 'communication' ? 'Интернет + Моб. связь' : 'Комбо'}\n` +
                 `Тариф: ${formData.tariff.name}\n` +
                 `Роутер: ${formData.ownRouter ? 'Свой роутер' : 
                           getSelectedEquipment().filter(item => item.includes('ZTE') || item.includes('Huawei') || item.includes('Eltex')).join(', ') || 'Не выбран'}\n` +
                 `ТВ-приставка: ${formData.ownTVBox ? 'Своя приставка' : 
                                 getSelectedEquipment().filter(item => item.includes('Wink')).join(', ') || 'Не выбрана'}`
      };

      // Отправляем заявку
      const response = await fetch('/api/submit-lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leadData),
      });

      if (!response.ok) {
        throw new Error('Ошибка отправки заявки');
      }

      // Перенаправляем на страницу завершения
      router.push('/complete');
    } catch (error) {
      console.error('Ошибка отправки:', error);
      alert('Произошла ошибка при отправке заявки. Попробуйте еще раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateTotal = () => {
    let total = formData.tariff.price;
    if (!formData.ownRouter && formData.routers['zte-rt-gm-4'] > 0) total += formData.routers['zte-rt-gm-4'] * 150;
    if (!formData.ownRouter && formData.routers['huawei-hg8120h'] > 0) total += formData.routers['huawei-hg8120h'] * 30;
    if (!formData.ownRouter && formData.routers['zte-h298a'] > 0) total += formData.routers['zte-h298a'] * 100;
    if (!formData.ownRouter && formData.routers['eltex-rg-5440g-wac'] > 0) total += formData.routers['eltex-rg-5440g-wac'] * 150;
    if (!formData.ownTVBox && formData.tvBoxes['wink'] > 0) total += formData.tvBoxes['wink'] * 100;
    if (!formData.ownTVBox && formData.tvBoxes['wink-plus'] > 0) total += formData.tvBoxes['wink-plus'] * 335;
    return total;
  };

  // Функция для получения названия роутера по ID
  const getRouterName = (id: string) => {
    const router = routers.find(r => r.id === id);
    return router ? router.name : '';
  };

  // Функция для получения названия ТВ-приставки по ID
  const getTVBoxName = (id: string) => {
    const box = tvBoxes.find(b => b.id === id);
    return box ? box.name : '';
  };

  // Функция для получения списка выбранного оборудования
  const getSelectedEquipment = () => {
    const selected: string[] = [];
    
    // Роутеры
    Object.entries(formData.routers).forEach(([id, count]) => {
      if (count > 0) {
        const name = getRouterName(id);
        selected.push(`${name} (${count} шт.)`);
      }
    });
    
    // ТВ-приставки
    Object.entries(formData.tvBoxes).forEach(([id, count]) => {
      if (count > 0) {
        const name = getTVBoxName(id);
        selected.push(`${name} (${count} шт.)`);
      }
    });
    
    return selected;
  };

  const renderStepContent = () => {
    switch(currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="mb-4">
              <AddressSuggestions
                token="48a6def168c648e4b5302f2696d9cb5de308032d"
                value={formData.address.street}
                onChange={(suggestion: DaDataSuggestion<DaDataAddress> | undefined) => {
                  handleInputChange('address', { ...formData.address, street: suggestion });
                }}
                inputProps={{
                  placeholder: "Город, улица, номер дома *",
                  className: "w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                }}
              />
              {errors.street && <div className="text-red-500 text-sm mt-1">{errors.street}</div>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Тип недвижимости *
              </label>
              
              {hasApartmentInAddress(formData.address.street?.value || '') ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-800">
                    <strong>Квартира уже указана в адресе.</strong> Тип недвижимости определен автоматически.
                  </p>
                </div>
              ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    formData.address.propertyType === 'apartment' 
                      ? 'border-[#FF4B00] bg-[#FF4B0008]' 
                      : 'border-[#E0E0E0] hover:border-[#FF4B00]'
                  }`}
                  onClick={() => handleInputChange('address', { ...formData.address, propertyType: 'apartment' })}
                >
                  <div className="font-bold">Квартира</div>
                  <div className="text-sm text-[#6D7683]">Многоквартирный дом</div>
                </div>
                <div
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    formData.address.propertyType === 'house' 
                      ? 'border-[#FF4B00] bg-[#FF4B0008]' 
                      : 'border-[#E0E0E0] hover:border-[#FF4B00]'
                  }`}
                  onClick={() => handleInputChange('address', { ...formData.address, propertyType: 'house' })}
                >
                  <div className="font-bold">Частный дом</div>
                  <div className="text-sm text-[#6D7683]">Индивидуальный дом</div>
                </div>
              </div>
              )}
              {errors.propertyType && <div className="text-red-500 text-sm mt-1">{errors.propertyType}</div>}
            </div>
            
            {(formData.address.propertyType === 'apartment' || hasApartmentInAddress(formData.address.street?.value || '')) && !hasApartmentInAddress(formData.address.street?.value || '') && (
              <div>
                <Input
                  label="Квартира *"
                  type="text"
                  value={formData.address.apartment}
                  onChange={(e) => handleInputChange('address', { ...formData.address, apartment: e.target.value })}
                  placeholder="Номер квартиры"
                />
                {errors.apartment && <div className="text-red-500 text-sm mt-1">{errors.apartment}</div>}
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { id: 'access', title: 'Интернет', description: 'Высокоскоростной доступ в интернет' },
              { id: 'entertainment', title: 'Интернет + ТВ', description: 'Интернет и цифровое телевидение' },
              { id: 'communication', title: 'Интернет + Моб. связь', description: 'Интернет и мобильная связь' },
              { id: 'combo', title: 'Комбо', description: 'Интернет + ТВ + Моб. связь' },
            ].map(service => (
              <div
                key={service.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  formData.service === service.id 
                    ? 'border-[#FF4B00] bg-[#FF4B0008]' 
                    : 'border-[#E0E0E0] hover:border-[#FF4B00]'
                }`}
                onClick={() => handleInputChange('service', service.id)}
              >
                <div className="font-bold">{service.title}</div>
                <div className="text-sm text-[#6D7683]">{service.description}</div>
              </div>
            ))}
            {errors.service && <div className="text-red-500 text-sm mt-1">{errors.service}</div>}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Input
                  label="Фамилия *"
                  type="text"
                  value={formData.contacts.lastname}
                  onChange={(e) => handleInputChange('contacts', { ...formData.contacts, lastname: e.target.value })}
                  placeholder="Иванов"
                />
                {errors.lastname && <div className="text-red-500 text-sm mt-1">{errors.lastname}</div>}
              </div>
              <div>
                <Input
                  label="Имя *"
                  type="text"
                  value={formData.contacts.firstname}
                  onChange={(e) => handleInputChange('contacts', { ...formData.contacts, firstname: e.target.value })}
                  placeholder="Иван"
                />
                {errors.firstname && <div className="text-red-500 text-sm mt-1">{errors.firstname}</div>}
              </div>
            </div>
            
            <div>
              <Input
                label="Отчество"
                type="text"
                value={formData.contacts.middlename}
                onChange={(e) => handleInputChange('contacts', { ...formData.contacts, middlename: e.target.value })}
                placeholder="Иванович"
              />
            </div>
            
            <div>
                <label className="block text-sm font-medium mb-2">Телефон *</label>
                <InputMask
                  mask="+7 (999) 999-99-99"
                value={formData.contacts.phone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('contacts', { ...formData.contacts, phone: e.target.value })}
                placeholder="+7 (___) ___-__-__"
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              {errors.phone && <div className="text-red-500 text-sm mt-1">{errors.phone}</div>}
            </div>
          </div>
        );

      case 4:
        const tariffs = getTariffs(formData.service);
        return (
          <div className="space-y-4">
            {tariffs.map(tariff => (
              <div
                key={tariff.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all relative ${
                  String(formData.tariff.id) === String(tariff.id)
                    ? 'border-[#FF4B00] bg-[#FF4B0008]' 
                    : 'border-[#E0E0E0] hover:border-[#FF4B00]'
                }`}
                onClick={() => handleInputChange('tariff', tariff)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="font-bold text-lg">{tariff.name}</div>
                  {tariff.discountPrice !== undefined && tariff.discountPeriod && (
                    <div className="bg-gradient-to-r from-purple-600 to-orange-500 text-white px-2 py-1 rounded text-xs font-bold">
                      {tariff.discountPrice} ₽ {tariff.discountPeriod}
                    </div>
                  )}
                </div>
                <div className="flex gap-4 mb-3 text-sm">
                  <div className="flex items-center gap-1">
                    <span>📶</span> {tariff.speed} Мбит/с
                  </div>
                  {tariff.tvChannels && (
                    <div className="flex items-center gap-1">
                      <span>📺</span> {tariff.tvChannels} каналов
                    </div>
                  )}
                  {tariff.mobileData !== undefined && tariff.mobileMinutes !== undefined && (
                    <div className="flex items-center gap-1">
                      <span>📱</span> {tariff.mobileData} ГБ + {tariff.mobileMinutes} мин
                    </div>
                  )}
                </div>
                <div className="font-bold text-lg text-[#FF4B00]">
                  {tariff.price} ₽/мес
                </div>
              </div>
            ))}
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800">
                <strong>Рекомендуем добавить модем, на всякий случай.</strong> Отказаться можно в момент установки.
              </p>
            </div>
            
            {routers.map(router => (
              <EquipmentCounter
                key={router.id}
                id={router.id}
                name={router.name}
                price={router.price}
                description={router.description}
                features={router.features}
                recommended={router.recommended}
                count={formData.routers[router.id]}
                onIncrement={() => {
                  // Если включен "свой роутер", снимаем галочку
                  if (formData.ownRouter) {
                    handleInputChange('ownRouter', false);
                  }
                  handleInputChange('routers', { ...formData.routers, [router.id]: formData.routers[router.id] + 1 });
                }}
                onDecrement={() => handleInputChange('routers', { ...formData.routers, [router.id]: formData.routers[router.id] - 1 })}
              />
            ))}
            
            <div className="flex items-center gap-2 mt-4">
              <Checkbox
                checked={formData.ownRouter}
                onChange={() => {
                  if (!formData.ownRouter) {
                    // Если включаем "свой роутер", сбрасываем все счетчики роутеров
                    handleInputChange('routers', { 'zte-rt-gm-4': 0, 'huawei-hg8120h': 0, 'zte-h298a': 0, 'eltex-rg-5440g-wac': 0 });
                  }
                  handleInputChange('ownRouter', !formData.ownRouter);
                }}
              >
                У меня есть свой роутер
              </Checkbox>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            {tvBoxes.map(box => (
              <EquipmentCounter
                key={box.id}
                id={box.id}
                name={box.name}
                price={box.price}
                description={box.description}
                features={box.features}
                recommended={box.recommended}
                count={formData.tvBoxes[box.id]}
                onIncrement={() => {
                  // Если включена "своя приставка", снимаем галочку
                  if (formData.ownTVBox) {
                    handleInputChange('ownTVBox', false);
                  }
                  handleInputChange('tvBoxes', { ...formData.tvBoxes, [box.id]: formData.tvBoxes[box.id] + 1 });
                }}
                onDecrement={() => handleInputChange('tvBoxes', { ...formData.tvBoxes, [box.id]: formData.tvBoxes[box.id] - 1 })}
              />
            ))}
            
            <div className="flex items-center gap-2 mt-4">
              <Checkbox
                checked={formData.ownTVBox}
                onChange={() => {
                  if (!formData.ownTVBox) {
                    // Если включаем "своя приставка", сбрасываем все счетчики приставок
                    handleInputChange('tvBoxes', { 'wink': 0, 'wink-plus': 0 });
                  }
                  handleInputChange('ownTVBox', !formData.ownTVBox);
                }}
              >
                У меня смарт ТВ или своя приставка
              </Checkbox>
            </div>
          </div>
        );

      case 7:
      case 7:
  // Генерируем реальный календарь на ближайшие 30 дней
  const today = new Date();
  const calendarDays = [];
  
  // Начинаем с завтрашнего дня (сегодня нельзя выбрать)
  for (let i = 1; i <= 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    // Русские названия дней недели
    const daysOfWeek = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    const dayOfWeek = daysOfWeek[date.getDay()];
    
    calendarDays.push({
      day: date.getDate(),
      month: date.toLocaleDateString('ru-RU', { month: 'short' }),
      fullDate: date,
      dayOfWeek: dayOfWeek,
      isWeekend: date.getDay() === 0 || date.getDay() === 6
    });
  }
  
  // Временные интервалы
  const timeIntervals = [
    '08:00-10:00', '10:00-12:00', '12:00-14:00', 
    '14:00-16:00', '16:00-18:00', '18:00-20:00', '20:00-22:00'
  ];
  
  return (
    <div className="space-y-6">
      <div className={`border rounded-lg p-4 cursor-pointer transition-all ${
        formData.date.asap ? 'border-[#FF4B00] bg-[#FF4B0008]' : 'border-[#E0E0E0] hover:border-[#FF4B00]'
      }`}>
        <div className="flex items-center gap-3">
          <Checkbox 
            checked={formData.date.asap} 
            onChange={() => handleInputChange('date', { ...formData.date, asap: !formData.date.asap })}
          >
            <div>
              <div className="font-bold">Как можно быстрее</div>
              <div className="text-sm text-[#6D7683]">Наш специалист свяжется с вами в течение дня</div>
            </div>
          </Checkbox>
        </div>
      </div>
      
      {!formData.date.asap && (
      <div>
        <div className="font-bold mb-4">Выберите дату и время</div>
        
        {/* Календарь с горизонтальной прокруткой */}
        <div className="mb-6">
          <div className="flex space-x-2 overflow-x-auto pb-2 -mx-2 px-2">
            {calendarDays.map((dateInfo, index) => (
              <div
                key={index}
                onClick={() => handleInputChange('date', { 
                  ...formData.date, 
                  day: dateInfo.day,
                  fullDate: dateInfo.fullDate,
                  dayOfWeek: dateInfo.dayOfWeek
                })}
                className={`flex flex-col items-center justify-center w-16 h-16 rounded-lg cursor-pointer transition-all flex-shrink-0 ${
                  formData.date.day === dateInfo.day 
                    ? 'bg-[#FF4B00] text-white' 
                    : dateInfo.isWeekend 
                      ? 'bg-gray-100 text-gray-500' 
                      : 'bg-white border border-gray-200 hover:border-[#FF4B00]'
                }`}
              >
                <div className="text-xs font-medium">{dateInfo.dayOfWeek}</div>
                <div className="text-lg font-bold">{dateInfo.day}</div>
                <div className="text-xs opacity-70">{dateInfo.month}</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Временные интервалы с горизонтальной прокруткой */}
        <div>
          <div className="text-sm font-medium mb-3">Выберите время:</div>
          <div className="flex space-x-2 overflow-x-auto pb-2 -mx-2 px-2">
            {timeIntervals.map((time, index) => (
              <div
                key={index}
                onClick={() => handleInputChange('date', { ...formData.date, time })}
                className={`px-4 py-2 rounded-lg cursor-pointer transition-all flex-shrink-0 whitespace-nowrap ${
                  formData.date.time === time 
                    ? 'bg-[#FF4B00] text-white border-[#FF4B00]' 
                    : 'bg-white border border-gray-200 hover:border-[#FF4B00]'
                }`}
              >
                {time}
              </div>
            ))}
          </div>
        </div>
      </div>
      )}
      
      {errors.date && <div className="text-red-500 text-sm mt-1">{errors.date}</div>}
    </div>
  );
      case 8:
        return (
          <div className="space-y-6">
            <p className="text-[#6D7683]">Пожалуйста, проверьте все введенные данные перед отправкой заявки.</p>
            
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div className="flex justify-between">
                <span className="text-[#6D7683]">Адрес:</span>
                <span className="font-medium text-right">
                  {formData.address.street?.value || ''}{formData.address.apartment ? `, кв. ${formData.address.apartment}` : ''}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-[#6D7683]">Услуга:</span>
                <span className="font-medium text-right">
                  {formData.service === 'access' ? 'Интернет' :
                   formData.service === 'entertainment' ? 'Интернет + ТВ' :
                   formData.service === 'communication' ? 'Интернет + Моб. связь' : 'Комбо'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-[#6D7683]">Тариф:</span>
                <span className="font-medium text-right">{formData.tariff.name}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-[#6D7683]">Роутер:</span>
                <span className="font-medium text-right">
                  {formData.ownRouter ? 'Свой роутер' : getSelectedEquipment().filter(item => item.includes('ZTE') || item.includes('Huawei') || item.includes('Eltex')).join(', ') || 'Не выбран'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-[#6D7683]">ТВ-приставка:</span>
                <span className="font-medium text-right">
                  {formData.ownTVBox ? 'Своя приставка' : 
                   getSelectedEquipment().filter(item => item.includes('Wink')).join(', ') || 'Не выбрана'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-[#6D7683]">Контактные данные:</span>
                <span className="font-medium text-right">
                  {formData.contacts.lastname} {formData.contacts.firstname} {formData.contacts.middlename}<br/>
                  {formData.contacts.phone}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-[#6D7683]">Дата и время:</span>
                <span className="font-medium text-right">
                  {formData.date.asap ? 'Как можно быстрее' : 
                   formData.date.fullDate ? 
                   `${formData.date.fullDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}, ${formData.date.time}` :
                   `${formData.date.day} число, ${formData.date.time}`}
                </span>
              </div>
            </div>
            
            <Checkbox checked={true} onChange={() => {}}>
              <span className="text-sm">Я согласен на обработку персональных данных</span>
            </Checkbox>
          </div>
        );

      default:
        return <div>Неизвестный шаг</div>;
    }
  };

  // Если включен режим поддержки, показываем только информацию о поддержке
  if (isSupportOnly) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <Logo href="/" />
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-8">
              <h1 className="text-2xl font-bold text-blue-900 mb-4">
                Поддержка клиентов
              </h1>
              <p className="text-blue-800 mb-6">
                Для получения помощи и консультации свяжитесь с нашими специалистами
              </p>
              <div className="bg-white rounded-lg p-6">
                <p className="text-lg font-semibold text-gray-900 mb-2">
                  Телефон поддержки:
                </p>
                <a 
                  href="tel:88001000800" 
                  className="text-2xl font-bold text-blue-600 hover:text-blue-800"
                >
                  8 800 100 08 00
                </a>
                <p className="text-sm text-gray-600 mt-2">
                  Бесплатно по России
                </p>
              </div>
            </div>
            <div className="mt-8">
              <Link 
                href="/"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Вернуться на главную
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F3F8] text-[#0D1526]">
      {/* Градиентный хедер */}
      <header className="bg-gradient-to-r from-[#FF6633] via-[#C4387C] to-[#6637FF] h-40 flex items-center justify-center text-white text-center px-5">
        <div className="max-w-4xl w-full">
          <h1 className="text-3xl md:text-5xl font-bold mb-2">Подключение интернета</h1>
          <div className="text-lg md:text-xl font-medium opacity-90">Оформите заявку всего за 3 минуты</div>
        </div>
      </header>

      {/* Прогресс-бар для мобильных */}
      <div className="block md:hidden w-full px-4 mt-4">
        <div className="relative h-2 bg-[#E0E0E0] rounded-full overflow-hidden">
          <div
            className="absolute left-0 top-0 h-2 bg-[#FF4B00] rounded-full transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="text-sm text-[#6D7683] mt-2 text-center">
          Шаг {currentStep} из {visibleSteps}
        </div>
      </div>

      {/* Основной контейнер */}
      <div className="container max-w-7xl mx-auto flex flex-col md:flex-row gap-10 px-4 py-10">
        {/* Степпер */}
        <div className="hidden md:block w-72 flex-shrink-0">
          <div className="relative pl-6">
            <div className="absolute left-3 top-0 h-full w-1 bg-[#E0E0E0] z-0 rounded" />
            {steps.map((step, idx) => (
              <div
                key={idx}
                className={`flex items-start mb-8 relative z-10 cursor-pointer group ${currentStep === idx + 1 ? "opacity-100" : "opacity-60"}`}
                onClick={() => currentStep > idx + 1 && setCurrentStep(idx + 1)}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs mr-4 transition-all
                    ${currentStep === idx + 1 ? "bg-[#FF4B00] text-white" : currentStep > idx + 1 ? "bg-[#BFBFBF] text-white" : "bg-[#E0E0E0] text-[#6D7683]"}
                  `}
                >
                  {idx + 1}
                </div>
                <div className="pt-0.5 flex-1">
                  <div className="font-bold flex items-center justify-between">
                    {step.title}
                    {currentStep > idx + 1 && (
                      <button
                        className="text-[#FF4B00] text-xs ml-2 px-2 py-1 rounded hover:bg-[#FF4B0011] transition"
                        onClick={e => {
                          e.stopPropagation();
                          setCurrentStep(idx + 1);
                        }}
                        aria-label={`Изменить шаг ${idx + 1}`}
                      >
                        Изменить
                      </button>
                    )}
                  </div>
                  <div className="text-sm text-[#6D7683]">{step.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Форма и шаги */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-lg shadow p-6 md:p-10 mb-6">
            <div className="min-h-[400px]">
              {renderStepContent()}
            </div>
            
            {/* Навигация */}
            <div className="flex flex-col md:flex-row gap-4 mt-8">
              <button
                className="bg-white border border-[#E0E0E0] text-[#0D1526] px-6 py-3 rounded font-medium text-lg disabled:opacity-50 transition-all hover:border-[#FF4B00]"
                disabled={currentStep === 1}
                onClick={prevStep}
              >
                Назад
              </button>
              <button
                className="bg-[#FF4B00] hover:bg-[#e04300] text-white px-6 py-3 rounded font-medium text-lg flex-1 md:flex-none transition-all disabled:opacity-50"
                onClick={nextStep}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Отправка...' : currentStep === steps.length ? "Оформить заявку" : "Далее"}
              </button>
            </div>
          </div>
        </div>

        {/* Резюме заявки (сайдбар) */}
        <div className="hidden lg:block w-80 flex-shrink-0">
          <div className="bg-white rounded-lg shadow p-6 sticky top-24">
            <div className="text-lg font-bold mb-4">Ваша заявка</div>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[#6D7683]">Адрес:</span>
                <span className="font-medium text-right max-w-[60%]">
                  {formData.address.street?.value || ''}{formData.address.apartment ? `, кв. ${formData.address.apartment}` : ''}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-[#6D7683]">Услуга:</span>
                <span className="font-medium text-right">
                  {formData.service === 'access' ? 'Интернет' :
                   formData.service === 'entertainment' ? 'Интернет + ТВ' :
                   formData.service === 'communication' ? 'Интернет + Моб. связь' : 'Комбо'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-[#6D7683]">Тариф:</span>
                <span className="font-medium text-right">{formData.tariff.name || 'Не выбран'}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-[#6D7683]">Абон. плата:</span>
                <span className="font-medium text-right">{formData.tariff.price || 0} ₽/мес</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-[#6D7683]">Роутер:</span>
                <span className="font-medium text-right">
                  {formData.ownRouter ? 'Свой роутер' : 
                   getSelectedEquipment().filter(item => item.includes('ZTE') || item.includes('Huawei') || item.includes('Eltex')).join(', ') || 'Не выбран'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-[#6D7683]">ТВ-приставка:</span>
                <span className="font-medium text-right">
                  {formData.ownTVBox ? 'Своя приставка' : 
                   getSelectedEquipment().filter(item => item.includes('Wink')).join(', ') || 'Не выбрана'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-[#6D7683]">Дата и время:</span>
                <span className="font-medium text-right">
                  {formData.date.asap ? 'Как можно быстрее' : 
                   formData.date.fullDate ? 
                   `${formData.date.fullDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}, ${formData.date.time}` :
                   `${formData.date.day} число, ${formData.date.time}`}
                </span>
              </div>
              
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>Итого в месяц:</span>
                  <span>{calculateTotal()} ₽</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 