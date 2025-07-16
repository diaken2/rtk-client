"use client";
import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { useCity } from '@/context/CityContext';

interface CityServiceLayoutProps {
  service: string;
  cityName?: string;
  citySlug?: string;
  children: React.ReactNode;
}

export default function CityServiceLayout({ service, cityName, children, citySlug }: CityServiceLayoutProps) {
  const { city, setCity } = useCity();

  React.useEffect(() => {
    if (cityName && cityName !== city) {
      setCity(cityName);
    }
  }, [cityName, city, setCity]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gray-50">{children}</main>
      <Footer cityName={citySlug} />
    </div>
  );
} 