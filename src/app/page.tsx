// Только для GeoRedirect, основной компонент серверный

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import CityServiceLayout from "@/components/layout/CityServiceLayout";
import CityTariffExplorer from "@/components/blocks/CityTariffExplorer";
import GeoRedirect from "@/components/blocks/GeoRedirect";
import { getCityData, getAvailableCities } from "@/lib/data-service";

// Динамическая генерация страницы
export const dynamic = "force-dynamic";

// Генерация метаданных для главной страницы
export async function generateMetadata() {
  return {
    title: "Ростелеком — тарифы и подключение интернета и ТВ в России",
    description: "Подключение Ростелеком в вашем городе. Действующие тарифы на услуги Ростелеком в России. Оставьте заявку на сайте.",
    openGraph: {
      title: "Ростелеком — тарифы и подключение интернета и ТВ в России",
      description: "Подключение Ростелеком в вашем городе. Действующие тарифы на услуги Ростелеком в России. Оставьте заявку на сайте.",
    },
  };
}

// Функция для получения дефолтного города с тарифами
async function getDefaultCity(): Promise<{ slug: string; name: string }> {
  try {
    const availableCities = await getAvailableCities();
    for (const citySlug of availableCities) {
      const data = await getCityData(citySlug);
      if (data && Object.values(data.services).flatMap((s: any) => s.tariffs).length > 0) {
        return { slug: citySlug, name: data.meta.name || "Энгельс" };
      }
    }
    return { slug: "engels", name: "Энгельс" };
  } catch (err) {
    console.error("Ошибка получения списка городов:", err);
    return { slug: "engels", name: "Энгельс" };
  }
}

export default async function HomePage({ searchParams }: { searchParams: { city?: string } }) {
  // Получаем куки на сервере
  const cookieStore = cookies();
  const userCityCookie = cookieStore.get("user-city")?.value || searchParams.city;

  let citySlug = "";
  let cityName = "Энгельс";

  if (userCityCookie && userCityCookie !== "в России") {
    cityName = userCityCookie;
    citySlug = userCityCookie
      .toLowerCase()
      .replace(/^(г\.|пгт|село|аул|деревня|поселок|ст-ца|п\.)\s*/i, "")
      .replace(/ё/g, "e")
      .replace(/\s+/g, "-")
      .replace(/[а-я]/g, (c: string) => {
        const map: Record<string, string> = {
          а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ж: "zh", з: "z", и: "i", й: "i",
          к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f",
          х: "h", ц: "c", ч: "ch", ш: "sh", щ: "sch", ы: "y", э: "e", ю: "yu", я: "ya"
        };
        return map[c] || c;
      })
      .replace(/[^a-z0-9-]/g, "");
  }

  // Проверяем доступность города
  let availableCities: string[] = [];
  try {
    availableCities = await getAvailableCities();
  } catch (err) {
    console.error("Ошибка получения списка городов:", err);
  }

  // Получаем данные для города
  let data;
  let tariffsData: any[] = [];
  if (citySlug && availableCities.includes(citySlug)) {
    try {
      data = await getCityData(citySlug);
      if (data) {
        tariffsData = Object.values(data.services).flatMap((s: any) => s.tariffs);
      }
    } catch (err) {
      console.error(`Ошибка получения данных для города ${citySlug}:`, err);
    }
  }

  // Если город недоступен или нет тарифов, пробуем дефолтный город
  if (!data || tariffsData.length === 0) {
    const defaultCity = await getDefaultCity();
    citySlug = defaultCity.slug;
    cityName = defaultCity.name;
    try {
      data = await getCityData(citySlug);
      if (data) {
        tariffsData = Object.values(data.services).flatMap((s: any) => s.tariffs);
      }
    } catch (err) {
      console.error(`Ошибка получения данных для дефолтного города ${citySlug}:`, err);
    }
  }

  // Если тарифов всё ещё нет, отображаем заглушку
  if (!data || tariffsData.length === 0) {
    return (
      <CityServiceLayout service="home" cityName={cityName} citySlug={citySlug}>
        <div className="flex justify-center items-center min-h-[400px] text-center">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Тарифы временно недоступны</h2>
            <p className="text-gray-600">
              К сожалению, в данный момент тарифы для вашего города недоступны. Попробуйте позже или выберите другой город.
            </p>
          </div>
        </div>
        <GeoRedirect defaultCity={citySlug} />
      </CityServiceLayout>
    );
  }

  return (
    <>
      <CityServiceLayout service="home" cityName={data.meta.name || cityName} citySlug={citySlug}>
        <Suspense fallback={<div className="flex justify-center items-center min-h-[400px]">Загрузка тарифов...</div>}>
          <CityTariffExplorer
            tariffs={tariffsData}
            cityName={data.meta.name || cityName}
            citySlug={citySlug}
           
          />
        </Suspense>
      </CityServiceLayout>
      <GeoRedirect defaultCity={citySlug} />
    </>
  );
}