import React from 'react';
import Link from 'next/link';

export default function Logo({ className = '', href = '/', cityName }: { className?: string; href?: string; cityName?:any }) {
  return (
    <Link href={`/${cityName}`} className={`block ${className}`} aria-label="Ростелеком">
      <div
        className="w-40 h-10 bg-no-repeat bg-left bg-contain"
        style={{
          backgroundImage: "url('/logo.png')",
        }}
      >
        <span className="sr-only">Ростелеком</span>
      </div>
    </Link>
  );
} 