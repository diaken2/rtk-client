"use client";

import React, { useState } from 'react';
import Input from "../ui/Input";

interface AddressBlockProps {
  onFindTariffs: (address: string) => void;
  city?: string;
}

const AddressBlock = ({ onFindTariffs, city }: AddressBlockProps) => {
  const [address, setAddress] = useState("");
  const streets = ["Ленина", "Пушкина", "Гагарина", "Советская", "Мира"];
  const cityLabel = city ? `в ${city}` : 'в России';
  
  const handleFind = () => {
    if (address) {
      onFindTariffs(address);
    } else {
      alert("Пожалуйста, введите адрес");
    }
  };

  return (
    <section className="bg-gradient-to-r from-[#ed6a40] to-[#7c2bf6] py-16">
      <div className="container mx-auto px-4">
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white mb-6">Подключите Ростелеком {cityLabel}</h1>
          <p className="text-xl text-white opacity-80 mb-12">
            Интернет, ТВ, Мобильная связь и Умный дом
          </p>
          <div className="bg-white rounded-2xl shadow-md p-8 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <div className="flex items-center text-gray-700 mb-4">
                  <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 0 0-5 2.5 2.5z"/>
                  </svg>
                  <span className="font-medium">{cityLabel}</span>
                </div>
                
                <div className="relative">
                  <div className="flex items-center bg-gray-50 border border-gray-200 rounded-full px-6 py-4">
                    <svg className="w-5 h-5 text-gray-500 mr-3" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M19.707 18.293l-4.822-4.822a8.019 8.019 0 0 1.414-1.414l4.822 4.822a1 1 0 0 1.414-1.414zM8 14a6 6 0 0 0-12 6 6 0 12z"/>
                    </svg>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Введите улицу и дом"
                      className="w-full bg-transparent focus:outline-none"
                      list="streets-list"
                    />
                    <datalist id="streets-list">
                      {streets.map((street, index) => (
                        <option key={index} value={`${street}, д. ${index + 1}`}></option>
                      ))}
                    </datalist>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col">
                <button 
                  onClick={handleFind}
                  className="bg-gradient-to-r from-[#ff4f12] to-[#7800ff] hover:opacity-90 text-white font-bold py-4 px-8 rounded-full transition duration-300"
                >
                  Найти тарифы
                </button>
                <button 
                  onClick={handleFind}
                  className="mt-4 border-2 border-[#7dc65b] text-[#7dc65b] hover:bg-[#7dc65b] hover:text-white font-bold py-3 px-6 rounded-full transition duration-300"
                >
                  Заказать звонок
                </button>
              </div>
            </div>
            
            <div className="mt-6 text-gray-600 text-sm">
              <p>Нажимая кнопку, вы соглашаетесь на обработку персональных данных</p>
            </div>
          </div>
        </div>
      </div>  
    </section>
  );
}

export default AddressBlock;