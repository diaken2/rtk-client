import { getAvailableCities, getCityData } from '@/lib/data-service';
import { notFound } from 'next/navigation';
import SetCityEffect from '@/components/layout/SetCityEffect';
import OrderClient from './OrderClient';

export const revalidate = 3600;

export async function generateStaticParams() {
  try {
    const cities = await getAvailableCities();
    return cities.map((city: string) => ({ city }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }) {
  try {
    const { city } = await params;
    const data = await getCityData(city.toLowerCase());
    const name = data?.meta?.name || city;
    return { 
      title: `Заявка на подключение к Ростелеком — подать заявку онлайн в ${name}`,
      description: `Онлайн заявка на подключение интернета Ростелеком в ${name}. Быстрое оформление, лучшие тарифы.`
    };
  } catch (error) {
    return { 
      title: `Заявка на подключение к Ростелеком — подать заявку онлайн`,
      description: `Онлайн заявка на подключение интернета Ростелеком. Быстрое оформление, лучшие тарифы.`
    };
  }
}

export default async function CityOrderPage({ params }: { params: Promise<{ city: string }> }) {
  try {
    const { city } = await params;
    const data = await getCityData(city.toLowerCase());
    
    if (!data) {
      return notFound();
    }

    return (
      <>
        <SetCityEffect city={data.meta.name} />
        <OrderClient />
      </>
    );
  } catch (error) {
    console.error('Error in CityOrderPage:', error);
    return notFound();
  }
}