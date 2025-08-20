"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import TariffCard from "@/components/tariff/TariffCard";
import ContactModal from "@/components/forms/ContactModal";
import ConnectionForm from "@/components/forms/ConnectionForm";
import HeroAddressSearch from "@/components/blocks/HeroAddressSearch";
import MobileFiltersDrawer from "@/components/filters/MobileFiltersDrawer";
import { FiFilter } from "react-icons/fi";
import 'rc-slider/assets/index.css';
import Slider from 'rc-slider';
import SegmentationModal from '@/components/ui/SegmentationModal';
import CallRequestModal from '@/components/ui/CallRequestModal';
import HowConnect from '@/components/blocks/HowConnect';
import Bonuses from '@/components/blocks/Bonuses';
import PromoSlider from '@/components/blocks/PromoSlider';
import EquipmentBlock from '@/components/blocks/EquipmentBlock';
import QuestionsBlock from '@/components/blocks/QuestionsBlock';
import InfoBlockKrasnodar from '@/components/blocks/InfoBlockKrasnodar';
import FaqBlock from "../components/blocks/FaqBlock";
import SupportOnlyBlock from '@/components/ui/SupportOnlyBlock';
import InputMask from "react-input-mask";
import { submitLead } from '@/lib/submitLead';
import { useSupportOnly } from '@/context/SupportOnlyContext';




