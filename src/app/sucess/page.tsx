"use client";

import { useSearchParams } from 'next/navigation';

export default function Success() {
  const searchParams = useSearchParams();
  const InvId = searchParams.get('InvId');
  const productName = searchParams.get('SignatureValue');
  const amount = searchParams.get('OutSum');

  // Декодируем название товара (оно было закодировано в URL)
  const decodedProductName = productName ? decodeURIComponent(productName) : '';
console.log(amount, InvId, productName)
  return (
    <div className="min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-2">Оплата прошла успешно ✅</h1>
      <p>Спасибо! Заказ подтверждён.</p>
      
      {decodedProductName && amount && (
        <div className="mt-4 p-4 bg-green-50 rounded-md">
          <p className="text-lg font-semibold">
            Вы купили <span className="text-green-700">{decodedProductName}</span> за <span className="text-green-700">{amount} руб.</span>
          </p>
          <p className="text-sm text-gray-600 mt-1">Номер вашего заказа: {InvId}</p>
        </div>
      )}
      
      <div className="mt-6">
        <a 
          href="/" 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Вернуться в магазин
        </a>
      </div>
    </div>
  );
}