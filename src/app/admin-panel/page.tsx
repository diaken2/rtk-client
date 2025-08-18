'use client'

import { useEffect, useState, ChangeEvent, FormEvent } from 'react'
import * as XLSX from 'xlsx'
import axios from 'axios'

interface ExcelHeader {
  key: string
  label: string
}

interface City {
  slug: string
  name: string
}

interface Tariff {
  id: number
  name: string
  type: string
  speed: number
  technology: string
  price: number
  discountPrice: number
  discountPeriod: string
  discountPercentage: number
  tvChannels?: number
  mobileData?: number
  mobileMinutes?: number
  buttonColor: string
  isHit: boolean
  features: string[]
  hidden?: boolean
  [key: string]: any
}

interface Service {
  id: string
  title: string
  description: string
  meta: {
    description: string
    keywords: string[]
    ogImage: string
  }
  tariffs: Tariff[]
}

interface CityData {
  slug: string
  meta: {
    name: string
    region: string
    timezone: string
  }
  services: {
    [key: string]: Service
  }
}

interface LoginData {
  login: string
  password: string
}

const excelHeaders: ExcelHeader[] = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Название тарифа' },
  { key: 'type', label: 'Тип' },
  { key: 'speed', label: 'Скорость' },
  { key: 'technology', label: 'Технология' },
  { key: 'price', label: 'Цена' },
  { key: 'discountPrice', label: 'Цена со скидкой' },
  { key: 'discountPeriod', label: 'Период скидки' },
  { key: 'discountPercentage', label: 'Процент скидки' },
  { key: 'tvChannels', label: 'Количество ТВ каналов' },
  { key: 'mobileData', label: 'Мобильные данные' },
  { key: 'mobileMinutes', label: 'Мобильные минуты' },
  { key: 'buttonColor', label: 'Цвет кнопки' },
  { key: 'isHit', label: 'Хит' },
  { key: 'features', label: 'Особенности' },
]

