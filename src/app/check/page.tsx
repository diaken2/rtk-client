"use client";

import React, { useState, Suspense } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroAddressSearch from "@/components/blocks/HeroAddressSearch";
import CallRequestModal from "@/components/ui/CallRequestModal";
import { useSupportOnly } from "@/context/SupportOnlyContext";

const city = "в России";

function CheckPageContent({cityName}:any) {
  const [isCallRequestModalOpen, setIsCallRequestModalOpen] = useState(false);
  const { isSupportOnly } = useSupportOnly();
console.log(cityName)
  const handleCallRequest = () => {
    setIsCallRequestModalOpen(true);
  };


  

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <HeroAddressSearch />
      <Footer cityName={cityName} />
      <CallRequestModal
        isOpen={isCallRequestModalOpen}
        onClose={() => setIsCallRequestModalOpen(false)}
      />
    </div>
  );
}

export default function CheckPage({cityName}:any) {
  console.log(cityName)
  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <CheckPageContent cityName={cityName}/>
    </Suspense>
  );
} 