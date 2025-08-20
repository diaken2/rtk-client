'use client';

import React from 'react';
import ContactsBlock from "@/components/blocks/ContactsBlock";

interface ContactsClientProps {
  cityName: string;
}

export default function ContactsClient({ cityName }: ContactsClientProps) {
  return <ContactsBlock cityName={cityName} />;
}