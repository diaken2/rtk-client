import CheckPage from '../../check/page';
import { getAvailableCities, getCityData } from '@/lib/data-service';
import { notFound } from 'next/navigation';
import SetCityEffect from '@/components/layout/SetCityEffect';

export const revalidate = 3600;
type CityType = { id: string; name: string }; // Пример типа
export async function generateStaticParams() {
  const cities: CityType[] = await getAvailableCities();
  return cities.map((city) => ({ city: city.id })); // или другой нужный параметр
}

export async function generateMetadata({ params }: { params: { city: string } }) {
  const data = await getCityData(params.city.toLowerCase());
  const name = data?.meta?.name || params.city;
  return {
    title: `Проверить возможность подключения Ростелеком по адресу в ${name}`,
  };
}

export default async function CityCheckPage({ params }: { params: { city: string } }) {
  const data = await getCityData(params.city.toLowerCase());
  if (!data) return notFound();
  return (
    <>
      <SetCityEffect city={data.meta.name} />
      <CheckPage />
    </>
  );
}