// Полные данные тарифов
const tariffsData = [
  {
    id: 1,
    name: "Технологии доступа Макси 300",
    type: "Интернет",
    speed: 300,
    technology: "GPON",
    price: 800,
    features: [
      "Wink на 180 дней (25 000 фильмов и сериалов)",
      "Wi-Fi роутер — 150 ₽/мес в аренду",
      "+8 ГБ облачного хранилища от Mail.ru"
    ],
    buttonColor: "orange"
  },
  {
    id: 2,
    name: "Технологии доступа Тест-драйв",
    type: "Интернет",
    speed: 100,
    technology: "FTTB",
    price: 700,
    discountPrice: 0,
    discountPeriod: "первый месяц",
    discountPercentage: 100,
    features: [
      "Wink на 180 дней (25 000 фильмов и сериалов)",
      "Wi-Fi роутер — 100 ₽/мес в аренду",
      "+8 ГБ облачного хранилища от Mail.ru",
      "Оборудование и услуга «Гарантия+» бесплатно 1 месяц"
    ],
    buttonColor: "purple"
  },
  {
    id: 3,
    name: "Технологии развлечения Макси 300",
    type: "Интернет + ТВ",
    speed: 300,
    technology: "GPON",
    tvChannels: 210,
    price: 850,
    features: [
      "Wink (25 000 фильмов и сериалов)",
      "Wi-Fi роутер — 150 ₽/мес в аренду",
      "+8 ГБ облачного хранилища от Mail.ru"
    ],
    buttonColor: "orange"
  },
  {
    id: 4,
    name: "Технологии развлечения Тест-драйв",
    type: "Интернет + ТВ",
    speed: 100,
    technology: "FTTB",
    tvChannels: 210,
    price: 800,
    discountPrice: 0,
    discountPeriod: "первый месяц",
    discountPercentage: 100,
    features: [
      "Wink (25 000 фильмов и сериалов)",
      "Wi-Fi роутер — 100 ₽/мес в аренду",
      "+8 ГБ облачного хранилища от Mail.ru",
      "Оборудование и услуга «Гарантия+» бесплатно 1 месяц"
    ],
    buttonColor: "purple"
  },
  {
    id: 5,
    name: "Технологии выгоды Тест-драйв",
    type: "Интернет + ТВ + Моб. связь",
    speed: 250,
    technology: "GPON",
    tvChannels: 210,
    mobileData: 40,
    mobileMinutes: 1000,
    price: 950,
    discountPrice: 0,
    discountPeriod: "первый месяц",
    discountPercentage: 100,
    features: [
      "Wink (25 000 фильмов и сериалов)",
      "Wi-Fi роутер — 150 ₽/мес в аренду",
      "Бесплатный доступ к Одноклассники и ВКонтакте",
      "Бесплатный доступ к мессенджерам WhatsApp, Telegram, TamTam",
      "Перенос остатков минут и ГБ"
    ],
    isHit: true,
    buttonColor: "purple"
  },
  {
    id: 6,
    name: "Технологии доступа Тест-драйв",
    type: "Интернет",
    speed: 200,
    technology: "GPON",
    price: 700,
    discountPrice: 0,
    discountPeriod: "первый месяц",
    discountPercentage: 100,
    features: [
      "Wink на 180 дней (25 000 фильмов и сериалов)",
      "Wi-Fi роутер — 150 ₽/мес в аренду",
      "+8 ГБ облачного хранилища от Mail.ru",
      "Оборудование и услуга «Гарантия+» бесплатно 1 месяц"
    ],
    isHit: true,
    buttonColor: "purple"
  },
  {
    id: 7,
    name: "Технологии развлечения Тест-драйв",
    type: "Интернет + ТВ",
    speed: 200,
    technology: "GPON",
    tvChannels: 210,
    price: 800,
    discountPrice: 0,
    discountPeriod: "первый месяц",
    discountPercentage: 100,
    features: [
      "Wink на 180 дней (25 000 фильмов и сериалов)",
      "Wi-Fi роутер — 150 ₽/мес в аренду",
      "+8 ГБ облачного хранилища от Mail.ru",
      "Оборудование и услуга «Гарантия+» бесплатно 1 месяц"
    ],
    isHit: true,
    buttonColor: "purple"
  },
  {
    id: 8,
    name: "Технологии общения Тест-драйв",
    type: "Интернет + Моб. связь",
    speed: 250,
    technology: "GPON",
    mobileData: 40,
    mobileMinutes: 1000,
    price: 800,
    discountPrice: 0,
    discountPeriod: "первый месяц",
    discountPercentage: 100,
    features: [
      "Wink на 180 дней (25 000 фильмов и сериалов)",
      "Перенос остатков минут и ГБ",
      "Wi-Fi роутер — 150 ₽/мес в аренду",
      "Бесплатный доступ к Одноклассники и ВКонтакте",
      "Бесплатный доступ к мессенджерам WhatsApp, Telegram, TamTam"
    ],
    isHit: true,
    buttonColor: "purple"
  },
  {
    id: 9,
    name: "Технологии общения Семейный",
    type: "Интернет + Моб. связь",
    speed: 500,
    technology: "GPON",
    mobileData: 40,
    mobileMinutes: 2000,
    price: 950,
    discountPrice: 475,
    discountPeriod: "первые 2 месяца",
    discountPercentage: 50,
    features: [
      "Перенос остатков минут и ГБ",
      "Wi-Fi роутер — 150 ₽/мес в аренду",
      "Бесплатный доступ к Одноклассники и ВКонтакте",
      "Бесплатный доступ к мессенджерам WhatsApp, Telegram, TamTam"
    ],
    buttonColor: "purple"
  },
  {
    id: 10,
    name: "Технологии общения Тест-драйв",
    type: "Интернет + Моб. связь",
    speed: 100,
    technology: "FTTB",
    mobileData: 40,
    mobileMinutes: 1000,
    price: 800,
    discountPrice: 0,
    discountPeriod: "первый месяц",
    discountPercentage: 100,
    features: [
      "Wink на 180 дней (25 000 фильмов и сериалов)",
      "Перенос остатков минут и ГБ",
      "Wi-Fi роутер — 150 ₽/мес в аренду",
      "Бесплатный доступ к Одноклассники и ВКонтакте",
      "Бесплатный доступ к мессенджерам WhatsApp, Telegram, TamTam"
    ],
    buttonColor: "purple"
  },
  {
    id: 11,
    name: "Технологии развлечения Макси 500",
    type: "Интернет + ТВ",
    speed: 500,
    technology: "GPON",
    tvChannels: 210,
    price: 950,
    features: [
      "Wink (25 000 фильмов и сериалов)",
      "Wi-Fi роутер — 150 ₽/мес в аренду",
      "+8 ГБ облачного хранилища от Mail.ru"
    ],
    buttonColor: "orange"
  },
  {
    id: 12,
    name: "Игровой",
    type: "Интернет + ТВ",
    speed: 700,
    technology: "GPON",
    tvChannels: 210,
    price: 1150,
    features: [
      "Wink (25 000 фильмов и сериалов)",
      "Wi-Fi роутер — 150 ₽/мес в аренду",
      "Бонусы в играх от 4GAME",
      "Бонусы в играх от VK Play",
      "Бонусы в играх от Леста Игры"
    ],
    buttonColor: "orange"
  },
  {
    id: 13,
    name: "Технологии доступа Макси 500",
    type: "Интернет",
    speed: 500,
    technology: "GPON",
    price: 900,
    features: [
      "Wink на 180 дней (25 000 фильмов и сериалов)",
      "Wi-Fi роутер — 150 ₽/мес в аренду",
      "+8 ГБ облачного хранилища от Mail.ru"
    ],
    buttonColor: "orange"
  },
  {
    id: 14,
    name: "Технологии выгоды Тест-драйв",
    type: "Интернет + ТВ + Моб. связь",
    speed: 100,
    technology: "FTTB",
    tvChannels: 210,
    mobileData: 40,
    mobileMinutes: 1000,
    price: 950,
    discountPrice: 0,
    discountPeriod: "первый месяц",
    discountPercentage: 100,
    features: [
      "Wink (25 000 фильмов и сериалов)",
      "Перенос остатков минут и ГБ",
      "Wi-Fi роутер — 100 ₽/мес в аренду",
      "Бесплатный доступ к Одноклассники и ВКонтакте",
      "Бесплатный доступ к мессенджерам WhatsApp, Telegram, TamTam"
    ],
    buttonColor: "purple"
  },
  {
    id: 15,
    name: "Игровой",
    type: "Интернет",
    speed: 700,
    technology: "GPON",
    price: 950,
    features: [
      "Wink на 180 дней (25 000 фильмов и сериалов)",
      "Бонусы в играх от 4GAME",
      "Бонусы в играх от VK Play",
      "Бонусы в играх от Леста Игры",
      "Wi-Fi роутер — 150 ₽/мес в аренду"
    ],
    buttonColor: "orange"
  },
  {
    id: 16,
    name: "Технологии развлечения Макси 300",
    type: "Интернет + ТВ",
    speed: 300,
    technology: "FTTB",
    tvChannels: 210,
    price: 850,
    features: [
      "Wink (25 000 фильмов и сериалов)",
      "Wi-Fi роутер — 100 ₽/мес в аренду",
      "+8 ГБ облачного хранилища от Mail.ru"
    ],
    buttonColor: "orange"
  },
  {
    id: 17,
    name: "Технологии общения Тест-драйв",
    type: "Интернет + Моб. связь",
    speed: 250,
    technology: "GPON",
    mobileData: 40,
    mobileMinutes: 2000,
    price: 950,
    discountPrice: 0,
    discountPeriod: "первый месяц",
    discountPercentage: 100,
    features: [
      "Wink на 180 дней (25 000 фильмов и сериалов)",
      "Перенос остатков минут и ГБ",
      "Wi-Fi роутер — 150 ₽/мес в аренду",
      "Бесплатный доступ к Одноклассники и ВКонтакте",
      "Бесплатный доступ к мессенджерам WhatsApp, Telegram, TamTam"
    ],
    buttonColor: "purple"
  },
  {
    id: 18,
    name: "Технологии выгоды Семейный",
    type: "Интернет + ТВ + Моб. связь",
    speed: 500,
    technology: "GPON",
    tvChannels: 210,
    mobileData: 40,
    mobileMinutes: 2000,
    price: 1200,
    discountPrice: 600,
    discountPeriod: "первые 2 месяца",
    discountPercentage: 50,
    features: [
      "Wink (25 000 фильмов и сериалов)",
      "Перенос остатков минут и ГБ",
      "Wi-Fi роутер — 150 ₽/мес в аренду",
      "Бесплатный доступ к Одноклассники и ВКонтакте",
      "Бесплатный доступ к мессенджерам WhatsApp, Telegram, TamTam"
    ],
    buttonColor: "purple"
  },
  {
    id: 19,
    name: "Технологии развлечения Макси 500",
    type: "Интернет + ТВ",
    speed: 500,
    technology: "FTTB",
    tvChannels: 210,
    price: 950,
    features: [
      "Wink (25 000 фильмов и сериалов)",
      "Wi-Fi роутер — 100 ₽/мес в аренду",
      "+8 ГБ облачного хранилища от Mail.ru"
    ],
    buttonColor: "orange"
  },
  {
    id: 20,
    name: "Технологии выгоды Тест-драйв",
    type: "Интернет + ТВ + Моб. связь",
    speed: 250,
    technology: "GPON",
    tvChannels: 210,
    mobileData: 40,
    mobileMinutes: 2000,
    price: 1200,
    discountPrice: 0,
    discountPeriod: "первый месяц",
    discountPercentage: 100,
    features: [
      "Wink (25 000 фильмов и сериалов)",
      "Перенос остатков минут и ГБ",
      "Wi-Fi роутер — 150 ₽/мес в аренду",
      "Бесплатный доступ к Одноклассники и ВКонтакте",
      "Бесплатный доступ к мессенджерам WhatsApp, Telegram, TamTam"
    ],
    buttonColor: "purple"
  },
  {
    id: 21,
    name: "Технологии доступа Макси 500",
    type: "Интернет",
    speed: 500,
    technology: "FTTB",
    price: 900,
    features: [
      "Wink на 180 дней (25 000 фильмов и сериалов)",
      "Wi-Fi роутер — 100 ₽/мес в аренду",
      "+8 ГБ облачного хранилища от Mail.ru"
    ],
    buttonColor: "orange"
  },
  {
    id: 22,
    name: "Технологии общения Тест-драйв",
    type: "Интернет + Моб. связь",
    speed: 100,
    technology: "FTTB",
    mobileData: 40,
    mobileMinutes: 1000,
    price: 800,
    discountPrice: 0,
    discountPeriod: "первый месяц",
    discountPercentage: 100,
    features: [
      "Wink на 180 дней (25 000 фильмов и сериалов)",
      "Перенос остатков минут и ГБ",
      "Wi-Fi роутер — 100 ₽/мес в аренду",
      "Бесплатный доступ к Одноклассники и ВКонтакте",
      "Бесплатный доступ к мессенджерам WhatsApp, Telegram, TamTam"
    ],
    buttonColor: "purple"
  },
  {
    id: 23,
    name: "Технологии выгоды Тест-драйв",
    type: "Интернет + ТВ + Моб. связь",
    speed: 100,
    technology: "FTTB",
    tvChannels: 210,
    mobileData: 40,
    mobileMinutes: 1000,
    price: 950,
    discountPrice: 0,
    discountPeriod: "первый месяц",
    discountPercentage: 100,
    features: [
      "Wink (25 000 фильмов и сериалов)",
      "Перенос остатков минут и ГБ",
      "Wi-Fi роутер — 100 ₽/мес в аренду",
      "Бесплатный доступ к Одноклассники и ВКонтакте",
      "Бесплатный доступ к мессенджерам WhatsApp, Telegram, TamTam"
    ],
    buttonColor: "purple"
  },
  {
    id: 24,
    name: "Игровой",
    type: "Интернет + ТВ",
    speed: 500,
    technology: "FTTB",
    tvChannels: 210,
    price: 1150,
    features: [
      "Wink (25 000 фильмов и сериалов)",
      "Wi-Fi роутер — 100 ₽/мес в аренду",
      "Бонусы в играх от 4GAME",
      "Бонусы в играх от VK Play",
      "Бонусы в играх от Леста Игры"
    ],
    buttonColor: "orange"
  },
  {
    id: 25,
    name: "Игровой",
    type: "Интернет",
    speed: 500,
    technology: "FTTB",
    price: 950,
    features: [
      "Wink на 180 дней (25 000 фильмов и сериалов)",
      "Wi-Fi роутер — 100 ₽/мес в аренду",
      "Бонусы в играх от 4GAME",
      "Бонусы в играх от VK Play",
      "Бонусы в играх от Леста Игры"
    ],
    buttonColor: "orange"
  },
  {
    id: 26,
    name: "Игровой 4в1",
    type: "Интернет + ТВ + Моб. связь",
    speed: 700,
    technology: "GPON",
    tvChannels: 210,
    mobileData: 40,
    mobileMinutes: 1000,
    price: 1400,
    features: [
      "Wink (25 000 фильмов и сериалов)",
      "Перенос остатков минут и ГБ",
      "Wi-Fi роутер — 150 ₽/мес в аренду",
      "Бесплатный доступ к Одноклассники и ВКонтакте",
      "Бесплатный доступ к мессенджерам WhatsApp, Telegram, TamTam",
      "Бонусы в играх от 4GAME",
      "Бонусы в играх от VK Play",
      "Бонусы в играх от Леста Игры"
    ],
    buttonColor: "orange"
  },
  {
    id: 27,
    name: "Игровой 2в1",
    type: "Интернет + Моб. связь",
    speed: 700,
    technology: "GPON",
    mobileData: 40,
    mobileMinutes: 1000,
    price: 1200,
    features: [
      "Wink на 180 дней (25 000 фильмов и сериалов)",
      "Перенос остатков минут и ГБ",
      "Wi-Fi роутер — 150 ₽/мес в аренду",
      "Бесплатный доступ к Одноклассники и ВКонтакте",
      "Бесплатный доступ к мессенджерам WhatsApp, Telegram, TamTam",
      "Бонусы в играх от 4GAME",
      "Бонусы в играх от VK Play",
      "Бонусы в играх от Леста Игры"
    ],
    buttonColor: "orange"
  },
  {
    id: 28,
    name: "Технологии общения Семейный",
    type: "Интернет + Моб. связь",
    speed: 100,
    technology: "FTTB",
    mobileData: 40,
    mobileMinutes: 2000,
    price: 950,
    discountPrice: 475,
    discountPeriod: "первые 2 месяца",
    discountPercentage: 50,
    features: [
      "Перенос остатков минут и ГБ",
      "Wi-Fi роутер — 100 ₽/мес в аренду",
      "Бесплатный доступ к Одноклассники и ВКонтакте",
      "Бесплатный доступ к мессенджерам WhatsApp, Telegram, TamTam"
    ],
    buttonColor: "purple"
  },
  {
    id: 29,
    name: "Технологии общения Тест-драйв",
    type: "Интернет + Моб. связь",
    speed: 100,
    technology: "FTTB",
    mobileData: 40,
    mobileMinutes: 2000,
    price: 950,
    discountPrice: 0,
    discountPeriod: "первый месяц",
    discountPercentage: 100,
    features: [
      "Wink на 180 дней (25 000 фильмов и сериалов)",
      "Перенос остатков минут и ГБ",
      "Wi-Fi роутер — 100 ₽/мес в аренду",
      "Бесплатный доступ к Одноклассники и ВКонтакте",
      "Бесплатный доступ к мессенджерам WhatsApp, Telegram, TamTam"
    ],
    buttonColor: "purple"
  },
  {
    id: 30,
    name: "Технологии выгоды Семейный",
    type: "Интернет + ТВ + Моб. связь",
    speed: 100,
    technology: "FTTB",
    tvChannels: 210,
    mobileData: 40,
    mobileMinutes: 2000,
    price: 1200,
    discountPrice: 600,
    discountPeriod: "первые 2 месяца",
    discountPercentage: 50,
    features: [
      "Wink (25 000 фильмов и сериалов)",
      "Перенос остатков минут и ГБ",
      "Wi-Fi роутер — 100 ₽/мес в аренду",
      "Бесплатный доступ к Одноклассники и ВКонтакте",
      "Бесплатный доступ к мессенджерам WhatsApp, Telegram, TamTam"
    ],
    buttonColor: "purple"
  },
  {
    id: 31,
    name: "Технологии выгоды+ Тест-драйв",
    type: "Интернет + ТВ + Моб. связь",
    speed: 100,
    technology: "FTTB",
    tvChannels: 210,
    mobileData: 40,
    mobileMinutes: 2000,
    price: 1200,
    discountPrice: 0,
    discountPeriod: "первый месяц",
    discountPercentage: 100,
    features: [
      "Wink (25 000 фильмов и сериалов)",
      "Перенос остатков минут и ГБ",
      "Wi-Fi роутер — 100 ₽/мес в аренду",
      "Бесплатный доступ к Одноклассники и ВКонтакте",
      "Бесплатный доступ к мессенджерам WhatsApp, Telegram, TamTam"
    ],
    buttonColor: "purple"
  },
  {
    id: 32,
    name: "Технологии общения+",
    type: "Интернет + Моб. связь",
    speed: 100,
    technology: "FTTB",
    mobileData: 40,
    mobileMinutes: 1000,
    price: 950,
    features: [
      "Wink на 180 дней (25 000 фильмов и сериалов)",
      "Перенос остатков минут и ГБ",
      "Wi-Fi роутер — 100 ₽/мес в аренду",
      "Бесплатный доступ к Одноклассники и ВКонтакте",
      "Бесплатный доступ к мессенджерам WhatsApp, Telegram, TamTam"
    ],
    buttonColor: "orange"
  },
  {
    id: 33,
    name: "Игровой 4в1+",
    type: "Интернет + ТВ + Моб. связь",
    speed: 700,
    technology: "GPON",
    tvChannels: 210,
    mobileData: 40,
    mobileMinutes: 2000,
    price: 1600,
    features: [
      "Wink (25 000 фильмов и сериалов)",
      "Перенос остатков минут и ГБ",
      "Wi-Fi роутер — 150 ₽/мес в аренду",
      "Бесплатный доступ к Одноклассники и ВКонтакте",
      "Бесплатный доступ к мессенджерам WhatsApp, Telegram, TamTam",
      "Бонусы в играх от 4GAME",
      "Бонусы в играх от VK Play",
      "Бонусы в играх от Леста Игры"
    ],
    buttonColor: "orange"
  },
  {
    id: 34,
    name: "Игровой 2в1+",
    type: "Интернет + Моб. связь",
    speed: 700,
    technology: "GPON",
    mobileData: 40,
    mobileMinutes: 1000,
    price: 1400,
    features: [
      "Wink на 180 дней (25 000 фильмов и сериалов)",
      "Перенос остатков минут и ГБ",
      "Wi-Fi роутер — 150 ₽/мес в аренду",
      "Бесплатный доступ к Одноклассники и ВКонтакте",
      "Бесплатный доступ к мессенджерам WhatsApp, Telegram, TamTam",
      "Бонусы в играх от 4GAME",
      "Бонусы в играх от VK Play",
      "Бонусы в играх от Леста Игры"
    ],
    buttonColor: "orange"
  },
  {
    id: 35,
    name: "Игровой 4в1",
    type: "Интернет + ТВ + Моб. связь",
    speed: 500,
    technology: "FTTB",
    tvChannels: 210,
    mobileData: 40,
    mobileMinutes: 1000,
    price: 1400,
    features: [
      "Wink (25 000 фильмов и сериалов)",
      "Перенос остатков минут и ГБ",
      "Wi-Fi роутер — 100 ₽/мес в аренду",
      "Бесплатный доступ к Одноклассники и ВКонтакте",
      "Бесплатный доступ к мессенджерам WhatsApp, Telegram, TamTam",
      "Бонусы в играх от 4GAME",
      "Бонусы в играх от VK Play",
      "Бонусы в играх от Леста Игры"
    ],
    buttonColor: "orange"
  },
  {
    id: 36,
    name: "Игровой 2в1+",
    type: "Интернет + Моб. связь",
    speed: 700,
    technology: "GPON",
    mobileData: 40,
    mobileMinutes: 1000,
    price: 1400,
    features: [
      "Wink на 180 дней (25 000 фильмов и сериалов)",
      "Перенос остатков минут и ГБ",
      "Wi-Fi роутер — 150 ₽/мес в аренду",
      "Бесплатный доступ к Одноклассники и ВКонтакте",
      "Бесплатный доступ к мессенджерам WhatsApp, Telegram, TamTam",
      "Бонусы в играх от 4GAME",
      "Бонусы в играх от VK Play",
      "Бонусы в играх от Леста Игры"
    ],
    buttonColor: "orange"
  },
  {
    id: 37,
    name: "Игровой 2в1",
    type: "Интернет + Моб. связь",
    speed: 500,
    technology: "FTTB",
    mobileData: 40,
    mobileMinutes: 1000,
    price: 1200,
    features: [
      "Wink на 180 дней (25 000 фильмов и сериалов)",
      "Перенос остатков минут и ГБ",
      "Wi-Fi роутер — 100 ₽/мес в аренду",
      "Бесплатный доступ к Одноклассники и ВКонтакте",
      "Бесплатный доступ к мессенджерам WhatsApp, Telegram, TamTam",
      "Бонусы в играх от 4GAME",
      "Бонусы в играх от VK Play",
      "Бонусы в играх от Леста Игры"
    ],
    buttonColor: "orange"
  },
  {
    id: 38,
    name: "Игровой 4в1+",
    type: "Интернет + ТВ + Моб. связь",
    speed: 500,
    technology: "FTTB",
    tvChannels: 210,
    mobileData: 40,
    mobileMinutes: 2000,
    price: 1600,
    features: [
      "Wink (25 000 фильмов и сериалов)",
      "Перенос остатков минут и ГБ",
      "Wi-Fi роутер — 100 ₽/мес в аренду",
      "Бесплатный доступ к Одноклассники и ВКонтакте",
      "Бесплатный доступ к мессенджерам WhatsApp, Telegram, TamTam",
      "Бонусы в играх от 4GAME",
      "Бонусы в играх от VK Play",
      "Бонусы в играх от Леста Игры"
    ],
    buttonColor: "orange"
  },
  {
    id: 39,
    name: "Игровой 2в1+",
    type: "Интернет + Моб. связь",
    speed: 500,
    technology: "FTTB",
    mobileData: 40,
    mobileMinutes: 1000,
    price: 1400,
    features: [
      "Wink на 180 дней (25 000 фильмов и сериалов)",
      "Перенос остатков минут и ГБ",
      "Wi-Fi роутер — 100 ₽/мес в аренду",
      "Бесплатный доступ к Одноклассники и ВКонтакте",
      "Бесплатный доступ к мессенджерам WhatsApp, Telegram, TamTam",
      "Бонусы в играх от 4GAME",
      "Бонусы в играх от VK Play",
      "Бонусы в играх от Леста Игры"
    ],
    buttonColor: "orange"
  }
];

