import { getAvailableCities, getCityData } from '@/lib/data-service';
import { notFound } from 'next/navigation';
import SetCityEffect from '@/components/layout/SetCityEffect';
import ContactsClient from './ContactsClient';

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
      title: `Контакты официального дилера Ростелеком в ${name}`,
      description: `Контактная информация Ростелеком в ${name}. Телефоны, адреса, официальный дилер.`
    };
  } catch (error) {
    return { 
      title: `Контакты официального дилера Ростелеком`,
      description: `Контактная информация Ростелеком. Телефоны, адреса, официальный дилер.`
    };
  }
}

export default async function CityContactsPage({ params }: { params: Promise<{ city: string }> }) {
  try {
    const { city } = await params;
    const data = await getCityData(city.toLowerCase());
    
    if (!data) {
      return notFound();
    }

    return (
      <>
        <SetCityEffect city={data.meta.name} />
        <ContactsClient cityName={city} />
      </>
    );
  } catch (error) {
    console.error('Error in CityContactsPage:', error);
    return notFound();
  }
}