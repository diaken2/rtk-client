"use client";
import { useEffect } from 'react';
import { useCity } from '@/context/CityContext';

export default function SetCityEffect({ city }: { city: string }) {
  const { setCity } = useCity();
  useEffect(() => {
    if (city) {
      setCity(city);
    }
  }, [city, setCity]);
  return null;
}