const defaultFilters = {
  internet: false,
  tv: false,
  mobile: false,
  onlineCinema: false,
  gameBonuses: false,
  promotions: false,
  freeInstallation: false,
  wifiRouter: false,
  hitsOnly: false,
  connectionType: "apartment",
  priceRange: [300, 1700],
  speedRange: [50, 1000],
};

const getServiceFiltersForCategory = (categoryId: string) => {
  switch (categoryId) {
    case "internet":
      return { internet: true, tv: false, mobile: false };
    case "internet-tv":
      return { internet: true, tv: true, mobile: false };
    case "internet-mobile":
      return { internet: true, tv: false, mobile: true };
    case "internet-tv-mobile":
      return { internet: true, tv: true, mobile: true };
    default:
      return { internet: false, tv: false, mobile: false };
  }
};

function getInitialFilters(searchParams: any): typeof defaultFilters {
  const urlCategory = searchParams.get("filter") || "all";
  if (urlCategory === "all") {
    return defaultFilters;
  }
  return {
    ...defaultFilters,
    ...getServiceFiltersForCategory(urlCategory),
  };
}

// Фильтрация по категориям (строгая реализация)
const isTariffInCategory = (tariff: any, categoryId: string): boolean => {
  switch (categoryId) {
    case "internet":
      return tariff.type === "Интернет";
    case "internet-tv":
      return tariff.type === "Интернет + ТВ";
    case "internet-mobile":
      return tariff.type === "Интернет + Моб. связь";
    case "internet-tv-mobile":
      // Строгая проверка для комбинированной категории
      const hasInternet = tariff.speed > 0;
      const hasTV = (tariff.tvChannels || 0) > 0;
      const hasMobile = (tariff.mobileData || 0) > 0 || (tariff.mobileMinutes || 0) > 0;
      
      // Основной критерий - наличие всех трех услуг
      if (hasInternet && hasTV && hasMobile) return true;
      
      // Резервный критерий - только для тарифов с типом "Интернет + ТВ + Моб. связь"
      if (tariff.type === "Интернет + ТВ + Моб. связь") {
        const categoryKeywords = ['выгоды', 'семейный', 'игровой', 'комбинированный', 'тест-драйв'];
        if (categoryKeywords.some(keyword => tariff.name.toLowerCase().includes(keyword))) {
          return true;
        }
      }
      
      // Дополнительная проверка для тарифов "Тест-драйв" с комбинированными услугами
      if (tariff.name.toLowerCase().includes('тест-драйв')) {
        const hasAnyTV = tariff.type.includes('ТВ') || (tariff.tvChannels || 0) > 0;
        const hasAnyMobile = tariff.type.includes('Моб. связь') || (tariff.mobileData || 0) > 0 || (tariff.mobileMinutes || 0) > 0;
        if (hasInternet && hasAnyTV && hasAnyMobile) return true;
      }
      
      return false;
    default:
      return true; // "all"
  }
};

