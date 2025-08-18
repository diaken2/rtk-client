
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import CityServiceLayout from '@/components/layout/CityServiceLayout'
import { getCityData, getAvailableCities } from '@/lib/data-service'
import CityTariffExplorer from '@/components/blocks/CityTariffExplorer'


export const dynamic = 'force-dynamic';

type CityType = { id: string; name: string }; // Пример типа
export async function generateStaticParams() {
  const cities: CityType[] = await getAvailableCities();
  return cities.map((city) => ({ city: city.id })); // или другой нужный параметр
}


export async function generateMetadata({ params }: { params: { city: string } }) {
  const citySlug = params.city.toLowerCase();
  const data = await getCityData(citySlug);

  if (!data) {
    return {
      title: 'Город не найден',
      description: 'Выбранный город не найден в списке обслуживания.',
    };
  }

  const cityName = data.meta.name || citySlug;
  const year = new Date().getFullYear();

  const title = `Ростелеком в ${cityName} — тарифы Rostelecom в ${year} году, подключить в ${cityName}`;
  const description = `Подключение Ростелекома в ${cityName}. Действующие тарифы на услуги РТК в ${year} году в ${cityName}. Оставьте заявку на сайте.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
  };
}

export default async function CityPage({ params }: { params: { city: string } }) {
  const city = params.city.toLowerCase()
  const data = await getCityData(city)
  if (!data) return notFound()

  const tariffsData = Object.values(data.services).flatMap((s:any) => s.tariffs)

  return (
    <CityServiceLayout service="home" cityName={data.meta.name} citySlug={city}>
      <Suspense fallback={<div className="flex justify-center items-center min-h-[400px]">Загрузка тарифов...</div>}>
        <CityTariffExplorer
          tariffs={tariffsData}
          cityName={data.meta.name}
          citySlug={city}
        />
      </Suspense>
    </CityServiceLayout>
  )
}
