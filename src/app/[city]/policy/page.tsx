import { getAvailableCities, getCityData } from '@/lib/data-service';
import { notFound } from 'next/navigation';
import SetCityEffect from '@/components/layout/SetCityEffect';
import PrivacyClient from './PrivacyClient';

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
      title: `Политика конфиденциальности Ростелеком в ${name}`,
      description: `Политика обработки персональных данных Ростелеком в ${name}. Условия конфиденциальности и защиты информации.`
    };
  } catch (error) {
    return { 
      title: `Политика конфиденциальности Ростелеком`,
      description: `Политика обработки персональных данных Ростелеком. Условия конфиденциальности и защиты информации.`
    };
  }
}

export default async function CityPrivacyPage({ params }: { params: Promise<{ city: string }> }) {
  try {
    const { city } = await params;
    const data = await getCityData(city.toLowerCase());
    
    if (!data) {
      return notFound();
    }

    return (
      <>
        <SetCityEffect city={data.meta.name} />
        <PrivacyClient />
      </>
    );
  } catch (error) {
    console.error('Error in CityPrivacyPage:', error);
    return notFound();
  }
}