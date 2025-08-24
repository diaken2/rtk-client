"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AddressSuggestions, DaDataSuggestion, DaDataAddress } from 'react-dadata';
import 'react-dadata/dist/react-dadata.css';
import { submitLead } from '@/lib/submitLead';
import SupportOnlyBlock from '@/components/ui/SupportOnlyBlock';
import CallRequestModal from '@/components/ui/CallRequestModal';
import Image from 'next/image';
import { useCity } from '@/context/CityContext';
import { useSupportOnly } from '@/context/SupportOnlyContext';
import { regions } from './regionsData';
const DA_DATA_TOKEN ="48a6def168c648e4b5302f2696d9cb5de308032d"
// Функция для создания slug из названия города
function slugifyCityName(city: string): string {
  const raw = city
    .replace(/^([а-яёa-z\-\.]+)[\s\-]+/i, "")
    .trim()
    .toLowerCase();
  return raw
    .replace(/ /g, "-")
    .replace(/[а-яё]/gi, (c) =>
      ({
        а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh",
        з: "z", и: "i", й: "i", к: "k", л: "l", м: "m", н: "n", о: "o",
        п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "c",
        ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya"
      }[c.toLowerCase()] || "")
    );
}

// Функция для очистки названия города от префиксов
const cleanCityName = (city: string): string => {
  return city
    .replace(/^г\.|пгт\.|с\.|п\.|д\.|город\s|посёлок\s|село\s/gi, '')
    .trim();
};

interface CityDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (city: string, region: string) => void;
  currentCity: string;
}

