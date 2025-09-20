'use client';

import React from 'react';
import PrivacyContent from './PrivacyContent';

export default function PrivacyClient({cityName}:any) {
  
  console.log("polictycityname", cityName)
  
  function slugifyCityName(city: string): string {
    const raw = city.replace(/^([а-яёa-z\-\.]+)[\s\-]+/i, "").trim().toLowerCase();
    return raw
      .replace(/ /g, "-")
      .replace(/[а-яё]/gi, (c) =>
        ({
          а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh",
          з: "z", и: "i", й: "i", к: "k", л: "l", м: "m", н: "n", о: "o",
          п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "c",
          ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya"
        }[c.toLowerCase()] || "")
      );
  }
  const citySlug =
      cityName && cityName.trim().length > 0 ? slugifyCityName(cityName) : "moskva";
  return <PrivacyContent citySlug={citySlug}/>;
}