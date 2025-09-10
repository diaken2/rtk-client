"use client"
import { useState } from "react";

export default function RobokassaPage() {
  const [loading, setLoading] = useState(false);
  const [invId, setInvId] = useState(null);

  const product = {
    id: "sku_1",
    name: "Футболка SVB (тест)",
    price: 299.0,
    description: "Тестовый товар для проверки Robokassa"
  };

  const handleBuy = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://maternally-excelling-stork.cloudpub.ru/api/robokassa/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          productName: product.name,
          amount: product.price,
          quantity: 1
        })
      });
      const data = await res.json();
      if (data?.paymentUrl) {
        setInvId(data.invId);
        window.location.href = data.paymentUrl; // редирект на Robokassa
      } else {
        alert("Ошибка при создании заказа");
      }
    } catch (e) {
      console.error(e);
      alert("Ошибка сети");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6">
      <h1>Robokassa — тест покупки</h1>
      <div>
        <h2>{product.name}</h2>
        <p>{product.description}</p>
        <p>{product.price} ₽</p>
        <button onClick={handleBuy} disabled={loading}>
          {loading ? "Подготовка..." : "Купить через Robokassa"}
        </button>
        {invId && <p>Создан заказ InvId: {invId}</p>}
      </div>
    </div>
  );
}
