import OrderPage from '../../order/page';
import { getAvailableCities, getCityData } from '@/lib/data-service';
import { notFound } from 'next/navigation';
import SetCityEffect from '@/components/layout/SetCityEffect';

export const revalidate = 3600;

type CityType = { id: string; name: string }; // Пример типа
export async function generateStaticParams() {
  const cities: any = await getAvailableCities();
  return cities.map((city:any) => ({ city: city.id })); // или другой нужный параметр
}
export async function generateMetadata({ params }: { params: { city: string } }) {
  const data = await getCityData(params.city.toLowerCase());
  const name = data?.meta?.name || params.city;
  return { title: `Заявка на подключение к Ростелеком — подать заявку онлайн в Ростелеком.` };
}

export default async function CityOrderPage({ params }: { params: { city: string } }) {
  const data = await getCityData(params.city.toLowerCase());
  if (!data) return notFound();
  return (
    <>
      <SetCityEffect city={data.meta.name} />
      <OrderPage />
    </>
  );
}
