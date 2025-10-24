import fs from 'fs/promises';
import path from 'path';

export interface Tariff {
  id: number;
  name: string;
  type?: string;
  speed?: number;
  technology?: string;
  price: number;
  discountPrice?: number;
  discountPeriod?: string;
  discountPercentage?: number;
  tvChannels?: number;
  iconInternet?: string;
  iconTV?: string;
  features: string[];
  buttonColor?: string;
  isHit?: boolean;
}


export interface ServiceData {
  id: string;
  title: string;
  description: string;
  meta: {
    title?: string;
    description: string;
    keywords: string[];
    ogImage?: string;
  };
  tariffs: Tariff[];
}

export interface CityData {
  meta: {
    name: string;
    region: string;
    timezone: string;
  };
  services: {
    [key: string]: ServiceData;
  };
}

const DATA_DIR = path.join(process.cwd(), 'data', 'cities');
const cache = new Map<string, CityData>();

export async function getCityData(slug: string) {
  try {
    const res = await fetch(`https://rtk-backend-five.vercel.app/api/tariffs/${slug}`, {
      cache: 'no-store',
    });
    
    if (!res.ok) {
      console.error('Failed to fetch city data:', res.status);
      return null;
    }
    
    const data = await res.json();

    // 🔍 Отфильтровываем скрытые тарифы
    if (data?.services) {
      for (const category in data.services) {
        data.services[category].tariffs = (data.services[category].tariffs || [])
          .filter((t: any) => !t.hidden);
      }
    }

    return data;
  } catch (err) {
    console.error("Ошибка при получении данных:", err);
    return null;
  }
}
export async function getServiceData(city: string, service: string): Promise<{ 
  cityName: string; 
  service: ServiceData 
} | null> {
  try {
    const res = await fetch(`https://rtk-backend-five.vercel.app/api/tariffs/${city}/${service}`, {
      cache: 'no-store',
    });
    
    if (!res.ok) return null;
    const data = await res.json();
    
    // Фильтруем скрытые тарифы
    if (data?.service?.tariffs) {
      data.service.tariffs = data.service.tariffs.filter((t: any) => !t.hidden);
    }
    
    return data;
  } catch (err) {
    console.error("Ошибка при получении данных сервиса:", err);
    return null;
  }
}

export async function getAvailableCities(): Promise<string[]> {
  try {
    const res = await fetch(`https://rtk-backend-five.vercel.app/api/tariffs`, {
      cache: 'no-store',
    });
    
    if (!res.ok) {
      console.error('Failed to fetch cities:', res.status);
      return [];
    }
    
    const data = await res.json();
    return data.map((item: any) => item.slug);
  } catch (err) {
    console.error("Ошибка при получении списка городов:", err);
    return [];
  }
}

export async function getCityServices(city: string): Promise<string[]> {
  const cityData = await getCityData(city);
  return cityData ? Object.keys(cityData.services) : [];
} 