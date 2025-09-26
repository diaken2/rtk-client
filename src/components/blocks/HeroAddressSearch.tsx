"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DaDataSuggestion, DaDataAddress } from "react-dadata";
import "react-dadata/dist/react-dadata.css";
import { submitLead } from "@/lib/submitLead";
import SupportOnlyBlock from "@/components/ui/SupportOnlyBlock";
import CallRequestModal from "@/components/ui/CallRequestModal";
import Image from "next/image";
import { useCity } from "@/context/CityContext";
import { useSupportOnly } from "@/context/SupportOnlyContext";
import { regions } from "./regionsData";

const DA_DATA_TOKEN = "48a6def168c648e4b5302f2696d9cb5de308032d";

// Функция для создания slug из названия города
function slugifyCityName(city: string): string {
  const raw = city.replace(/^([а-яёa-z\-\.]+)[\s\-]+/i, "").trim().toLowerCase();
  return raw
    .replace(/ /g, "-")
    .replace(/[а-яё]/gi, (c) =>
      ({
        а: "a",
        б: "b",
        в: "v",
        г: "g",
        д: "d",
        е: "e",
        ё: "e",
        ж: "zh",
        з: "z",
        и: "i",
        й: "i",
        к: "k",
        л: "l",
        м: "m",
        н: "n",
        о: "o",
        п: "p",
        р: "r",
        с: "s",
        т: "t",
        у: "u",
        ф: "f",
        х: "h",
        ц: "c",
        ч: "ch",
        ш: "sh",
        щ: "sch",
        ъ: "",
        ы: "y",
        ь: "",
        э: "e",
        ю: "yu",
        я: "ya",
      }[c.toLowerCase()] || "")
    );
}

// Функция для очистки названия города от префиксов
const cleanCityName = (city: string): string => {
  return city
    .replace(/^г\.|пгт\.|с\.|п\.|д\.|город\s|посёлок\s|село\s/gi, "")
    .trim();
};

interface CityDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (city: string, region: string) => void;
  currentCity: string;
}

