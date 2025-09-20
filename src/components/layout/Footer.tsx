import Link from "next/link";
import Logo from '@/components/ui/Logo';
import { useSupportOnly } from '@/context/SupportOnlyContext';

export default function Footer({ cityName }: { cityName: string }) {
  let isSupportOnly = false;
  try {
    const context = useSupportOnly();
    isSupportOnly = context?.isSupportOnly || false;
  } catch (error) {
    isSupportOnly = false;
  }
function getPrefixedHref(cityName: string | undefined, path: string) {
return cityName ? `/${cityName}${path}` : path;
}
  return (
    <footer className="bg-[#f8f8f8] text-[#0F191E] text-sm">
      <div className="container mx-auto px-4 py-10">
        {/* Верхняя часть */}
        <div className="flex flex-col md:flex-row justify-between gap-12">
          {/* Логотип */}
          <div className="flex-shrink-0 mb-6">
            <Logo href="/krasnodar/" />
          </div>

          {/* Меню */}
          <div className="flex flex-col md:flex-row gap-12 flex-grow justify-between">
            {/* Колонка 1 */}
            <div className="space-y-2">
              <a href="https://lk.rt.ru/" target="_blank" rel="noopener noreferrer" className="hover:underline block">
                Личный кабинет
              </a>
              <Link href="/cities" className="hover:underline block">
                Все города
              </Link>
              {/* Ссылка "Контакты" скрыта при режиме поддержки */}
              {!isSupportOnly && (
                <Link href={getPrefixedHref(cityName, "/contacts")} className="hover:underline block">
                  Контакты
                </Link>
              )}
            </div>

            {/* Колонка 2 */}
            <div>
              <p className="font-bold mb-2">Тарифы</p>
              <ul className="space-y-2">
                <li>
                  <Link href={getPrefixedHref(cityName, "/internet")} className="text-left block hover:underline">Интернет</Link>
                </li>
                <li>
                  <Link href={getPrefixedHref(cityName, "/internet-tv")} className="text-left block hover:underline">Интернет + ТВ</Link>
                </li>
                <li>
                  <Link href={getPrefixedHref(cityName, "/internet-mobile")} className="text-left block hover:underline">Интернет + Моб. связь</Link>
                </li>
                <li>
                  <Link href={getPrefixedHref(cityName, "/internet-tv-mobile")} className="text-left block hover:underline">Интернет + ТВ + Моб. связь</Link>
                </li>
              </ul>
            </div>

            {/* Колонка 3 */}
            <div>
              <Link href={getPrefixedHref(cityName, "/check")} className="font-bold hover:underline block mb-2">
                Проверка Ростелеком по адресу
              </Link>
              {/* Ссылка "Оставить заявку" скрыта при режиме поддержки */}
              {!isSupportOnly && (
                <Link href={getPrefixedHref(cityName, "/order")}className="font-bold hover:underline block">
                  Оставить заявку на подключение Ростелеком
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Низ футера */}
        <div className="mt-10 border-t border-gray-300 pt-6 text-[#666] text-xs">
          <p className="mb-2">
            © 2025 Сайт не является средством массовой информации и действует на
            основании партнёрского договора с Ростелеком.
          </p>
          <Link href={getPrefixedHref(cityName, "/policy")} className="hover:underline">
            Политика обработки персональных данных
          </Link>
        </div>
      </div>
    </footer>
  );
}