const houseTypes = ["Квартира", "Частный дом", "Офис"];
const supportOptions = [
  "Оплата услуг",
  "Оборудование",
  "Не работает интернет/ТВ"
];

function TariffHelpForm() {
  const [step, setStep] = React.useState<null | 'connection' | 'support'>(null);
  const [houseType, setHouseType] = React.useState(houseTypes[0]);
  const [phone, setPhone] = React.useState("");
  const [name, setName] = React.useState("");
  const [supportValue, setSupportValue] = React.useState<string | null>(null);
  const isFormValid = phone.replace(/\D/g, "").length === 10 && name.trim().length > 1;
  const [submitted, setSubmitted] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const router = useRouter();
  const { setSupportOnly } = useSupportOnly();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitted(true);

    try {
      const result = await submitLead({
        type: step === 'connection' ? 'Новое подключение' : 'Поддержка существующего абонента',
        name: name,
        phone: phone,
        houseType: houseType,
        supportValue: supportValue || undefined,
      });

      if (result.success) {
        setTimeout(() => {
          setSubmitted(false);
          setPhone(""); 
          setName("");
          router.push('/complete');
        }, 2000);
      } else {
        console.error('Failed to submit lead:', result.error);
        // В случае ошибки все равно показываем успех пользователю
        setTimeout(() => {
          setSubmitted(false);
          setPhone(""); 
          setName("");
          router.push('/complete');
        }, 2000);
      }
    } catch (error) {
      console.error('Error submitting lead:', error);
      // В случае ошибки все равно показываем успех пользователю
      setTimeout(() => {
        setSubmitted(false);
        setPhone(""); 
        setName("");
        router.push('/complete');
      }, 2000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // step === 'support'
  React.useEffect(() => {
    if (step === 'support' && supportValue) {
      setSupportOnly(true);
    }
  }, [step, supportValue, setSupportOnly]);

  if (!step) {
    return (
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <button className="bg-[#ff4d06] text-white font-bold rounded-full px-10 py-4 text-lg transition hover:bg-[#ff7f2a]" onClick={() => setStep('connection')}>Новое подключение</button>
        <button className="bg-transparent border-2 border-white text-white font-bold rounded-full px-10 py-4 text-lg transition hover:bg-white hover:text-[#8000ff]" onClick={() => setStep('support')}>Я существующий абонент</button>
      </div>
    );
  }

  if (step === 'connection') {
    return (
      <>
        <form className="w-full flex flex-col gap-4" autoComplete="off" onSubmit={handleSubmit}>
          {/* Радиокнопки */}
          <div className="flex flex-row gap-8 items-center mb-2 overflow-x-auto pb-2">
            {houseTypes.map((type) => (
              <label key={type} className="flex items-center cursor-pointer select-none text-[16px] font-medium font-sans flex-shrink-0">
                <span className={`w-7 h-7 flex items-center justify-center rounded-full border-2 mr-2 transition-all duration-150 ${houseType === type ? "border-[#FF4F12] bg-[#FF4F12]" : "border-gray-300 bg-white"}`}>
                  {houseType === type && (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5" fill="#fff" /></svg>
                  )}
                </span>
                <input type="radio" name="houseType" value={type} checked={houseType === type} onChange={() => setHouseType(type)} className="hidden" />
                <span className={`text-[16px] font-medium font-sans ${houseType === type ? "text-white" : "text-white/80"}`}>{type}</span>
              </label>
            ))}
          </div>
          {/* Поля и кнопка в один ряд */}
          <div className="flex flex-col md:flex-row gap-4 items-end w-full">
            {/* Телефон */}
            <div className="w-full md:flex-1">
              <label className="text-[14px] font-medium font-sans mb-1 text-white text-left">Введите телефон</label>
              <div className="flex flex-row items-center bg-white rounded-full overflow-hidden h-[44px]">
                <span className="bg-gray-100 text-gray-500 px-3 h-full flex items-center font-semibold text-base rounded-l-full select-none">+7</span>
                <InputMask
                  mask="(999) 999-99-99"
                  value={phone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
                  className="flex-1 bg-transparent border-none px-2 py-2 text-base text-[#222] placeholder-[#bbb] outline-none focus:ring-2 focus:ring-orange-500 transition font-sans"
                  placeholder="(___) ___-__-__"
                  type="tel"
                  autoComplete="tel"
                />
              </div>
            </div>
            {/* Имя */}
            <div className="w-full md:flex-1">
              <label className="text-[14px] font-medium font-sans mb-1 text-white text-left">Введите имя</label>
              <input
                type="text"
                value={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                className="w-full rounded-full bg-white px-4 py-2 text-base text-[#222] placeholder-[#bbb] outline-none focus:ring-2 focus:ring-orange-500 transition h-[44px] font-sans"
                placeholder="Имя"
                autoComplete="name"
              />
            </div>
            {/* Кнопка */}
            <button
              type="submit"
              className={`w-full md:w-[200px] h-[44px] rounded-full px-6 text-[16px] font-medium font-sans transition ml-0 md:ml-4 ${isFormValid && !submitted && !isSubmitting ? "bg-[#FF4F12] text-white" : "bg-[#FFD6C2] text-white cursor-not-allowed"}`}
              disabled={!isFormValid || submitted || isSubmitting}
            >
              {submitted ? 'Отправлено!' : isSubmitting ? 'Отправляем...' : 'Жду звонка'}
            </button>
          </div>
          {/* Подпись под полем */}
          <div className="flex items-center gap-2 mt-3 justify-start">
            <span className="text-white text-[13px] font-normal font-sans">Перезвоним в течение 15 минут</span>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          {/* Юридическая строка */}
          <p className="text-[12px] font-light font-sans mt-2 text-left text-[#D8B5FF]">Отправляя заявку, вы соглашаетесь с <a href="#" className="underline">политикой обработки персональных данных</a></p>
        </form>
      </>
    );
  }

  // step === 'support'
  return (
    <div className="flex flex-col gap-4 items-center animate-fade-in">
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2 w-full">
        {supportOptions.map((opt) => (
          <button key={opt} className={`px-7 py-3 rounded-full border-2 font-semibold text-base transition focus:outline-none flex-shrink-0 ${supportValue === opt ? "bg-[#ff4d06] border-[#ff4d06] text-white" : "border-white text-white bg-transparent"}`} onClick={() => setSupportValue(opt)}>{opt}</button>
        ))}
      </div>
      {supportValue && (
        <div className="bg-white/10 rounded-xl p-6 max-w-lg text-center">
          <h3 className="text-xl font-bold mb-2 text-white">Вы являетесь действующим абонентом Ростелеком</h3>
          <p className="mb-2 text-white/80">Мы не сможем ответить на вопросы по действующему подключению или сменить ваш текущий тариф.</p>
          <div className="mb-2">
            <span className="text-base text-white/80">Рекомендуем позвонить по номеру</span><br />
            <a href="tel:88001000800" className="text-2xl md:text-3xl font-bold text-white hover:underline">8 800 100-08-00</a>
            <div className="text-xs text-white/60">Звонок бесплатный по РФ</div>
          </div>
          <div className="text-base text-white/80">
            или узнать информацию в <a href="#" className="underline text-white">личном кабинете</a>
          </div>
        </div>
      )}
    </div>
  );
}

function getCityFromCookie() {
  if (typeof document === "undefined") return "в России";
  const match = document.cookie.match(/(?:^|; )user-city=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : "в России";
}

export default function HomePage() {
  const [visibleCount, setVisibleCount] = useState(6);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isConnectionModalOpen, setIsConnectionModalOpen] = useState(false);
  const [isCallRequestModalOpen, setIsCallRequestModalOpen] = useState(false);
  const [selectedTariff, setSelectedTariff] = useState(null);
  const [isSegmentationModalOpen, setIsSegmentationModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState("popular");
  const [activeCategory, setActiveCategory] = useState("all");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [filters, setFilters] = useState(defaultFilters);
  const { isSupportOnly } = useSupportOnly();
  const [city, setCity] = useState("в России");
  const [citySlug, setCitySlug]=useState('')

const router = useRouter();
  useEffect(() => {
    setCity(getCityFromCookie());
  }, []);



useEffect(()=>{
const slug = city
              .toLowerCase()
              .replace(/^(г\.|пгт|село|аул|деревня|поселок|ст-ца|п\.)\s*/i, "")
              .replace(/ё/g, "e")
              .replace(/\s+/g, "-")
              .replace(/[а-я]/g, (c: string) => {
                const map: Record<string, string> = {
                  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ж: "zh", з: "z", и: "i", й: "i",
                  к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f",
                  х: "h", ц: "c", ч: "ch", ш: "sh", щ: "sch", ы: "y", э: "e", ю: "yu", я: "ya"
                };
                return map[c] || "";
              })
              .replace(/[^a-z0-9-]/g, "");
              setCitySlug(slug)
},[city])

 useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const geo = await geoRes.json();
          const cityName = geo.address?.city || geo.address?.town || geo.address?.village;

          console.log("Определен город по координатам:", cityName);

          if (cityName) {
            const slug = cityName
              .toLowerCase()
              .replace(/^(г\.|пгт|село|аул|деревня|поселок|ст-ца|п\.)\s*/i, "")
              .replace(/ё/g, "e")
              .replace(/\s+/g, "-")
              .replace(/[а-я]/g, (c: string) => {
                const map: Record<string, string> = {
                  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ж: "zh", з: "z", и: "i", й: "i",
                  к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f",
                  х: "h", ц: "c", ч: "ch", ш: "sh", щ: "sch", ы: "y", э: "e", ю: "yu", я: "ya"
                };
                return map[c] || "";
              })
              .replace(/[^a-z0-9-]/g, "");

            console.log("Слаг города:", slug);

            // получить список файлов из API
            const res = await fetch("/api/available-cities");
            const available = await res.json();

            if (available.includes(slug)) {
              console.log(`Редирект на /${slug}`);
              router.push(`/${slug}`);
            } else {
              console.log(`Город ${slug} не найден среди обслуживаемых`);
            }
          } else {
            console.log("Город по координатам не определен");
          }
        } catch (err) {
          console.log("Ошибка при определении гео:", err);
        }
      },
      (error) => {
        console.log("Ошибка геолокации", error);
      }
    );
  }, [router]);














  // Мемоизированная фильтрация и сортировка тарифов
  const filteredTariffs = React.useMemo(() => {
    let filtered = tariffsData;
    const isDefaultPrice = filters.priceRange[0] === 300 && filters.priceRange[1] === 1700;
    const isDefaultSpeed = filters.speedRange[0] === 50 && filters.speedRange[1] === 1000;
    const hasActiveFilters = filters.internet || filters.tv || filters.mobile || filters.onlineCinema || filters.gameBonuses;

    if (
      activeCategory !== "all" ||
      hasActiveFilters ||
      !isDefaultPrice ||
      !isDefaultSpeed ||
      filters.promotions ||
      filters.hitsOnly
    ) {
      filtered = tariffsData.filter(tariff => {
        // Фильтр по категориям (быстрый фильтр)
        let categoryMatch = true;
        if (activeCategory !== "all") {
          categoryMatch = isTariffInCategory(tariff, activeCategory);
        }

        // Фильтр по боковым фильтрам (только для категории "Все")
        let sidebarMatch = true;
        if (activeCategory === "all" && hasActiveFilters) {
          sidebarMatch = 
            (filters.internet && tariff.type.includes("Интернет")) ||
            (filters.tv && tariff.type.includes("ТВ")) ||
            (filters.mobile && tariff.type.includes("Моб. связь")) ||
            (filters.onlineCinema && tariff.features.some(f => f.includes("Wink"))) ||
            (filters.gameBonuses && tariff.features.some(f => f.includes("Игровой") || f.includes("Бонусы в играх")));
        }
        
        // Фильтр по акциям
        const promoMatch = !filters.promotions || 
          tariff.discountPrice !== undefined || 
          tariff.name.toLowerCase().includes('тест-драйв');
        
        // Фильтр по хитам
        const hitsMatch = !filters.hitsOnly || tariff.isHit;
        
        // Фильтр по цене (ВСЕГДА используем базовую цену)
        const basePrice = tariff.price;
        const priceMatch = basePrice >= filters.priceRange[0] && basePrice <= filters.priceRange[1];
        
        // Фильтр по скорости
        const speedMatch = tariff.speed >= filters.speedRange[0] && tariff.speed <= filters.speedRange[1];
        
        return categoryMatch && sidebarMatch && promoMatch && hitsMatch && priceMatch && speedMatch;
      });
    }

    // Сортировка
    switch (sortBy) {
      case "speed":
        filtered = [...filtered].sort((a, b) => b.speed - a.speed);
        break;
      case "price-low":
        filtered = [...filtered].sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered = [...filtered].sort((a, b) => b.price - a.price);
        break;
      default: // popular
        filtered = [...filtered].sort((a, b) => {
          if (a.isHit && !b.isHit) return -1;
          if (!a.isHit && b.isHit) return 1;
          if (a.isHit === b.isHit) return b.speed - a.speed;
          return 0;
        });
    }
    return filtered;
  }, [filters, activeCategory, sortBy]);

  // Категории для быстрого фильтра
  const categories = [
    { id: "all", label: "Все", count: tariffsData.length },
    { id: "internet", label: "Интернет", count: tariffsData.filter(t => t.type === "Интернет").length },
    { id: "internet-tv", label: "Интернет + ТВ", count: tariffsData.filter(t => t.type === "Интернет + ТВ").length },
    { id: "internet-mobile", label: "Интернет + Моб. связь", count: tariffsData.filter(t => t.type === "Интернет + Моб. связь").length },
    { id: "internet-tv-mobile", label: "Интернет + ТВ + Моб. связь", count: tariffsData.filter(t => {
      const hasInternet = t.speed > 0;
      const hasTV = (t.tvChannels || 0) > 0;
      const hasMobile = (t.mobileData || 0) > 0 || (t.mobileMinutes || 0) > 0;
      
      // Основной критерий - наличие всех трех услуг
      if (hasInternet && hasTV && hasMobile) return true;
      
      // Резервный критерий - только для тарифов с типом "Интернет + ТВ + Моб. связь"
      if (t.type === "Интернет + ТВ + Моб. связь") {
        const categoryKeywords = ['выгоды', 'семейный', 'игровой', 'комбинированный', 'тест-драйв'];
        if (categoryKeywords.some(keyword => t.name.toLowerCase().includes(keyword))) {
          return true;
        }
      }
      
      return false;
    }).length }
  ];

  const mapFiltersToCategory = (f: any) => {
    if (f.internet && f.tv && f.mobile) return "internet-tv-mobile";
    if (f.internet && f.tv && !f.mobile) return "internet-tv";
    if (f.internet && !f.tv && f.mobile) return "internet-mobile";
    if (f.internet && !f.tv && !f.mobile) return "internet";
    return "all";
  };

  const handleTariffClick = (tariff: any) => {
    setSelectedTariff(tariff);
    setIsSegmentationModalOpen(true);
  };

  const handleFilterChange = (newFilters: Partial<typeof defaultFilters>) => {
    setFilters(prev => {
      const updated = { ...prev, ...newFilters };
      const cat = mapFiltersToCategory(updated);
      setActiveCategory(cat);
      return updated;
    });
  };

  const resetFilters = useCallback(() => {
    setActiveCategory("all");
    setFilters(defaultFilters);
  }, []);

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    
    if (categoryId === "all") {
      // При выборе "Все" сбрасываем боковые фильтры
      setFilters(prev => ({
        ...prev,
        internet: false,
        tv: false,
        mobile: false,
        onlineCinema: false,
        gameBonuses: false
      }));
    } else {
      // Для других категорий применяем соответствующие фильтры
      const serviceFilters = getServiceFiltersForCategory(categoryId);
      
      setFilters(prev => ({
        ...prev,
        ...serviceFilters,
      }));
    }
  };

  const handleMobileFiltersApply = () => {
    setIsMobileFiltersOpen(false);
    // Фильтры уже применены через handleFilterChange
  };

  // Функция прокрутки к блоку тарифов
  const scrollToTariffs = () => {
    const tariffsSection = document.getElementById('tariffs-section');
    if (tariffsSection) {
      tariffsSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  // Обработчик клика по категории в футере
  const handleFooterCategoryClick = (categoryId: string) => {
    handleCategoryChange(categoryId);
    // Небольшая задержка для применения фильтров перед прокруткой
    setTimeout(() => {
      scrollToTariffs();
    }, 100);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <HeroAddressSearch />

      <main className="flex-grow container py-8">

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Блок фильтров - только на десктопе */}
          <aside className="hidden lg:block lg:w-1/4 order-2 lg:order-1">
            <div className="card sticky top-4">
              <h3 className="text-lg font-bold mb-6">Фильтры</h3>
              
              {/* Услуги */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3">Услуги</h4>
                <div className="space-y-3">
                  {[
                    { key: 'internet', label: 'Интернет' },
                    { key: 'tv', label: 'ТВ' },
                    { key: 'mobile', label: 'Мобильная связь' },
                    { key: 'onlineCinema', label: 'Онлайн-кинотеатры' },
                    { key: 'gameBonuses', label: 'Игровые бонусы' }
                  ].map(item => (
                    <label key={item.key} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters[item.key as keyof typeof filters] as boolean}
                        onChange={() => handleFilterChange({ [item.key]: !filters[item.key as keyof typeof filters] })}
                        className="checkbox-custom mr-3"
                      />
                      <span className="text-sm">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Спецпредложения */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3">Спецпредложения</h4>
                <div className="space-y-3">
                  {[
                    { key: 'promotions', label: '% Акции' },
                    { key: 'hitsOnly', label: 'Только хиты' }
                  ].map(item => (
                    <label key={item.key} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters[item.key as keyof typeof filters] as boolean}
                        onChange={() => handleFilterChange({ [item.key]: !filters[item.key as keyof typeof filters] })}
                        className="checkbox-custom mr-3"
                      />
                      <span className="text-sm">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Стоимость */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3">Стоимость в месяц (₽)</h4>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>{filters.priceRange[0]}</span>
                  <span>{filters.priceRange[1]}</span>
                </div>
                <Slider
                  range
                  min={300}
                  max={1700}
                  value={filters.priceRange}
                  onChange={(value) => Array.isArray(value) && handleFilterChange({ priceRange: value })}
                  trackStyle={[{ backgroundColor: '#FF6600' }]}
                  handleStyle={[{ borderColor: '#FF6600', backgroundColor: '#FF6600' }, { borderColor: '#FF6600', backgroundColor: '#FF6600' }]}
                  railStyle={{ backgroundColor: '#eee' }}
                />
              </div>
              
              {/* Скорость */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3">Скорость (Мбит/с)</h4>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>{filters.speedRange[0]}</span>
                  <span>{filters.speedRange[1]}</span>
                </div>
                <Slider
                  range
                  min={50}
                  max={1000}
                  value={filters.speedRange}
                  onChange={(value) => Array.isArray(value) && handleFilterChange({ speedRange: value })}
                  trackStyle={[{ backgroundColor: '#FF6600' }]}
                  handleStyle={[{ borderColor: '#FF6600', backgroundColor: '#FF6600' }, { borderColor: '#FF6600', backgroundColor: '#FF6600' }]}
                  railStyle={{ backgroundColor: '#eee' }}
                />
              </div>
            </div>
          </aside>
          
          {/* Блок тарифов */}
          <div id="tariffs-section" className="lg:w-3/4 order-1 lg:order-2">
            {/* Быстрые фильтры по категориям */}
            <div className="mb-6 -mx-4 lg:mx-0">
              <div
                className="
                  flex gap-3 items-center px-4
                  overflow-x-auto scroll-smooth whitespace-nowrap
                  lg:flex-wrap lg:overflow-visible lg:whitespace-normal
                "
              >
                   
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.id)}
                    className={`
                      px-4 py-2 rounded-full text-sm font-medium transition
                      ${activeCategory === category.id
                        ? 'bg-rt-cta text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                    `}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold">
                Доступные тарифы 
                <span className="text-lg font-normal text-gray-600 ml-2">
                  ({filteredTariffs.length})
                </span>
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Сортировка:</span>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                  }}
                  className="form-input py-2 text-sm min-w-[140px]"
                >
                  <option value="popular">Популярные</option>
                  <option value="speed">Быстрые</option>
                  <option value="price-low">Подешевле</option>
                  <option value="price-high">Подороже</option>
                </select>
                <span
                  role="button"
                  tabIndex={0}
                  onClick={() => setIsMobileFiltersOpen(true)}
                  onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setIsMobileFiltersOpen(true)}
                  className="lg:hidden inline-flex items-center gap-1 text-sm font-medium text-rt-cta active:opacity-60"
                >
                  <FiFilter size={16} />
                  Все фильтры
                </span>
              </div>
            </div>
            
            {filteredTariffs.length > 0 ? (
              <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredTariffs.slice(0, visibleCount).map((tariff) => (
                  <TariffCard
                    key={tariff.id}
                    tariff={tariff}
                    onClick={() => handleTariffClick(tariff)}
                  />
                ))}
              </div>
              {visibleCount < filteredTariffs.length && (
                <div className="text-center mt-6">
                  <button className="btn-secondary" onClick={() => setVisibleCount(prev => Math.min(prev + 5, filteredTariffs.length))}>Показать ещё</button>
                </div>
              )}
              </>
            ) : (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">Тарифы не найдены</h3>
                <p className="text-gray-600 mb-6">Попробуйте изменить параметры фильтрации</p>
                <button 
                  onClick={() => {
                    setActiveCategory("all");
                    setFilters(defaultFilters);
                  }}
                  className="btn-secondary"
                >
                  Сбросить фильтры
                </button>
              </div>
            )}
            
            {/* Блок подбора с экспертом */}
            <section className="mt-12 rounded-3xl bg-[#7000FF] p-6 md:p-12 text-white flex flex-col items-center justify-center max-w-3xl mx-auto shadow-lg">
              <div className="w-full flex flex-col gap-2 md:gap-4">
                <h2 className="text-[28px] leading-[1.05] font-bold font-sans mb-2 md:mb-3 text-left text-white">Хотите быстро найти самый выгодный тариф?</h2>
                <p className="text-[18px] leading-[1.2] font-normal font-sans mb-4 md:mb-6 text-left max-w-xl text-white">Подберите тариф с экспертом. Найдём для вас лучшее решение с учетом ваших пожеланий</p>
                <SupportOnlyBlock>
                  <TariffHelpForm />
                </SupportOnlyBlock>
              </div>
            </section>
          </div>
        </div>
      </main>
      <HowConnect onOpenSegmentationModal={() => setIsSegmentationModalOpen(true)} />
      <Bonuses />
      <PromoSlider onOpenSegmentationModal={() => setIsSegmentationModalOpen(true)} />
      <InfoBlockKrasnodar />
      <EquipmentBlock />
      <FaqBlock />
      <SupportOnlyBlock isQuestionsBlock={true}>
        <QuestionsBlock />
      </SupportOnlyBlock>
      <Footer cityName={citySlug} />
      
      
      {/* Модальные окна */}
      <SegmentationModal
        isOpen={isSegmentationModalOpen}
        onClose={() => setIsSegmentationModalOpen(false)}
        onNewConnection={() => setIsConnectionModalOpen(true)}
        onExistingConnection={() => setIsConnectionModalOpen(true)}
      />
      <ContactModal 
        isOpen={isContactModalOpen} 
        onClose={() => setIsContactModalOpen(false)} 
      />
      <ConnectionForm
        isOpen={isConnectionModalOpen}
        onClose={() => setIsConnectionModalOpen(false)}
      />
      <CallRequestModal
        isOpen={isCallRequestModalOpen}
        onClose={() => setIsCallRequestModalOpen(false)}
      />
      <MobileFiltersDrawer
        open={isMobileFiltersOpen}
        onClose={() => setIsMobileFiltersOpen(false)}
        filters={filters}
        onFiltersChange={handleFilterChange}
        onApply={handleMobileFiltersApply}
        onClear={resetFilters}
      />
    </div>
  );
}
