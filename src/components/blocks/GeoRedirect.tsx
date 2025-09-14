"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAvailableCities, getCityData } from "@/lib/data-service";

export default function GeoRedirect({ defaultCity }: { defaultCity: string }) {
  const router = useRouter();
  const [hasAttemptedGeo, setHasAttemptedGeo] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || hasAttemptedGeo) return;

    const attemptGeolocation = async () => {
      try {
        setHasAttemptedGeo(true);

        // Проверяем доступные города
        let availableCities: string[] = [];
        try {
          availableCities = await getAvailableCities();
          if (!availableCities.length) {
            console.log("Список доступных городов пуст, редирект на дефолтный");
            document.cookie = `user-city=Энгельс; path=/; max-age=31536000`;
            // router.push(`/${defaultCity}`);
            return;
          }
        } catch (err) {
          console.log("Ошибка получения списка городов:", err);
          document.cookie = `user-city=Энгельс; path=/; max-age=31536000`;
          // router.push(`/${defaultCity}`);
          return;
        }

        // Запрашиваем геолокацию
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            try {
              const geoRes = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
                {
                  headers: {
                    "User-Agent": "MTS-Tariff-App/1.0 (contact: support@example.com)",
                  },
                }
              );

              if (!geoRes.ok) {
                throw new Error(`Nominatim API error: ${geoRes.status}`);
              }

              const geo = await geoRes.json();
              const cityName = geo.address?.city || geo.address?.town || geo.address?.village;

              if (cityName) {
                const slug = cityName
                  .toLowerCase()
                  .replace(/^(г\.|пгт|село|аул|деревня|поселок|ст-ца|п\.)\s*/i, "")
                  .replace(/ё/g, "e")
                  .replace(/\s+/g, "-")
                  .replace(/[а-я]/g, (c: string) => {
                    const map: Record<string, string> = {
                      а: "a",
                      б: "b",
                      в: "v",
                      г: "g",
                      д: "d",
                      е: "e",
                      ж: "zh",
                      з: "z",
                      и: "i",
                      й: "i",
                      к: "k",
                      л: "l",
                      м: "m",
                      н: "n",
                      о: "o",
                      п: "p",
                      р: "r",
                      с: "s",
                      т: "t",
                      у: "u",
                      ф: "f",
                      х: "h",
                      ц: "c",
                      ч: "ch",
                      ш: "sh",
                      щ: "sch",
                      ы: "y",
                      э: "e",
                      ю: "yu",
                      я: "ya",
                    };
                    return map[c] || c;
                  })
                  .replace(/[^a-z0-9-]/g, "");

                // Проверяем, есть ли тарифы для города
                if (availableCities.includes(slug)) {
                  const cityData = await getCityData(slug);
                  if (cityData && Object.values(cityData.services).flatMap((s: any) => s.tariffs).length > 0) {
                    document.cookie = `user-city=${encodeURIComponent(cityName)}; path=/; max-age=31536000`;
                    router.push(`/${slug}`);
                    return;
                  }
                }

                // Если город недоступен или нет тарифов, редиректим на дефолтный
                document.cookie = `user-city=Энгельс; path=/; max-age=31536000`;
                // router.push(`/${defaultCity}`);
              } else {
                document.cookie = `user-city=Энгельс; path=/; max-age=31536000`;
                // router.push(`/${defaultCity}`);
              }
            } catch (err) {
              console.log("Ошибка геолокации (fetch):", err);
              document.cookie = `user-city=Энгельс; path=/; max-age=31536000`;
              // router.push(`/${defaultCity}`);
            }
          },
          (error) => {
            console.log("Ошибка геолокации (navigator):", error);
            document.cookie = `user-city=Энгельс; path=/; max-age=31536000`;
            // router.push(`/${defaultCity}`);
          },
          { timeout: 10000, maximumAge: 60000 }
        );
      } catch (err) {
        console.log("Ошибка в attemptGeolocation:", err);
        document.cookie = `user-city=Энгельс; path=/; max-age=31536000`;
        // router.push(`/${defaultCity}`);
      }
    };

    attemptGeolocation();
  }, [router, defaultCity, hasAttemptedGeo]);

  return null;
}