function CityDropdown({ isOpen, onClose, onSelect, currentCity }: CityDropdownProps) {
  const [query, setQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => {
        const input = dropdownRef.current?.querySelector('input');
        input?.focus();
      }, 100);
    }
  }, [isOpen]);

  const searchResults = query.trim() ? (() => {
    const q = query.toLowerCase();
    const results: Array<{ city: string; region: string; regionId: string }> = [];
    
    regions.forEach(letterGroup => {
      letterGroup.areas.forEach(region => {
        region.cities.forEach(city => {
          if (city.toLowerCase().includes(q)) {
            results.push({
              city,
              region: region.name,
              regionId: region.id
            });
          }
        });
      });
    });
    
    return results;
  })() : [];

  const filteredRegions = query.trim() ? regions.map(letterGroup => ({
    ...letterGroup,
    areas: letterGroup.areas.filter(area => 
      area.name.toLowerCase().includes(query.toLowerCase()) ||
      area.cities.some(city => city.toLowerCase().includes(query.toLowerCase()))
    )
  })).filter(letterGroup => letterGroup.areas.length > 0) : regions;

  if (!isOpen) return null;

  return (
    <div 
      ref={dropdownRef}
      className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
    >
      <div className="p-4">
        <div className="relative mb-3">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Поиск города..."
            className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none pr-10"
          />
          {query && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setQuery('')}
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                <path d="M4 4l8 8M4 12L12 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          )}
        </div>

        {query.trim() ? (
          <div>
            <div className="text-sm font-medium text-gray-500 mb-2">
              Результаты поиска {searchResults.length > 0 && `(${searchResults.length})`}
            </div>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {searchResults.length > 0 ? (
                searchResults.map((result, index) => (
                  <button
                    key={`${result.city}-${result.regionId}-${index}`}
                    className="w-full px-3 py-2 text-left text-sm text-gray-800 hover:bg-orange-50 hover:text-orange-600 rounded-md transition-colors"
                    onClick={() => onSelect(result.city, result.region)}
                  >
                    <div className="font-medium">{result.city}</div>
                    <div className="text-xs text-gray-500">{result.region}</div>
                  </button>
                ))
              ) : (
                <div className="px-3 py-4 text-center text-gray-500 text-sm">
                  Город не найден
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredRegions.map(letterGroup => (
              <div key={letterGroup.letter}>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                  {letterGroup.letter}
                </div>
                <div className="space-y-1">
                  {letterGroup.areas.map(region => (
                    <div key={region.id}>
                      <div className="text-sm font-medium text-gray-700 px-1 py-1">
                        {region.name}
                      </div>
                      <div className="space-y-0.5 ml-2">
                        {region.cities.slice(0, 5).map(city => (
                          <button
                            key={city}
                            className="w-full px-2 py-1.5 text-left text-sm text-gray-600 hover:bg-orange-50 hover:text-orange-600 rounded-md transition-colors"
                            onClick={() => onSelect(city, region.name)}
                          >
                            {city}
                          </button>
                        ))}
                        {region.cities.length > 5 && (
                          <div className="text-xs text-gray-400 px-2 py-1">
                            +{region.cities.length - 5} городов
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Кастомный компонент для поиска адресов с фильтрацией по городу
type Props = {
  cityFiasId: string | null;
  value: DaDataSuggestion<DaDataAddress> | undefined;
  onChange: (suggestion: DaDataSuggestion<DaDataAddress> | undefined) => void;
};

export function CustomAddressSuggestionsFetch({ cityFiasId, value, onChange }: Props) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<DaDataSuggestion<DaDataAddress>[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // debounce
  useEffect(() => {
    if (!query || query.trim().length === 0) {
      setSuggestions([]);
      return;
    }

    const t = setTimeout(() => {
      fetchSuggestions(query);
    }, 300);

    return () => {
      clearTimeout(t);
      abortRef.current?.abort();
    };
  }, [query, cityFiasId]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // fetch suggestions from DaData suggestions API
  async function fetchSuggestions(q: string) {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setLoading(true);
    try {
      const body: any = {
        query: q,
        count: 8,
        from_bound: { value: "street" },
        to_bound: { value: "street" }
      };
      if (cityFiasId) {
        body.locations = [{ city_fias_id: cityFiasId }];
      }

      const res = await fetch("https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Token ${DA_DATA_TOKEN}`
        },
        body: JSON.stringify(body),
        signal: ac.signal
      });

      if (!res.ok) {
        console.error("DaData error", res.status);
        setSuggestions([]);
        setLoading(false);
        return;
      }

      const json = await res.json();
      setSuggestions(json.suggestions || []);
      setOpen(true);
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error("Fetch suggestions error", err);
      }
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSelect(s: DaDataSuggestion<DaDataAddress>) {
    setQuery(s.value);
    setSuggestions([]);
    setOpen(false);
    onChange(s);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
    // если пользователь вручную стирает выбор — уведомим родителя
    if (!e.target.value) onChange(undefined);
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        onFocus={() => { if (suggestions.length) setOpen(true); }}
        placeholder="Введите улицу и дом"
        className="bg-transparent outline-none flex-1 text-lg px-2 py-1 w-full"
        autoComplete="off"
      />

      {open && (
        <div className="absolute z-50 left-0 right-0 bg-white border border-gray-200 rounded-md mt-1 max-h-56 overflow-auto shadow-lg">
          {loading && <div className="p-3 text-sm text-gray-500">Загрузка...</div>}
          {!loading && suggestions.length === 0 && <div className="p-3 text-sm text-gray-500">Ничего не найдено</div>}
          {!loading && suggestions.map((s, idx) => (
            <button
              key={s.value + idx}
              type="button"
              onClick={() => handleSelect(s)}
              className="w-full px-3 py-2 text-left hover:bg-orange-50 hover:text-orange-600 transition-colors"
            >
              <div className="font-medium text-sm">{s.value}</div>
              {s.data?.region && <div className="text-xs text-gray-500">{s.data.region}</div>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}


export default function HeroAddressSearch() {
  const { city, setCity } = useCity();
  const { isSupportOnly } = useSupportOnly();
  const [form, setForm] = useState({ address: "", phone: "" });
  const [selectedSuggestion, setSelectedSuggestion] = useState<DaDataSuggestion<DaDataAddress> | undefined>(undefined);
  const [error, setError] = useState({ address: false, phone: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCallRequestModalOpen, setIsCallRequestModalOpen] = useState(false);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const router = useRouter();
   const [cityFiasId, setCityFiasId] = useState<string | null>(null);
useEffect(() => {
  // если город пустой — сбрасываем
  if (!city || city.trim().length === 0) {
    setCityFiasId(null);
    return;
  }

  // получаем fias_id при изменении city (в т.ч. после навигации/перезагрузки)
  let mounted = true;
  (async () => {
    const id = await fetchCityFiasIdByName(city);
    if (mounted) {
      setCityFiasId(id);
      if (!id) console.warn('Не нашли fias_id для города', city);
    }
  })();

  return () => { mounted = false; };
}, [city]);
   async function fetchCityFiasIdByName(cityName: string): Promise<string | null> {
  if (!DA_DATA_TOKEN) {
    console.warn("DaData token is not set in NEXT_PUBLIC_DADATA_TOKEN");
    return null;
  }

  try {
    const res = await fetch('https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Token ${DA_DATA_TOKEN}`
      },
      body: JSON.stringify({
        query: cityName,
        count: 5,
        from_bound: { value: "city" },
        to_bound: { value: "city" }
      })
    });

    if (!res.ok) {
      console.error('DaData responded with status', res.status);
      return null;
    }

    const json = await res.json();
    const first = json.suggestions && json.suggestions[0];
    // иногда city_fias_id есть в data, иначе используем data.fias_id
    return first?.data?.city_fias_id || first?.data?.fias_id || null;
  } catch (err) {
    console.error('Error fetching city fias id', err);
    return null;
  }
}

const handleCitySelect = async (selectedCityName: string, selectedRegionName: string) => {
  // Сохраняем в контекст (если useCity ожидает строку)
  setCity(selectedCityName);

  // получаем fias_id города (если получится) и сохраняем локально
  const fetchedFias = await fetchCityFiasIdByName(selectedCityName);
  setCityFiasId(fetchedFias); // потом передаём в CustomAddressSuggestions

  setIsCityDropdownOpen(false);
  document.cookie = `user-city=${encodeURIComponent(selectedCityName)}; path=/; max-age=31536000`;

  const citySlug = slugifyCityName(selectedCityName);
  router.push(`/${citySlug}`);
};

  const handleCallRequest = () => {
    setIsCallRequestModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newError = {
      address: !form.address.trim(),
      phone: !/^(\+7|8)?[\d\s-]{10,15}$/.test(form.phone)
    };

    setError(newError);
    
    if (newError.address || newError.phone) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitLead({
        type: 'Поиск тарифов по адресу',
        phone: form.phone,
        address: form.address,
      });

      if (result.success) {
        router.push('/complete');
      } else {
        console.error('Failed to submit lead:', result.error);
        router.push('/complete');
      }
    } catch (error) {
      console.error('Error submitting lead:', error);
      router.push('/complete');
    } finally {
      setIsSubmitting(false);
    }
  };

  const benefits = [
    { icon: "/icons/abons.svg", text: "11 млн. абонентов" },
    { icon: "/icons/soedineniye.svg", text: "Надежное соединение" },
    { icon: "/icons/onlenekinoandtv.svg", text: "Онлайн кино и ТВ" },
    { icon: "/icons/parens.svg", text: "Родительский контроль" },
    { icon: "/icons/wifidots.svg", text: "Wi-Fi в любой точке" },
    { icon: "/icons/games.svg", text: "Облачный гейминг" },
  ];

  return (
    <section className="relative bg-gradient-to-r from-[#ff6a2b] to-[#a84fd4] min-h-[520px] flex items-center overflow-hidden">
      <div className="container mx-auto px-4 md:px-8 relative z-20 flex flex-col items-center justify-center w-full">
        <div className="w-full flex flex-col md:flex-row items-start md:items-stretch gap-0 md:gap-0 relative">
          <div className="flex-1 flex flex-col justify-center py-12">
            <h1 className="text-white text-2xl md:text-4xl font-bold text-left leading-tight mb-8">
              Подключить интернет<br />Ростелеком в {city && city.trim().length > 0 ? city.trim() : 'в России'}
            </h1>
            <div className="relative z-10 bg-white rounded-[32px] shadow-2xl flex flex-col md:flex-row items-stretch pt-10 pb-10 px-6 gap-0 md:gap-0 w-full max-w-full">
              <div className="flex-1 flex flex-col justify-center pr-0 md:pr-8">
                <div className="text-[24px] font-medium mb-6 text-[#0f191e] leading-tight">Узнайте все акции и специальные тарифы от Ростелеком в вашем доме</div>
                
                <div className="relative mb-6">
                  <div 
                    className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors group"
                    onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                  >
                    <svg className="w-6 h-6 text-gray-400 mr-2 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 12.414A6 6 0 1112.414 13.414l4.243 4.243a1 1 0 001.414-1.414z" />
                    </svg>
                    <span className="text-lg text-gray-700 font-medium group-hover:text-gray-900">
                      {city && city.trim().length > 0 ? city.trim() : 'в России'}
                    </span>
                    <svg 
                      className={`w-4 h-4 ml-2 text-gray-400 transition-transform ${
                        isCityDropdownOpen ? 'rotate-180' : ''
                      } group-hover:text-gray-600`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>

                  <CityDropdown
                    isOpen={isCityDropdownOpen}
                    onClose={() => setIsCityDropdownOpen(false)}
                    onSelect={handleCitySelect}
                    currentCity={city}
                  />
                </div>

                <SupportOnlyBlock>
                  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex items-center bg-gray-50 rounded-full px-6 py-4 border border-gray-200">
                      <svg width="28" height="28" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                        <path d="M22 36.3133C22.7444 34.9501 23.5705 33.6372 24.4783 32.3745C25.386 31.1118 26.3031 29.9143 27.2297 28.782C28.7983 26.8242 30.0424 25.108 30.9619 23.6335C31.8813 22.1591 32.3411 20.238 32.3411 17.8702C32.3411 15.115 31.3346 12.765 29.3216 10.8202C27.3086 8.87546 24.8642 7.90307 21.9882 7.90307C19.1123 7.90307 16.6718 8.87546 14.6666 10.8202C14.861 6.02944 25.295 6.55895 30.2374 9.736C30.2374 12.1037 32.0637 14.0861 32.9832 15.5606C33.9027 17.0351 30.8654 22.0749 32.434 24.0327C33.3606 25.165 22.7986 34.4192 23.7063 35.6819C24.614 36.9446 22 36.7409 22 36.3133ZM22 40.3333C21.617 40.3333 21.2713 40.2172 20.963 39.985C20.6546 39.7528 20.4342 39.448 20.3018 39.0707C19.3669 36.6431 18.2647 34.6262 16.9952 33.02C15.7258 31.4139 14.5117 29.8749 13.3529 28.4031C12.1785 26.945 11.1872 25.4182 10.379 23.8229C9.57077 22.2276 9.16666 20.244 9.16666 17.872C9.16666 14.414 10.4053 11.4875 12.8825 9.0925C15.3598 6.6975 18.3989 5.5 22 5.5C25.601 5.5 28.6402 6.6943 31.1175 9.08292C33.5947 11.4715 34.8333 14.4019 34.8333 17.8741C34.8333 20.2447 34.4315 22.2248 33.6279 23.8145C32.8243 25.4042 31.8378 26.9337 极速加速器 28.4031C29.4939 29.8749 28.2724 31.4139 27.0037 33.02C25.735 34.6262 24.6358 36.6384 23.7063 39.0565C23.5685 39.4271 23.3454 39.7326 23.037 39.9729C22.7287 40.2132 22.383 40.3333 22 40.3333Z" fill="#0F191E"/>
                        <circle cx="22" cy="18.332" r="5.5" fill="white"/>
                      </svg>
                      <div className="flex-1">
                        <CustomAddressSuggestionsFetch
                          cityFiasId={cityFiasId}
                          value={selectedSuggestion}
                          onChange={(suggestion: DaDataSuggestion<DaDataAddress> | undefined) => {
                            setSelectedSuggestion(suggestion);
                            if (suggestion) {
                              setForm({ ...form, address: suggestion.value });
                            }
                          }}
                        />
                      </div>
                    </div>
                    {error.address && (
                      <div className="text-red-500 text-sm -mt-2 ml-14">Пожалуйста, введите адрес</div>
                    )}

                    <div className="flex items-center bg-gray-50 rounded-full px-6 py-4 border border-gray-200">
                      <svg className="w-6 h-6 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                      <input
                        type="tel"
                        placeholder="Введите номер телефона"
                        className="bg-transparent outline-none flex-1 text-lg px-2 py-1 w-full"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      />
                    </div>
                    {error.phone && (
                      <div className="text-red-500 text-sm -mt-2 ml-14">Введите корректный номер телефона</div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`bg-[#ff5c00] hover:bg-[#ff7f2a] text-white font-bold px-10 h-14 rounded-full transition-colors text-xl shadow-md whitespace-nowrap self-start ${
                        isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {isSubmitting ? 'Отправляем...' : 'Найти тарифы'}
                    </button>
                  </form>
                </SupportOnlyBlock>
              </div>
              
              <div className="flex flex-col justify-center items-center md:items-start md:pl-8 mt-8 md:mt-0 md:w-[300px] border-t md:border-t-0 md:border-l border-gray-100">
                {isSupportOnly ? (
                  <div className="text-center md:text-left">
                    <p className="text-gray-500 text-base mb-4">Вы являетесь действующим абонентом</p>
                    <div className="bg-blue-50 rounded-xl p-4">
                      <p className="text-gray-700 mb-2 font-medium">Для поддержки звоните:</p>
                      <a 
                        href="tel:88001000800" 
                        className="text-xl font-bold text-blue-600 tracking-wider block mb-1 hover:underline"
                      >
                        8 800 100-08-00
                      </a>
                      <p className="text-sm text-gray-500">Звонок бесплатный по РФ</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-gray-500 text-base mb-4 text-center md:text-left">или закажите звонок, наш специалист<br />перезвонит в течение 10 минут</p>
                    <button
                      type="button"
                      onClick={handleCallRequest}
                      className="h-14 rounded-full border-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-white font-semibold flex items-center justify-center gap-2 px-8 text-base transition-colors"
                    >
                      <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                      Заказать звонок
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="w-full max-w-5xl mx-auto -mt-4">
          <h2 className="text-white text-xl md:text-2xl font-bold text-center mb-4">
            Почему стоит выбрать Ростелеком
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-white">
            {benefits.map((b, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="mb-1">
                  <Image src={b.icon} alt="" width={32} height={32} />
                </div>
                <div className="text-sm md:text-base font-medium">{b.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <CallRequestModal
        isOpen={isCallRequestModalOpen}
        onClose={() => setIsCallRequestModalOpen(false)}
      />
    </section>
  );
}