function CityDropdown({ isOpen, onClose, onSelect, currentCity }: CityDropdownProps) {
  const [query, setQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
   const [regionsData, setRegionsData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    if (isOpen) {
      const fetchRegions = async () => {
        try {
          setIsLoading(true);
          const response = await fetch('https://rtk-backend-4m0e.onrender.com/api/regions');
          if (response.ok) {
            const data = await response.json();
            setRegionsData(data);
          } else {
            console.error('Ошибка загрузки регионов');
            // Можно загрузить fallback данные или показать ошибку
          }
        } catch (error) {
          console.error('Ошибка:', error);
        } finally {
          setIsLoading(false);
        }
      };
  
      fetchRegions();
    }
  }, [isOpen]);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setTimeout(() => {
        const input = dropdownRef.current?.querySelector("input");
        input?.focus();
      }, 100);
    }
  }, [isOpen]);

  const searchResults = query.trim()
    ? (() => {
        const q = query.toLowerCase();
        const results: Array<{ city: string; region: string; regionId: string }> = [];

        regionsData.forEach((letterGroup) => {
          letterGroup.areas.forEach((region:any) => {
            region.cities.forEach((city:any) => {
              if (city.toLowerCase().includes(q)) {
                results.push({
                  city,
                  region: region.name,
                  regionId: region.id,
                });
              }
            });
          });
        });

        return results;
      })()
    : [];

  const filteredRegions = query.trim()
    ? regionsData
        .map((letterGroup) => ({
          ...letterGroup,
          areas: letterGroup.areas.filter(
            (area:any) =>
              area.name.toLowerCase().includes(query.toLowerCase()) ||
              area.cities.some((city:any) => city.toLowerCase().includes(query.toLowerCase()))
          ),
        }))
        .filter((letterGroup) => letterGroup.areas.length > 0)
    : regionsData;

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto backdrop-blur-sm bg-white/95"
    >
      <div className="p-4">
        <div className="relative mb-3">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск города..."
              className="w-full h-12 rounded-xl border border-gray-200 pl-10 pr-10 text-sm focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none transition-all"
            />
            {query && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                onClick={() => setQuery("")}
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                  <path d="M4 4l8 8M4 12L12 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>
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
                    className="w-full px-4 py-3 text-left text-sm text-gray-800 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-all duration-200 hover:shadow-sm"
                    onClick={() => onSelect(result.city, result.region)}
                  >
                    <div className="font-medium">{result.city}</div>
                    <div className="text-xs text-gray-500 mt-1">{result.region}</div>
                  </button>
                ))
              ) : (
                <div className="px-3 py-6 text-center text-gray-500 text-sm">
                  <svg className="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Город не найден
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {isLoading ? (
  <div className="flex justify-center items-center h-40">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ee3c6b]"></div>
  </div>
) : filteredRegions.map((letterGroup) => (
              <div key={letterGroup.letter}>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 px-2">
                  {letterGroup.letter}
                </div>
                <div className="space-y-2">
                  {letterGroup.areas.map((region:any) => (
                    <div key={region.id}>
                      <div className="text-sm font-medium text-gray-700 px-2 py-1 bg-gray-50 rounded-lg">{region.name}</div>
                      <div className="space-y-1 ml-1 mt-1">
                        {region.cities.slice(0, 5).map((city:any) => (
                          <button
                            key={city}
                            className="w-full px-3 py-2 text-left text-sm text-gray-600 hover:bg-orange-50 hover:text-orange-600 rounded-md transition-all duration-200"
                            onClick={() => onSelect(city, region.name)}
                          >
                            {city}
                          </button>
                        ))}
                        {region.cities.length > 5 && (
                          <div className="text-xs text-gray-400 px-2 py-1">+{region.cities.length - 5} городов</div>
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
  cityName?: string | null;
  value?: DaDataSuggestion<DaDataAddress> | undefined;
  onChange: (suggestion: DaDataSuggestion<DaDataAddress> | undefined) => void;
};

export function CustomAddressSuggestionsFetch({ cityFiasId, cityName, value, onChange }: Props) {
  const currentCityName = cityName || "";
  const [query, setQuery] = useState<string>(value?.value || "");
  const [suggestions, setSuggestions] = useState<DaDataSuggestion<DaDataAddress>[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const justSelectedRef = useRef(false);
  const suppressOpenRef = useRef<number>(0);

  useEffect(() => {
    if (value && value.value) {
      setQuery(value.value);
      setSuggestions([]);
      setOpen(false);
      suppressOpenRef.current = Date.now() + 400;
      return;
    }
    if (!value) {
      setQuery("");
      setSuggestions([]);
      setOpen(false);
    }
  }, [value]);

  useEffect(() => {
    if (!query) {
      setSuggestions([]);
      setOpen(false);
      abortRef.current?.abort();
      return;
    }

    if (justSelectedRef.current) {
      const t = setTimeout(() => {
        justSelectedRef.current = false;
      }, 300);
      return () => clearTimeout(t);
    }

    const t = setTimeout(() => fetchSuggestions(query.trim()), 220);
    return () => {
      clearTimeout(t);
      abortRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, cityFiasId, currentCityName]);

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

  function normalize(str?: string) {
    return (str || "").toString().toLowerCase().replace(/\s+/g, " ").trim();
  }

  function parseHouseToken(q: string) {
    const houseMatch = q.match(/(\d+)\s*([а-яёa-zA-Z]{0,2})$/i);
    if (!houseMatch) return null;
    const num = houseMatch[1];
    const letter = houseMatch[2] ? houseMatch[2].toLowerCase() : "";
    return { num, letter };
  }

  function filterByCityAndHouse(sugs: DaDataSuggestion<DaDataAddress>[], rawQuery: string) {
    if (!sugs || sugs.length === 0) return sugs;
    const targetFias = cityFiasId ? String(cityFiasId).toLowerCase() : null;
    const targetCity = normalize(currentCityName);

    const houseToken = parseHouseToken(rawQuery);

    const filtered = sugs.filter((s) => {
      const d: any = s.data || {};

      const ids = [d.city_fias_id, d.settlement_fias_id, d.fias_id].filter(Boolean).map(String).map(x => x.toLowerCase());
      if (targetFias && ids.includes(targetFias)) {
        if (houseToken) {
          if (d.house && String(d.house).toLowerCase().startsWith(houseToken.num)) {
            if (!houseToken.letter) return true;
            const houseNorm = String(d.house || "").toLowerCase();
            if (houseNorm.includes(houseToken.num + houseToken.letter)) return true;
            if (normalize(s.value).includes(houseToken.num + houseToken.letter)) return true;
            return false;
          }
          const valNorm = normalize(s.value);
          if (valNorm.includes(" " + houseToken.num) || valNorm.includes("," + houseToken.num)) {
            if (!houseToken.letter) return true;
            if (valNorm.includes(houseToken.num + houseToken.letter)) return true;
            return false;
          }
          return false;
        }
        return true;
      }

      if (targetCity) {
        const cityCandidates = [
          d.city_with_type,
          d.city,
          d.settlement_with_type,
          d.settlement,
          d.region_with_type,
          d.region
        ].filter(Boolean).map((x: string) => normalize(x));

        if (cityCandidates.some(c => c.includes(targetCity))) {
          if (houseToken) {
            if (d.house && String(d.house).toLowerCase().startsWith(houseToken.num)) {
              if (!houseToken.letter) return true;
              const houseNorm = String(d.house || "").toLowerCase();
              if (houseNorm.includes(houseToken.num + houseToken.letter)) return true;
              if (normalize(s.value).includes(houseToken.num + houseToken.letter)) return true;
              return false;
            }
            const valNorm = normalize(s.value);
            if (valNorm.includes(" " + houseToken.num) || valNorm.includes("," + houseToken.num)) {
              if (!houseToken.letter) return true;
              if (valNorm.includes(houseToken.num + houseToken.letter)) return true;
              return false;
            }
            return false;
          }
          return true;
        }
      }

      return false;
    });

    return filtered.length > 0 ? filtered : sugs;
  }

  async function fetchSuggestions(rawQuery: string) {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    setLoading(true);

    try {
      const effectiveQuery = cityFiasId || !currentCityName ? rawQuery : `${currentCityName} ${rawQuery}`;

      const body: any = {
        query: effectiveQuery,
        count: 12,
        restrict_value: true
      };

      if (cityFiasId) body.locations = [{ city_fias_id: cityFiasId }];

      const res = await fetch("https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Token ${DA_DATA_TOKEN}`,
        },
        body: JSON.stringify(body),
        signal: ac.signal
      });

      if (!res.ok) {
        console.warn("DaData responded with status", res.status);
        return [];
      }

      const json = await res.json();
      const sugs = json.suggestions || [];

      const filtered = filterByCityAndHouse(sugs, rawQuery);

      setSuggestions(filtered);
      setOpen(filtered.length > 0 && Date.now() > suppressOpenRef.current);
    } catch (err: any) {
      if (err?.name !== "AbortError") console.error("Fetch suggestions error", err);
      setSuggestions([]);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }

  function handleSelect(s: DaDataSuggestion<DaDataAddress>) {
    justSelectedRef.current = true;
    setQuery(s.value);
    setSuggestions([]);
    setOpen(false);
    suppressOpenRef.current = Date.now() + 400;
    onChange(s);
    setTimeout(() => {
      justSelectedRef.current = false;
    }, 400);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setQuery(v);
    if (!v) onChange(undefined);
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        onFocus={() => {
          if (justSelectedRef.current || Date.now() < suppressOpenRef.current) return;
          if (suggestions.length) setOpen(true);
        }}
        placeholder="Введите улицу и дом"
        className="bg-transparent outline-none flex-1 text-lg px-2 py-1 w-full placeholder-gray-400"
        autoComplete="off"
      />

      {!query && (
        <div className="absolute top-full left-0 right-0 mt-1 text-xs text-gray-500 bg-white p-2 border border-gray-200 rounded-md">
          Введите минимум 1 букву для поиска
        </div>
      )}

      {open && (
        <div className="absolute z-50 left-0 right-0 bg-white border border-gray-200 rounded-xl mt-2 max-h-64 overflow-auto shadow-xl backdrop-blur-sm bg-white/95">
          {loading && (
            <div className="p-4 text-center">
              <div className="inline-flex items-center">
                <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                <span className="text-sm text-gray-500">Загрузка...</span>
              </div>
            </div>
          )}
          {!loading && suggestions.length === 0 && query.length > 0 && (
            <div className="p-4 text-center text-sm text-gray-500">
              <svg className="w-6 h-6 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Ничего не найдено
            </div>
          )}
          {!loading && suggestions.map((s, idx) => (
            <button
              key={(s.data?.fias_id || s.value || "") + "_" + idx}
              type="button"
              onClick={() => handleSelect(s)}
              className="w-full px-4 py-3 text-left hover:bg-orange-50 hover:text-orange-600 transition-colors border-b border-gray-100 last:border-b-0"
            >
              <div className="font-medium text-sm">{s.value}</div>
              {s.data && (
                <div className="text-xs text-gray-500 mt-1">
                  {s.data.region_with_type || s.data.region || ""}{s.data.city_with_type ? `, ${s.data.city_with_type}` : ""}
                </div>
              )}
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
    if (!city || city.trim().length === 0) {
      setCityFiasId(null);
      return;
    }

    let mounted = true;
    (async () => {
      const id = await fetchCityFiasIdByName(city);
      if (mounted) {
        setCityFiasId(id);
        if (!id) console.warn("Не нашли fias_id для города", city);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [city]);

  async function fetchCityFiasIdByName(cityName: string): Promise<string | null> {
    if (!DA_DATA_TOKEN) {
      console.warn("DaData token is not set");
      return null;
    }

    try {
      const res = await fetch("https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Token ${DA_DATA_TOKEN}`,
        },
        body: JSON.stringify({
          query: cityName,
          count: 5,
          from_bound: { value: "city" },
          to_bound: { value: "city" },
        }),
      });

      if (!res.ok) {
        console.error("DaData responded with status", res.status);
        return null;
      }

      const json = await res.json();
      const first = json.suggestions && json.suggestions[0];
      return first?.data?.city_fias_id || first?.data?.fias_id || null;
    } catch (err) {
      console.error("Error fetching city fias id", err);
      return null;
    }
  }

  const handleCitySelect = async (selectedCityName: string, selectedRegionName: string) => {
    setCity(selectedCityName);

    const fetchedFias = await fetchCityFiasIdByName(selectedCityName);
    setCityFiasId(fetchedFias);

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
    phone: !/^(\+7|8)?[\d\s-]{10,15}$/.test(form.phone),
  };

  setError(newError);

  if (newError.address || newError.phone) {
    return;
  }

  setIsSubmitting(true);

  try {
    // Формируем полный адрес с городом
    const fullAddress = city && city.trim().length > 0 
      ? `${city}, ${form.address}`
      : form.address;

    const result = await submitLead({
      type: "Поиск тарифов по адресу",
      phone: form.phone,
      address: fullAddress, // Используем полный адрес с городом
    });
    
    console.log('адресс', fullAddress); // Логируем полный адрес

    if (result.success) {
      router.push("/complete");
    } else {
      console.error("Failed to submit lead:", result.error);
      router.push("/complete");
    }
  } catch (error) {
    console.error("Error submitting lead:", error);
    router.push("/complete");
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
    <section className="relative bg-gradient-to-r from-[#ff6a2b] to-[#a84fd4] min-h-[600px] flex items-center overflow-hidden">
      {/* Декоративные элементы */}
      <div className="absolute inset-0 bg-[url('/icons/grid-pattern.svg')] bg-center opacity-10"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-300/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-400/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>

      <div className="container mx-auto px-4 md:px-8 relative z-20 flex flex-col items-center justify-center w-full">
        <div className="w-full flex flex-col md:flex-row items-start md:items-stretch gap-0 md:gap-0 relative">
          <div className="flex-1 flex flex-col justify-center py-12">
            <h1 className="text-white text-3xl md:text-5xl font-bold text-left leading-tight mb-8 drop-shadow-md">
              Подключить интернет
              <br />
              Ростелеком в {city && city.trim().length > 0 ? city.trim() : "вашем городе"}
            </h1>

            <div className="relative z-10 bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl flex flex-col md:flex-row items-stretch pt-10 pb-10 px-8 gap-0 md:gap-0 w-full max-w-full border border-white/20">
              <div className="flex-1 flex flex-col justify-center pr-0 md:pr-10">
                <div className="text-2xl font-semibold mb-6 text-gray-900 leading-tight">
                  Узнайте все акции и специальные тарифы от Ростелеком в вашем доме
                </div>

                <div className="relative mb-6">
                  <div
                    className="flex items-center cursor-pointer hover:bg-gray-50/50 p-3 rounded-xl transition-all duration-200 group border border-gray-200/50"
                    onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                  >
                    <svg className="w-6 h-6 text-gray-500 mr-3 group-hover:text-gray-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 12.414A6 6 0 1112.414 13.414l4.243 4.243a1 1 0 001.414-1.414z" />
                    </svg>
                    <span className="text-lg text-gray-800 font-medium group-hover:text-gray-900 transition-colors">
                      {city && city.trim().length > 0 ? city.trim() : "Выберите город"}
                    </span>
                    <svg
                      className={`w-5 h-5 ml-3 text-gray-400 transition-all ${isCityDropdownOpen ? "rotate-180 text-gray-600" : ""} group-hover:text-gray-600`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>

                  <CityDropdown isOpen={isCityDropdownOpen} onClose={() => setIsCityDropdownOpen(false)} onSelect={handleCitySelect} currentCity={city} />
                </div>

                <SupportOnlyBlock>
                  <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className={`flex items-center bg-gray-50/50 rounded-2xl px-6 py-4 border transition-all duration-200 ${
                      error.address ? "border-red-300 bg-red-50/50" : "border-gray-200/50 hover:border-gray-300 focus-within:border-orange-400 focus-within:ring-4 focus-within:ring-orange-100"
                    }`}>
                      <svg width="28" height="28" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-3 flex-shrink-0">
                        <path d="M22 36.3133C22.7444 34.9501 23.5705 33.6372 24.4783 32.3745C25.386 31.1118 26.3031 29.9143 27.2297 28.782C28.7983 26.8242 30.0424 25.108 30.9619 23.6335C31.8813 22.1591 32.3411 20.238 32.3411 17.8702C32.3411 15.115 31.3346 12.765 29.3216 10.8202C27.3086 8.87546 24.8642 7.90307 21.9882 7.90307C19.1123 7.90307 16.6718 8.87546 14.6666 10.8202C14.861 6.02944 25.295 6.55895 30.2374 9.736C30.2374 12.1037 32.0637 14.0861 32.9832 15.5606C33.9027 17.0351 30.8654 22.0749 32.434 24.0327C33.3606 25.165 22.7986 34.4192 23.7063 35.6819C24.614 36.9446 22 36.7409 22 36.3133ZM22 40.3333C21.617 40.3333 21.2713 40.2172 20.963 39.985C20.6546 39.7528 20.4342 39.448 20.3018 39.0707C19.3669 36.6431 18.2647 34.6262 16.9952 33.02C15.7258 31.4139 14.5117 29.8749 13.3529 28.4031C12.1785 26.945 11.1872 25.4182 10.379 23.8229C9.57077 22.2276 9.16666 20.244 9.16666 17.872C9.16666 14.414 10.4053 11.4875 12.8825 9.0925C15.3598 6.6975 18.3989 5.5 22 5.5C25.601 5.5 28.6402 6.6943 31.1175 9.08292C33.5947 11.4715 34.8333 14.4019 34.8333 17.8741C34.8333 20.2447 34.4315 22.2248 33.6279 23.8145C32.8243 25.4042 31.8378 26.9337 30.8031 28.4031C29.4939 29.8749 28.2724 31.4139 27.0037 33.02C25.735 34.6262 24.6358 36.6384 23.7063 39.0565C23.5685 39.4271 23.3454 39.7326 23.037 39.9729C22.7287 40.2132 22.383 40.3333 22 40.3333Z" fill="#0F191E" />
                        <circle cx="22" cy="18.332" r="5.5" fill="white" />
                      </svg>
                      <div className="flex-1">
                        <CustomAddressSuggestionsFetch
                          cityFiasId={cityFiasId}
                          cityName={city}
                          value={selectedSuggestion}
                          onChange={(suggestion) => {
                            setSelectedSuggestion(suggestion);
                            if (suggestion) {
                              setForm({ ...form, address: suggestion.value });
                              setError({ ...error, address: false });
                            }
                          }}
                        />
                      </div>
                    </div>
                    {error.address && <div className="text-red-500 text-sm -mt-3 ml-14 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      Пожалуйста, введите адрес
                    </div>}

                    <div className={`flex items-center bg-gray-50/50 rounded-2xl px-6 py-4 border transition-all duration-200 ${
                      error.phone ? "border-red-300 bg-red-50/50" : "border-gray-200/50 hover:border-gray-300 focus-within:border-orange-400 focus-within:ring-4 focus-within:ring-orange-100"
                    }`}>
                      <svg className="w-6 h-6 text-gray-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                      <input
                        type="tel"
                        placeholder="Введите номер телефона"
                        className="bg-transparent outline-none flex-1 text-lg px-2 py-1 w-full placeholder:text-gray-400"
                        value={form.phone}
                        onChange={(e) => {
                          setForm({ ...form, phone: e.target.value });
                          setError({ ...error, phone: false });
                        }}
                      />
                    </div>
                    {error.phone && <div className="text-red-500 text-sm -mt-3 ml-14 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      Введите корректный номер телефона
                    </div>}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`relative overflow-hidden bg-gradient-to-r from-[#ff5c00] via-[#ff7f2a] to-[#ff4db8] text-white font-semibold px-10 h-14 rounded-full shadow-lg text-lg tracking-wide transition-all duration-300 hover:scale-[1.02] ${isSubmitting ? "opacity-60 cursor-not-allowed" : ""}`}
                    >
                      {isSubmitting ? "Отправляем..." : "Найти тарифы"}
                    </button>
                  </form>
                </SupportOnlyBlock>
              </div>

              <div className="flex flex-col justify-center items-center md:items-start md:pl-8 mt-8 md:mt-0 md:w-[300px] border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0">
                {isSupportOnly ? (
                  <div className="text-center md:text-left">
                    <p className="text-gray-500 text-base mb-4">Вы являетесь действующим абонентом</p>
                    <div className="bg-blue-50 rounded-xl p-4">
                      <p className="text-gray-700 mb-2 font-medium">Для поддержки звоните:</p>
                      <a href="tel:88001000800" className="text-xl font-bold text-blue-600 tracking-wider block mb-1 hover:underline">
                        8 800 100-08-00
                      </a>
                      <p className="text-sm text-gray-500">Звонок бесплатный по РФ</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-gray-500 text-base mb-4 text-center md:text-left">
                      или закажите звонок, наш специалист
                      <br />
                      перезвонит в течение 10 минут
                    </p>
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
          <h2 className="text-white text-xl md:text-2xl font-bold text-center mb-4">Почему стоит выбрать Ростелеком</h2>
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

      <CallRequestModal isOpen={isCallRequestModalOpen} onClose={() => setIsCallRequestModalOpen(false)} />
    </section>
  );
}
