import { getAvailableCities, getCityServices } from '@/lib/data-service';

export default async function sitemap() {
  const baseUrl = 'https://ваш-сайт.ru';
  const cities = await getAvailableCities();

  const mainRoutes = [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/contacts`, lastModified: new Date() },
    { url: `${baseUrl}/privacy`, lastModified: new Date() }
  ];

  const cityRoutes = [];
  for (const city of cities) {
    const services = await getCityServices(city);
    for (const service of services) {
      cityRoutes.push({
        url: `${baseUrl}/${city}/${service}`,
        lastModified: new Date(),
        priority: 0.7,
        changeFrequency: 'weekly' as const
      });
    }
  }

  return [...mainRoutes, ...cityRoutes];
} 