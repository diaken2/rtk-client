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

export async function getCityData(city: string): Promise<CityData | null> {
  if (cache.has(city)) return cache.get(city)!;
  try {
    const filePath = path.join(DATA_DIR, `${city}.json`);
    const data = await fs.readFile(filePath, 'utf-8');
    const json: CityData = JSON.parse(data);
    if (!json.meta || !json.services) throw new Error(`Invalid data structure for ${city}`);
    cache.set(city, json);
    return json;
  } catch {
    return null;
  }
}

export async function getServiceData(city: string, service: string): Promise<ServiceData | null> {
  const cityData = await getCityData(city);
  return cityData?.services[service] || null;
}

export async function getAvailableCities(): Promise<string[]> {
  try {
    const files = await fs.readdir(DATA_DIR);
    return files.filter(f => f.endsWith('.json')).map(f => f.replace('.json', ''));
  } catch {
    return [];
  }
}

export async function getCityServices(city: string): Promise<string[]> {
  const cityData = await getCityData(city);
  return cityData ? Object.keys(cityData.services) : [];
} 