export default function AdminPanel() {
  const [cities, setCities] = useState<City[]>([])
  const [selectedCity, setSelectedCity] = useState<string>('')
  const [selectedService, setSelectedService] = useState<string>('')
  const [tariffs, setTariffs] = useState<Tariff[]>([])
  const [allData, setAllData] = useState<CityData[]>([])
  const [loadingCities, setLoadingCities] = useState<boolean>(true)
  const [successMessage, setSuccessMessage] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [citySearch, setCitySearch] = useState<string>('')
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)
  const [loginData, setLoginData] = useState<LoginData>({ login: '', password: '' })
  const [loginError, setLoginError] = useState<string>('')
  const [selectedTariffs, setSelectedTariffs] = useState<Set<number>>(new Set())
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<Partial<Tariff>>({})

  useEffect(() => {
    const savedAuth = localStorage.getItem('rtk_admin_auth')
    if (savedAuth === 'simple-auth-token') {
      setIsLoggedIn(true)
    }
  }, [])

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    try {
      const response = await axios.post('https://rtk-backend-4m0e.onrender.com/api/login', loginData)
      
      if (response.data.success) {
        setIsLoggedIn(true)
        localStorage.setItem('rtk_admin_auth', response.data.token)
      } else {
        setLoginError("Неверный логин или пароль")
      }
    } catch (error) {
      setLoginError("Ошибка при входе")
    }
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    localStorage.removeItem('rtk_admin_auth')
  }

  const handleCheckboxChange = (id: number) => {
    setSelectedTariffs((prev) => {
      const updated = new Set(prev)
      if (updated.has(id)) {
        updated.delete(id)
      } else {
        updated.add(id)
      }
      return updated
    })
  }

  const handleMassDelete = async () => {
    if (selectedTariffs.size === 0) {
      setErrorMessage('Выберите хотя бы один тариф для удаления.')
      setTimeout(() => setErrorMessage(''), 4000)
      return
    }

    try {
      const tariffIds = Array.from(selectedTariffs).map(id => String(id))

      await axios.delete('https://rtk-backend-4m0e.onrender.com/api/tariffs/mass-delete', {
        data: {
          city: selectedCity,
          service: selectedService,
          tariffs: tariffIds
        }
      })

      const response = await axios.get('https://rtk-backend-4m0e.onrender.com/api/tariffs-full')
      setAllData(response.data)
      setSelectedTariffs(new Set())
      showMessage('🗑️ Выбранные тарифы удалены')
    } catch (error) {
      console.error('Ошибка при массовом удалении:', error)
      setErrorMessage('❌ Ошибка при удалении тарифов')
      setTimeout(() => setErrorMessage(''), 4000)
    }
  }

  const showMessage = (msg: string) => {
    setSuccessMessage(msg)
    setTimeout(() => setSuccessMessage(''), 4000)
  }

  const filteredCities = cities.filter(city =>
    city.name.toLowerCase().includes(citySearch.toLowerCase())
  )

  useEffect(() => {
    setLoadingCities(true)
    axios.get('https://rtk-backend-4m0e.onrender.com/api/tariffs-full').then(res => {
      setAllData(res.data)
      const cityList = res.data.map((c: CityData) => ({
        slug: c.slug,
        name: c.meta?.name || c.slug
      }))
      setCities(cityList)
    }).finally(() => {
      setLoadingCities(false)
    })
  }, [])

  useEffect(() => {
    if (selectedCity && selectedService) {
      const found = allData.find((c: CityData) => c.slug === selectedCity)
      const list = found?.services?.[selectedService]?.tariffs || []
      setTariffs(list)
    } else {
      setTariffs([])
    }
  }, [selectedCity, selectedService, allData])

  const startEditing = (t: Tariff) => {
    setEditingId(t.id)
    setEditForm({ ...t })
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditForm({})
  }

  const handleEditChange = (key: string, value: any) => {
    setEditForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleUpdateTariff = async (id: number) => {
    if (!selectedCity || !selectedService) return
    try {
      await axios.put(`https://rtk-backend-4m0e.onrender.com/api/tariffs/${selectedCity}/${selectedService}/${id}`, editForm)
      const response = await axios.get(`https://rtk-backend-4m0e.onrender.com/api/tariffs-full`)
      setAllData(response.data)
      cancelEditing()
      showMessage('✅ Тариф успешно обновлён')
    } catch (e) {
      setErrorMessage('❌ Ошибка при обновлении тарифа')
      setTimeout(() => setErrorMessage(''), 4000)
    }
  }

  const handleMassHide = async (hidden: boolean) => {
    if (selectedTariffs.size === 0) {
      setErrorMessage('Выберите хотя бы один тариф')
      setTimeout(() => setErrorMessage(''), 4000)
      return
    }

    try {
      const tariffIds = Array.from(selectedTariffs).map(id => String(id))

      await axios.patch('https://rtk-backend-4m0e.onrender.com/api/tariffs/mass-hide', {
        city: selectedCity,
        service: selectedService,
        tariffs: tariffIds,
        hidden
      })

      const response = await axios.get('https://rtk-backend-4m0e.onrender.com/api/tariffs-full')
      setAllData(response.data)
      showMessage(hidden ? '🙈 Тарифы скрыты' : '👁️ Тарифы показаны')
    } catch (error) {
      console.error('Ошибка при массовом скрытии:', error)
      setErrorMessage('❌ Ошибка при обновлении тарифов')
      setTimeout(() => setErrorMessage(''), 4000)
    }
  }

  const handleDelete = async (id: number) => {
    if (!selectedCity || !selectedService) return
    try {
      await axios.delete(`https://rtk-backend-4m0e.onrender.com/api/tariffs/${selectedCity}/${selectedService}/${id}`)
      const response = await axios.get('https://rtk-backend-4m0e.onrender.com/api/tariffs-full')
      setAllData(response.data)
      showMessage('🗑️ Тариф удалён')
    } catch (e) {
      setErrorMessage('❌ Не удалось удалить тариф')
      setTimeout(() => setErrorMessage(''), 4000)
    }
  }

  const handleAddTariff = async () => {
    const newTariff: Tariff = {
      id: Math.floor(Math.random() * 1000000),
      name: 'Новый тариф',
      type: 'Интернет',
      price: 500,
      speed: 100,
      technology: '',
      discountPrice: 0,
      discountPeriod: '',
      discountPercentage: 0,
      buttonColor: 'orange',
      isHit: false,
      features: [],
      tvChannels: 0,
      mobileData: 0,
      mobileMinutes: 0
    }
    
    await axios.post(`https://rtk-backend-4m0e.onrender.com/api/tariffs/${selectedCity}/${selectedService}`, newTariff)
    setAllData((prev) =>
      prev.map((c) =>
        c.slug !== selectedCity
          ? c
          : {
              ...c,
              services: {
                ...c.services,
                [selectedService]: {
                  ...c.services[selectedService],
                  tariffs: [...(c.services[selectedService]?.tariffs || []), newTariff],
                },
              },
            }
      )
    )
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded shadow-md w-96">
          <h2 className="text-2xl font-bold mb-6 text-center">Вход в админку</h2>
          {loginError && <div className="mb-4 text-red-500">{loginError}</div>}
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block mb-2">Логин:</label>
              <input
                type="text"
                value={loginData.login}
                onChange={(e: ChangeEvent<HTMLInputElement>) => 
                  setLoginData({...loginData, login: e.target.value})
                }
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mb-6">
              <label className="block mb-2">Пароль:</label>
              <input
                type="password"
                value={loginData.password}
                onChange={(e: ChangeEvent<HTMLInputElement>) => 
                  setLoginData({...loginData, password: e.target.value})
                }
                className="w-full p-2 border rounded"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            >
              Войти
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Хедер */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Админ-панель управления тарифами</h1>
        <p className="text-gray-600">Ростелеком - управление тарифными планами</p>
        <div className="flex justify-end p-4">
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Выйти
          </button>
        </div>
      </div>
 
      {/* Уведомления */}
      <div className="space-y-2 mb-6">
        {successMessage && (
          <div className="p-3 bg-green-100 border border-green-300 text-green-700 rounded-lg flex items-center">
            <span className="mr-2">✓</span>
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg flex items-center">
            <span className="mr-2">✕</span>
            {errorMessage}
          </div>
        )}
      </div>

      {/* Фильтры */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Поиск города */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Поиск города</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Введите название города..."
                value={citySearch}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setCitySearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
              <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
            </div>
          </div>

          {/* Выбор города */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Город</label>
            <select
              value={selectedCity}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedCity(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">Выберите город</option>
              {filteredCities.map(({ slug, name }) => (
                <option key={slug} value={slug}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* Выбор сервиса */}
          {selectedCity && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Услуга</label>
              <select
                value={selectedService}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedService(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">Выберите услугу</option>
                {Object.keys(
                  allData.find((c: CityData) => c.slug === selectedCity)?.services || {}
                ).map((service) => (
                  <option key={service} value={service}>
                    {service}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Панель действий */}
      {selectedService && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Тарифы для {selectedCity} / {selectedService}
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({tariffs.length} шт.)
              </span>
            </h3>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleAddTariff}
                className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                <span className="mr-1">+</span> Добавить тариф
              </button>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleMassHide(true)}
                  className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors"
                >
                  Скрыть выбранные
                </button>
                <button
                  onClick={() => handleMassHide(false)}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                >
                  Показать выбранные
                </button>
                <button
                  onClick={handleMassDelete}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                >
                  Удалить выбранные
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Таблица тарифов */}
      {selectedService && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {tariffs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                          setSelectedTariffs(
                            e.target.checked
                              ? new Set(tariffs.map((t) => t.id))
                              : new Set()
                          )
                        }}
                        checked={selectedTariffs.size === tariffs.length}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                    </th>
                    {excelHeaders.map(({ key, label }) => (
                      <th
                        key={key}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {label}
                      </th>
                    ))}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tariffs.map((t: Tariff) => (
                    <tr key={t.id} className={t.hidden ? 'bg-gray-50 opacity-80' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedTariffs.has(t.id)}
                          onChange={() => handleCheckboxChange(t.id)}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                      </td>
                      {excelHeaders.map(({ key }) => (
                        <td key={key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {editingId === t.id ? (
                            <input
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500"
                              value={
                                editForm[key] !== undefined
                                  ? Array.isArray(editForm[key])
                                    ? editForm[key].join('; ')
                                    : String(editForm[key])
                                  : ''
                              }
                              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                handleEditChange(
                                  key,
                                  Array.isArray(t[key])
                                    ? e.target.value.split(';').map((item) => item.trim())
                                    : typeof t[key] === 'number'
                                    ? +e.target.value
                                    : e.target.value
                                )
                              }
                            />
                          ) : Array.isArray(t[key]) ? (
                            t[key].join(', ')
                          ) : t[key] !== undefined ? (
                            String(t[key])
                          ) : (
                            ''
                          )}
                        </td>
                      ))}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {editingId === t.id ? (
                            <>
                              <button
                                onClick={() => handleUpdateTariff(t.id)}
                                className="text-green-600 hover:text-green-900"
                              >
                                Сохранить
                              </button>
                              <button
                                onClick={cancelEditing}
                                className="text-gray-600 hover:text-gray-900"
                              >
                                Отмена
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEditing(t)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Редактировать
                              </button>
                              <button
                                onClick={() => handleDelete(t.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Удалить
                              </button>
                              <button
                                onClick={async () => {
                                  try {
                                    await axios.patch(
                                      `https://rtk-backend-4m0e.onrender.com/api/tariffs/${selectedCity}/${selectedService}/${t.id}/hide`,
                                      {
                                        hidden: !t.hidden,
                                      }
                                    )
                                    const res = await axios.get('https://rtk-backend-4m0e.onrender.com/api/tariffs-full')
                                    setAllData(res.data)
                                    showMessage(t.hidden ? '👁️ Тариф снова отображается' : '🙈 Тариф скрыт')
                                  } catch {
                                    setErrorMessage('❌ Не удалось изменить видимость тарифа')
                                    setTimeout(() => setErrorMessage(''), 4000)
                                  }
                                }}
                                className={`${t.hidden ? 'text-gray-400' : 'text-yellow-600'} hover:text-yellow-800`}
                              >
                                {t.hidden ? 'Показать' : 'Скрыть'}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              Нет тарифов для отображения
            </div>
          )}
        </div>
      )}

      {/* Импорт из Excel */}
      <ExcelUploader />
    </div>
  )
}

function ExcelUploader() {
  const [successMessage, setSuccessMessage] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string>('')

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data)
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' })

      const grouped: Record<string, any> = {}

      for (const row of rows as any[]) {
        const city = row['Город']?.trim() || 'неизвестно'
        const region = row['Регион']?.trim() || ''
        const category = (row['Категория'] || 'internet').trim()

        if (!grouped[city]) {
          grouped[city] = {
            meta: {
              name: city,
              region,
              timezone: 'Europe/Moscow'
            },
            services: {}
          }
        }

        if (!grouped[city].services[category]) {
          grouped[city].services[category] = {
            id: category,
            title: category,
            description: `Тарифы на ${category}`,
            meta: {
              description: `Тарифы на ${category}`,
              keywords: [category],
              ogImage: '/og/default.jpg'
            },
            tariffs: []
          }
        }

        const features = row['Особенности (через ;)']
          ? row['Особенности (через ;)'].split(';').map((f: string) => f.trim()).filter((f: string) => f)
          : []

        const tariff = {
          id: Math.floor(Math.random() * 100000),
          name: row['Название тарифа'] || '',
          type: row['Тип'] || '',
          speed: parseInt(row['Скорость']) || 0,
          technology: row['Технология'] || '',
          price: parseInt(row['Цена']) || 0,
          discountPrice: parseInt(row['Цена со скидкой']) || 0,
          discountPeriod: row['Период скидки'] || '',
          discountPercentage: Math.round(
            typeof row['Процент скидки'] === 'string'
              ? parseFloat(row['Процент скидки'].replace('%', '').trim())
              : (parseFloat(row['Процент скидки']) * 100)
          ) || 0,
          tvChannels: parseInt(row['Количество ТВ каналов']) || undefined,
          mobileData: parseInt(row['Мобильные данные']) || undefined,
          mobileMinutes: parseInt(row['Мобильные минуты']) || undefined,
          buttonColor: (row['Цвет кнопки'] || '').toLowerCase() || 'orange',
          isHit: row['Признак хита']?.toLowerCase() === 'да',
          features
        }

        grouped[city].services[category].tariffs.push(tariff)
      }

      await axios.post('https://rtk-backend-4m0e.onrender.com/api/upload-tariffs', grouped)

      setSuccessMessage('✅ Тарифы успешно загружены')
      setErrorMessage('')

      setTimeout(() => setSuccessMessage(''), 5000)
    } catch (error) {
      console.error(error)
      setErrorMessage('❌ Ошибка при загрузке тарифов')
      setSuccessMessage('')
      setTimeout(() => setErrorMessage(''), 5000)
    }
  }

  return (
    <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Импорт тарифов из Excel</h3>
          <p className="text-sm text-gray-500">Загрузите файл Excel для массового обновления тарифов</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <label className="block">
            <span className="sr-only">Выберите файл Excel</span>
            <input 
              type="file" 
              onChange={handleFileUpload} 
              accept=".xlsx,.xls"
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-purple-50 file:text-purple-700
                hover:file:bg-purple-100"
            />
          </label>
        </div>
        
        {successMessage && (
          <div className="p-3 bg-green-100 border border-green-300 text-green-700 rounded-lg">
            {successMessage}
          </div>
        )}
        
        {errorMessage && (
          <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  )
}