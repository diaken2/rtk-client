// Скрипт генерации файлов городов для Ростелеком тарифов
// Запуск: node generate-cities.js

const fs = require('fs');
const path = require('path');
const { regions } = require('./src/components/blocks/regionsData');
const { tariffsData } = require('./src/components/tariff/tariffsData');

// Сопоставление типа тарифа с ключом услуги
const SERVICE_TYPE_MAP = {
  'Интернет': 'internet',
  'ТВ': 'tv',
  'Интернет + ТВ': 'internet-tv',
  'Интернет + Моб. связь': 'internet-mobile',
  'Интернет + ТВ + Моб. связь': 'internet-tv-mobile',
};

// Получить уникальные типы услуг
function getAllServiceTypes() {
  const types = new Set();
  tariffsData.forEach(t => types.add(t.type));
  return Array.from(types);
}

// Транслитерация для slug-файла
function slugify(str) {
  return str
    .replace(/^(г\.|пгт|ст-ца|с\.|рп|п\.|мкр\.|д\.|аул|тер\.|кп|пос\.|п\/ст|пгт|арбан|кп|село|поселок|п\-ст)\s*/i, '')
    .replace(/[ё]/gi, 'e')
    .replace(/[й]/gi, 'i')
    .replace(/[ц]/gi, 'ts')
    .replace(/[у]/gi, 'u')
    .replace(/[к]/gi, 'k')
    .replace(/[е]/gi, 'e')
    .replace(/[н]/gi, 'n')
    .replace(/[г]/gi, 'g')
    .replace(/[ш]/gi, 'sh')
    .replace(/[щ]/gi, 'sch')
    .replace(/[з]/gi, 'z')
    .replace(/[х]/gi, 'h')
    .replace(/[ъ]/gi, '')
    .replace(/[ф]/gi, 'f')
    .replace(/[ы]/gi, 'y')
    .replace(/[в]/gi, 'v')
    .replace(/[а]/gi, 'a')
    .replace(/[п]/gi, 'p')
    .replace(/[р]/gi, 'r')
    .replace(/[о]/gi, 'o')
    .replace(/[л]/gi, 'l')
    .replace(/[д]/gi, 'd')
    .replace(/[ж]/gi, 'zh')
    .replace(/[э]/gi, 'e')
    .replace(/[я]/gi, 'ya')
    .replace(/[ч]/gi, 'ch')
    .replace(/[с]/gi, 's')
    .replace(/[м]/gi, 'm')
    .replace(/[и]/gi, 'i')
    .replace(/[т]/gi, 't')
    .replace(/[ь]/gi, '')
    .replace(/[б]/gi, 'b')
    .replace(/[ю]/gi, 'yu')
    .replace(/[ъь]/gi, '')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

// Формируем meta-данные города
function getCityMeta(city, regionName) {
  return {
    name: city,
    region: regionName,
    timezone: 'Europe/Moscow', // Можно доработать для особых регионов
  };
}

// Группируем тарифы по типу услуги
function groupTariffsByService() {
  const services = {};
  tariffsData.forEach(tariff => {
    const key = SERVICE_TYPE_MAP[tariff.type] || slugify(tariff.type);
    if (!services[key]) {
      services[key] = {
        id: key,
        title: tariff.type,
        description: `Тарифы на ${tariff.type.toLowerCase()}`,
        meta: {
          description: `Тарифы на ${tariff.type.toLowerCase()}`,
          keywords: [tariff.type],
          ogImage: `/og/default.jpg`,
        },
        tariffs: [],
      };
    }
    services[key].tariffs.push(tariff);
  });
  return services;
}

function main() {
  const citiesDir = path.join(__dirname, 'data', 'cities');
  if (!fs.existsSync(citiesDir)) fs.mkdirSync(citiesDir, { recursive: true });

  const allServices = groupTariffsByService();
  let created = 0;

  regions.forEach(region => {
    region.areas.forEach(area => {
      area.cities.forEach(cityRaw => {
        const city = cityRaw.replace(/^\s+|\s+$/g, '');
        const slug = slugify(city);
        const filePath = path.join(citiesDir, `${slug}.json`);
        const cityData = {
          meta: getCityMeta(city, area.name),
          services: allServices,
        };
        fs.writeFileSync(filePath, JSON.stringify(cityData, null, 2), 'utf8');
        created++;
      });
    });
  });
  console.log(`Создано файлов: ${created}`);
}

main(); 