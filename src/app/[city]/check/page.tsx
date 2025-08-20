import { getAvailableCities, getCityData } from '@/lib/data-service';
import { notFound } from 'next/navigation';
import SetCityEffect from '@/components/layout/SetCityEffect';
import CheckPageClient from './CheckPageClient';

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
      title: `Проверить возможность подключения Ростелеком по адресу в ${name}`,
    };
  } catch (error) {
    return {
      title: `Проверить возможность подключения Ростелеком`,
    };
  }
}

export default async function CityCheckPage({ params }: { params: Promise<{ city: string }> }) {
  try {
    const { city } = await params;
    const data = await getCityData(city.toLowerCase());
    
    if (!data) {
      return notFound();
    }

    return (
      <>
        <SetCityEffect city={data.meta.name} />
        <CheckPageClient cityName={city} />
      </>
    );
  } catch (error) {
    console.error('Error in CityCheckPage:', error);
    return notFound();
  }
}