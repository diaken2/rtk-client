import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getServiceData, getAvailableCities, getCityServices, getCityData } from "@/lib/data-service";
import TariffExplorer from "@/components/blocks/TariffExplorer";
import CityServiceLayout from "@/components/layout/CityServiceLayout";

export const revalidate = 3600;
function formatServiceName(type: string): string {
  const parts = type
    .toLowerCase()
    .split(/\s*\+\s*/)
    .map((s) => s.trim());

  const hasInternet = parts.some((p) => p.includes("интернет"));
  const hasTV = parts.some((p) => p.includes("тв"));
  const hasMobile = parts.some((p) => p.includes("моб"));

  if (hasInternet && hasTV && hasMobile) {
    return "интернет, ТВ и мобильную связь";
  }
  if (hasInternet && hasTV) {
    return "интернет и телевидение";
  }
  if (hasInternet && hasMobile) {
    return "интернет и мобильную связь";
  }
  if (hasTV && hasMobile) {
    return "ТВ и мобильную связь";
  }
  if (hasInternet) return "интернет";
  if (hasTV) return "ТВ";
  if (hasMobile) return "мобильную связь";

  return type; // fallback
}
export async function generateMetadata({ params }: { params: { city: string; service: string } }) {
  const { city, service } = params;
  
  const cityData = await getCityData(city);
  const data = await getServiceData(city, service);

  if (!cityData || !data) {
    return {
      title: 'Тарифы не найдены',
      description: 'Указанная услуга или город не найдены.',
    };
  }

  const cityName = cityData.meta.name || city;
  const serviceTitle = data.title || service;

  let title = "";
  let description = "";

  if (service === "internet") {
    title = `Интернет Ростелеком в ${cityName} — подключить интернет Ростелеком в квартиру, тарифы в 2025 году`;
    description = `Действующие тарифы Ростелеком на домашний интернет в 2025 году. Подключить интернет в квартире в ${cityName}. Оставьте заявку на подключение на нашем сайте.`;
  } else if (service === "internet-tv") {
    title = `Интернет + ТВ Ростелеком в ${cityName} — подключить комплекс услуг, тарифы в 2025 году`;
    description = `Тарифы Ростелеком на интернет и телевидение в ${cityName}. Подключение комплексных услуг Ростелеком в 2025 году.`;
  } else if (service === "internet-mobile") {
    title = `Интернет + мобильная связь Ростелеком в ${cityName} — тарифы в 2025 году`;
    description = `Актуальные тарифы Ростелеком на интернет и мобильную связь в ${cityName}. Быстрое подключение услуг Ростелекома.`;
  } else if (service === "internet-tv-mobile") {
    title = `Интернет + ТВ + мобильная связь Ростелеком в ${cityName} — тарифы в 2025 году`;
    description = `Комплексные тарифы Ростелеком в ${cityName}, включающие интернет, ТВ и мобильную связь. Подключение онлайн.`;
  } else {
    // fallback
    title = `Тарифы Ростелеком в ${cityName}`;
    description = `Тарифы и предложения Ростелеком в ${cityName}.`;
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: ["https://rtk-telecom.ru/android-icon-192x192.png"],
    },
    alternates: {
      canonical: `https://ваш-домен.ру/${city}/${service}`,
    },
  };
}
export async function generateStaticParams() {
  const cities = await getAvailableCities();
  const params = [];
  for (const city of cities) {
    const services = await getCityServices(city);
    for (const service of services) {
      params.push({ city, service });
    }
  }
  return params;
}

export default async function ServicePage({ params }: { params: { city: string; service: string } }){
  const { city, service } = params;

  const data = await getServiceData(city, service);
  if (!data) return notFound();

const cityData = await getCityData(city);
if (!cityData) return notFound();

const cityName = cityData.meta.name;
const serviceTitle = formatServiceName(data?.tariffs?.[0]?.type || service);
const allTariffs = Object.values(cityData.services).flatMap((s:any) => s.tariffs);
  console.log('sdsd')     // например "Интернет"
console.log('титл',serviceTitle)
// внутри ServicePage
const rawServiceType = data.tariffs[0]?.type || serviceTitle;
const formattedServiceName = formatServiceName(rawServiceType);


return (
  <CityServiceLayout service={serviceTitle} cityName={cityName} citySlug={city}>
    <Suspense fallback={<div className="flex justify-center items-center min-h-[400px]">Загрузка тарифов...</div>}>
      <TariffExplorer
        tariffs={allTariffs} // 👈 здесь все тарифы города
        cityName={cityName}
        service={serviceTitle}
        citySlug={city}
        titleservice={data.title || service}
        origservice={service}
      />
    </Suspense>
  </CityServiceLayout>
);
}
