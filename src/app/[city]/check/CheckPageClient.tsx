'use client';

import React, { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroAddressSearch from "@/components/blocks/HeroAddressSearch";
import CallRequestModal from "@/components/ui/CallRequestModal";
import { useSupportOnly } from "@/context/SupportOnlyContext";

interface CheckPageClientProps {
  cityName: string;
}

export default function CheckPageClient({ cityName }: CheckPageClientProps) {
  const [isCallRequestModalOpen, setIsCallRequestModalOpen] = useState(false);
  const { isSupportOnly } = useSupportOnly();

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