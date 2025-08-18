import { getAvailableCities, getCityServices } from './data-service';

let validCities: string[];
const cityServicesCache = new Map<string, string[]>();

export async function isValidCity(city: string): Promise<boolean> {
  if (!validCities) {
    validCities = await getAvailableCities();
  }
  return validCities.includes(city.toLowerCase());
}

export async function isValidService(city: string, service: string): Promise<boolean> {
  const normalizedCity = city.toLowerCase();
  if (!cityServicesCache.has(normalizedCity)) {
    const services = await getCityServices(normalizedCity);
    cityServicesCache.set(normalizedCity, services);
  }
  const services = cityServicesCache.get(normalizedCity) || [];
  return services.includes(service);
} 