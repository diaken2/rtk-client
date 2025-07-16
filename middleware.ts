import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAvailableCities } from './src/lib/data-service';

const DEFAULT_CITY = 'moskva';
const DEFAULT_SERVICE = 'internet';
const SERVICES = ['internet', 'internet-tv', 'internet-mobile', 'internet-tv-mobile'];

function slugifyCityName(city: string): string {
  return city
    .toLowerCase()
    .replace(/^(г\.|пгт|село|аул|деревня|поселок|ст-ца|п\.)\s*/i, '')
    .replace(/ё/g, 'e')
    .replace(/\s+/g, '-')
    .replace(/[а-я]/g, c =>
      ({
        а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ж: "zh",
        з: "z", и: "i", й: "i", к: "k", л: "l", м: "m", н: "n", о: "o",
        п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "c",
        ч: "ch", ш: "sh", щ: "sch", ы: "y", э: "e", ю: "yu", я: "ya"
      }[c] || '')
    )
    .replace(/[^a-z0-9-]/g, '');
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const parts = pathname.split('/').filter(Boolean);

  const cities = await getAvailableCities();
  console.log("🌍 Available cities from data:", cities);

  // только на главной

  if (pathname === '/') {
  console.log("💥 MIDDLEWARE TRIGGERED");
  return NextResponse.redirect(new URL('/moskva/internet', request.url));
}

  if (pathname === '/') {
    let cityCookie = request.cookies.get('user-city')?.value;
    console.log("🌍 Cookie city value:", cityCookie);

    let citySlug: string | null = null;

    if (cityCookie) {
      const slug = slugifyCityName(cityCookie);
      console.log("🌍 Slugified cookie city:", slug);

      if (cities.includes(slug)) {
        console.log("✅ Cookie city matched:", slug);
        citySlug = slug;
      } else {
        console.log("🚫 Cookie city not in available cities");
      }
    }

    if (!citySlug) {
      let ip = request.headers.get('x-forwarded-for') || request.ip || '';
      if (ip.startsWith('::ffff:')) ip = ip.replace('::ffff:', '');
      console.log("🌍 Trying geo IP:", ip);

      if (ip === '127.0.0.1' || ip === '::1' || ip === '') {
        console.log("⚠️ Localhost IP, fallback to DEFAULT_CITY");
        citySlug = DEFAULT_CITY;
      } else {
        try {
          const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=city,status,message`, { next: { revalidate: 3600 } });
          const geo = await geoRes.json();
          console.log("🌍 Geo API response:", geo);

          if (geo.status === 'success' && geo.city) {
            const slug = slugifyCityName(geo.city);
            console.log("🌍 Slugified geo city:", slug);

            if (cities.includes(slug)) {
              console.log("✅ Geo city matched:", slug);
              citySlug = slug;
            } else {
              console.log("🚫 Geo city not in available cities");
            }
          } else {
            console.log("🚫 Geo API failed or no city returned");
          }
        } catch (err) {
          console.log("🚫 Geo API fetch error:", err);
          citySlug = DEFAULT_CITY;
        }
      }
    }

    if (citySlug) {
      console.log(`👉 Redirecting to /${citySlug}/${DEFAULT_SERVICE}`);
      return NextResponse.redirect(new URL(`/${citySlug}/${DEFAULT_SERVICE}`, request.url), 308);
    } else {
      console.log("❗ No city detected, staying on /");
    }
  }

  // старые ссылки типа /internet
  if (SERVICES.includes(parts[0])) {
    const newUrl = new URL(`/${DEFAULT_CITY}${pathname}`, request.url);
    console.log(`👉 Redirect from old URL to ${newUrl}`);
    return NextResponse.redirect(newUrl, 308);
  }

  // нормализация регистра
  if (parts.length > 0) {
    const city = parts[0].toLowerCase();
    if (cities.includes(city) && parts[0] !== city) {
      const newPath = [city, ...parts.slice(1)].join('/');
      const newUrl = new URL(`/${newPath}`, request.url);
      console.log(`👉 Normalized city case redirect to ${newUrl}`);
      return NextResponse.redirect(newUrl, 308);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
