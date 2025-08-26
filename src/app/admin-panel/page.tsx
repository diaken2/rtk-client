'use client'

import { useEffect, useState, ChangeEvent, FormEvent, useRef } from 'react'
import * as XLSX from 'xlsx'
import axios from 'axios'

// Интерфейсы
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
  speed?: number
  technology?: string
  price: number
  discountPrice?: number
  discountPeriod?: string
  discountPercentage?: number
  connectionPrice?: number 
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
    ogImage?: string
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

// Константы
const API_DELAY_ESTIMATE = {
  fetch: 1500,
  update: 800,
  delete: 600,
  mass: 2000,
  import: 3000,
  login: 1000
}


// -------------------- УТИЛИТЫ ДЛЯ ПАРСИНГА --------------------
const toStr = (v: any): string => {
  if (v === undefined || v === null) return ''
  return String(v).trim()
}

const parseOptionalNumber = (v: any): number | undefined => {
  const s = toStr(v)
  if (s === '') return undefined
  // убираем пробелы, нецифры кроме точки и минуса, сохраняем %
  const cleaned = s.replace(/\s+/g,'').replace(',', '.').replace(/[^\d.\-]/g, '')
  if (cleaned === '') return undefined
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : undefined
}

const parseOptionalInt = (v: any): number | undefined => {
  const n = parseOptionalNumber(v)
  if (n === undefined) return undefined
  return Math.round(n)
}

const parseOptionalPercent = (v: any): number | undefined => {
  const s = toStr(v)
  if (s === '') return undefined
  // если есть %, просто взять число
  const withPercent = s.match(/(-?\d+(?:[.,]\d+)?)\s*%/)
  if (withPercent) return Math.round(Number(withPercent[1].replace(',', '.')))
  // иначе парсим число — если дробь <=1 считаем как долю
  const n = parseOptionalNumber(s)
  if (n === undefined) return undefined
  if (n <= 1) return Math.round(n * 100)
  return Math.round(n)
}

const IMPORT_CONFIG = {
  chunkSize: 1000, // Количество тарифов в одном чанке
  delayBetweenChunks: 1000, // Задержка между отправкой чанков (мс)
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
  { key: 'connectionPrice', label: 'Цена подключения' }, // ← ДОБАВЛЯЕМ
  { key: 'tvChannels', label: 'Количество ТВ каналов' },
  { key: 'mobileData', label: 'Мобильные данные' },
  { key: 'mobileMinutes', label: 'Мобильные минуты' },
  { key: 'buttonColor', label: 'Цвет кнопки' },
  { key: 'isHit', label: 'Хит' },
  { key: 'features', label: 'Особенности' }
]

// Компонент прогресс-бара
const LoadingProgress = ({ duration = 2000 }: { duration?: number }) => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const startTime = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const percent = Math.min(100, (elapsed / duration) * 100)
      setProgress(percent)
      if (percent >= 100) clearInterval(interval)
    }, 50)

    return () => clearInterval(interval)
  }, [duration])

  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div 
        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

// Компонент скелетона для строк таблицы
const SkeletonRow = ({ cols = excelHeaders.length + 2 }: { cols?: number }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
      </td>
    ))}
  </tr>
)

// Основной компонент админ-панели
export default function AdminPanel() {
  // Состояния
  const [loadingStates, setLoadingStates] = useState({
    cities: false,
    tariffs: false,
    updating: false,
    deleting: false,
    massOperation: false,
    loggingIn: false,
    importing: false
  })
  const [uploadProgress, setUploadProgress] = useState(0)
  const [cities, setCities] = useState<City[]>([])
  const [selectedCity, setSelectedCity] = useState<string>('')
  const [selectedService, setSelectedService] = useState<string>('')
  const [tariffs, setTariffs] = useState<Tariff[]>([])
  const [allData, setAllData] = useState<CityData[]>([])
  const [successMessage, setSuccessMessage] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [citySearch, setCitySearch] = useState<string>('')
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)
  const [loginData, setLoginData] = useState<LoginData>({ login: '', password: '' })
  const [loginError, setLoginError] = useState<string>('')
  const [selectedTariffs, setSelectedTariffs] = useState<Set<number>>(new Set())
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<Partial<Tariff>>({})
 const [importProgress, setImportProgress] = useState({
    current: 0,
    total: 0,
    processedCities: 0,
    totalCities: 0,
    status: 'idle' as 'idle' | 'processing' | 'completed' | 'error'
  })
  const [importResults, setImportResults] = useState<{
    success: number
    failed: number
    errors: string[]
  }>({
    success: 0,
    failed: 0,
    errors: []
  })
  
  const abortControllerRef = useRef<AbortController | null>(null)




  
  // Проверка авторизации при загрузке
  useEffect(() => {
    const savedAuth = localStorage.getItem('rtk_admin_auth')
    if (savedAuth === 'simple-auth-token') {
      setIsLoggedIn(true)
      fetchCities()
    }
  }, [])

  // Загрузка городов
  const fetchCities = async () => {
    setLoadingStates(prev => ({...prev, cities: true}))
    try {
      const response = await axios.get('https://rtk-backend-4m0e.onrender.com/api/tariffs-full')
      setAllData(response.data)
      const cityList = response.data.map((c: CityData) => ({
        slug: c.slug,
        name: c.meta?.name || c.slug
      }))
      setCities(cityList)
    } catch (error) {
      console.error('Ошибка при загрузке городов:', error)
      setErrorMessage('❌ Ошибка при загрузке данных')
      setTimeout(() => setErrorMessage(''), 4000)
    } finally {
      setLoadingStates(prev => ({...prev, cities: false}))
    }
  }

  // Фильтрация городов
  const filteredCities = cities.filter(city =>
    city.name.toLowerCase().includes(citySearch.toLowerCase())
  )

  // Загрузка тарифов при изменении города/сервиса
  useEffect(() => {
    if (selectedCity && selectedService) {
      setLoadingStates(prev => ({...prev, tariffs: true}))
      const found = allData.find((c: CityData) => c.slug === selectedCity)
      const list = found?.services?.[selectedService]?.tariffs || []
      setTariffs(list)
      setLoadingStates(prev => ({...prev, tariffs: false}))
    } else {
      setTariffs([])
    }
  }, [selectedCity, selectedService, allData])

  // Авторизация
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    setLoadingStates(prev => ({...prev, loggingIn: true}))
    try {
      const response = await axios.post('https://rtk-backend-4m0e.onrender.com/api/login', loginData)
      if (response.data.success) {
        setIsLoggedIn(true)
        localStorage.setItem('rtk_admin_auth', response.data.token)
        await fetchCities()
      } else {
        setLoginError("Неверный логин или пароль")
      }
    } catch (error) {
      setLoginError("Ошибка при входе")
    } finally {
      setLoadingStates(prev => ({...prev, loggingIn: false}))
    }
  }

  // Выход
  const handleLogout = () => {
    setIsLoggedIn(false)
    localStorage.removeItem('rtk_admin_auth')
    setCities([])
    setAllData([])
    setSelectedCity('')
    setSelectedService('')
  }

  // Работа с тарифами
  const handleCheckboxChange = (id: number) => {
    setSelectedTariffs(prev => {
      const updated = new Set(prev)
      updated.has(id) ? updated.delete(id) : updated.add(id)
      return updated
    })
  }

  const showMessage = (msg: string) => {
    setSuccessMessage(msg)
    setTimeout(() => setSuccessMessage(''), 4000)
  }

  const startEditing = (t: Tariff) => {
    setEditingId(t.id)
    setEditForm({ ...t })
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditForm({})
  }

  const handleEditChange = (key: string, value: any) => {
    setEditForm(prev => ({ ...prev, [key]: value }))
  }

  const handleUpdateTariff = async (id: number) => {
    if (!selectedCity || !selectedService) return
    
    setLoadingStates(prev => ({...prev, updating: true}))
    try {
      await axios.put(
        `https://rtk-backend-4m0e.onrender.com/api/tariffs/${selectedCity}/${selectedService}/${id}`,
        editForm
      )
      await fetchCities()
      cancelEditing()
      showMessage('✅ Тариф успешно обновлён')
    } catch (error) {
      console.error('Ошибка при обновлении тарифа:', error)
      setErrorMessage('❌ Ошибка при обновлении тарифа')
      setTimeout(() => setErrorMessage(''), 4000)
    } finally {
      setLoadingStates(prev => ({...prev, updating: false}))
    }
  }

  const handleDelete = async (id: number) => {
    if (!selectedCity || !selectedService) return
    
    setLoadingStates(prev => ({...prev, deleting: true}))
    try {
      await axios.delete(
        `https://rtk-backend-4m0e.onrender.com/api/tariffs/${selectedCity}/${selectedService}/${id}`
      )
      await fetchCities()
      showMessage('🗑️ Тариф удалён')
    } catch (error) {
      console.error('Ошибка при удалении тарифа:', error)
      setErrorMessage('❌ Не удалось удалить тариф')
      setTimeout(() => setErrorMessage(''), 4000)
    } finally {
      setLoadingStates(prev => ({...prev, deleting: false}))
    }
  }

  // Массовые операции
  const handleMassDelete = async () => {
    if (selectedTariffs.size === 0) {
      setErrorMessage('Выберите хотя бы один тариф для удаления.')
      setTimeout(() => setErrorMessage(''), 4000)
      return
    }

    setLoadingStates(prev => ({...prev, massOperation: true}))
    try {
      const tariffIds = Array.from(selectedTariffs).map(id => String(id))
      await axios.delete('https://rtk-backend-4m0e.onrender.com/api/tariffs/mass-delete', {
        data: { city: selectedCity, service: selectedService, tariffs: tariffIds }
      })
      await fetchCities()
      setSelectedTariffs(new Set())
      showMessage('🗑️ Выбранные тарифы удалены')
    } catch (error) {
      console.error('Ошибка при массовом удалении:', error)
      setErrorMessage('❌ Ошибка при удалении тарифов')
      setTimeout(() => setErrorMessage(''), 4000)
    } finally {
      setLoadingStates(prev => ({...prev, massOperation: false}))
    }
  }
const handleExcelImport = async (file: File) => {
    if (!file) return
    
    // Сбрасываем состояние импорта
    setImportProgress({
      current: 0,
      total: 0,
      processedCities: 0,
      totalCities: 0,
      status: 'processing'
    })
    setImportResults({
      success: 0,
      failed: 0,
      errors: []
    })
    
    // Создаем AbortController для возможности прервать импорт
    abortControllerRef.current = new AbortController()
    
    try {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data)
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' }) as any[]
      
      // Группируем данные по городам и категориям
      const grouped: Record<string, CityData> = {}
      
      for (const row of rows) {
        const city = row['Город']?.trim() || 'неизвестно'
        const region = row['Регион']?.trim() || ''
        const category = (row['Категория'] || 'internet').trim()

        if (!grouped[city]) {
          grouped[city] = {
            slug: city.toLowerCase().replace(/\s+/g, '-'),
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
  // Обработка скидки:
  discountPrice: (row['Процент скидки'] === '100%') ? 0 : parseInt(row['Цена со скидкой']) || undefined,
  discountPeriod: row['Период скидки'] || '',
  discountPercentage: parseOptionalPercent(row['Процент скидки']) || undefined,
  connectionPrice: parseInt(row['Цена подключения']) || 0,
  tvChannels: parseInt(row['Количество ТВ каналов']) || undefined,
  mobileData: parseInt(row['Мобильные данные']) || undefined,
  mobileMinutes: parseInt(row['Мобильные минуты']) || undefined,
  buttonColor: (row['Цвет кнопки'] || '').toLowerCase() || 'orange',
  isHit: row['Признак хита']?.toLowerCase() === 'да',
  features
};

        grouped[city].services[category].tariffs.push(tariff)
      }
      
      // Подсчитываем общее количество тарифов
      let totalTariffs = 0
      Object.values(grouped).forEach(city => {
        Object.values(city.services).forEach(service => {
          totalTariffs += service.tariffs.length
        })
      })
      
      setImportProgress(prev => ({
        ...prev,
        total: totalTariffs,
        totalCities: Object.keys(grouped).length
      }))
      
      // Отправляем данные чанками
      const cityKeys = Object.keys(grouped)
      let successCount = 0
      let failedCount = 0
      const errors: string[] = []
      
      for (let i = 0; i < cityKeys.length; i++) {
        if (abortControllerRef.current?.signal.aborted) break
        
        const cityKey = cityKeys[i]
        const cityData = grouped[cityKey]
        
        // Разбиваем тарифы города на чанки
        const serviceKeys = Object.keys(cityData.services)
        for (const serviceKey of serviceKeys) {
          const service = cityData.services[serviceKey]
          const tariffs = service.tariffs
          
          // Разбиваем на чанки
          for (let j = 0; j < tariffs.length; j += IMPORT_CONFIG.chunkSize) {
            if (abortControllerRef.current?.signal.aborted) break
            
            const chunk = tariffs.slice(j, j + IMPORT_CONFIG.chunkSize)
            const chunkData = {
              [cityKey]: {
                ...cityData,
                services: {
                  [serviceKey]: {
                    ...service,
                    tariffs: chunk
                  }
                }
              }
            }
            
            try {
              await axios.post('https://rtk-backend-4m0e.onrender.com/api/upload-tariffs', chunkData, {
                signal: abortControllerRef.current?.signal,
                timeout: 30000
              })
              
              successCount += chunk.length
              setImportResults(prev => ({
                ...prev,
                success: prev.success + chunk.length
              }))
            } catch (error: any) {
              failedCount += chunk.length
              const errorMsg = `Ошибка при загрузке чанка ${j / IMPORT_CONFIG.chunkSize + 1}: ${error.message}`
              errors.push(errorMsg)
              
              setImportResults(prev => ({
                ...prev,
                failed: prev.failed + chunk.length,
                errors: [...prev.errors, errorMsg]
              }))
              
              // Если сервер вернул 413, предлагаем уменьшить размер чанка
              if (error.response?.status === 413) {
                errors.push('Слишком большой чанк. Попробуйте уменьшить размер чанка в настройках импорта.')
              }
            }
            
            // Обновляем прогресс
            setImportProgress(prev => ({
              ...prev,
              current: prev.current + chunk.length
            }))
            
            // Добавляем задержку между чанками чтобы не перегружать сервер
            if (j + IMPORT_CONFIG.chunkSize < tariffs.length) {
              await new Promise(resolve => setTimeout(resolve, IMPORT_CONFIG.delayBetweenChunks))
            }
          }
        }
        
        // Обновляем счетчик обработанных городов
        setImportProgress(prev => ({
          ...prev,
          processedCities: prev.processedCities + 1
        }))
      }
      
      // Финальное состояние
      setImportProgress(prev => ({
        ...prev,
        status: abortControllerRef.current?.signal.aborted ? 'idle' : 'completed'
      }))
      
      // Показываем результаты
      if (!abortControllerRef.current?.signal.aborted) {
        if (failedCount === 0) {
          showMessage(`✅ Успешно импортировано ${successCount} тарифов`)
        } else {
          setErrorMessage(`Импорт завершен с ошибками. Успешно: ${successCount}, Ошибок: ${failedCount}`)
          setTimeout(() => setErrorMessage(''), 7000)
        }
        
        // Обновляем данные
        await fetchCities()
      }
      
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Ошибка при обработке файла:', error)
        setImportProgress(prev => ({ ...prev, status: 'error' }))
        setImportResults(prev => ({
          ...prev,
          failed: prev.failed + 1,
          errors: [...prev.errors, `Ошибка обработки файла: ${error.message}`]
        }))
        setErrorMessage('❌ Ошибка при обработке Excel файла')
        setTimeout(() => setErrorMessage(''), 5000)
      }
    } finally {
      abortControllerRef.current = null
    }
  }

  // Функция для отмены импорта
  const cancelImport = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      setImportProgress(prev => ({ ...prev, status: 'idle' }))
      setErrorMessage('Импорт отменен')
      setTimeout(() => setErrorMessage(''), 3000)
    }
  }
  const handleMassHide = async (hidden: boolean) => {
    if (selectedTariffs.size === 0) {
      setErrorMessage('Выберите хотя бы один тариф')
      setTimeout(() => setErrorMessage(''), 4000)
      return
    }

    setLoadingStates(prev => ({...prev, massOperation: true}))
    try {
      const tariffIds = Array.from(selectedTariffs).map(id => String(id))
      await axios.patch('https://rtk-backend-4m0e.onrender.com/api/tariffs/mass-hide', {
        city: selectedCity,
        service: selectedService,
        tariffs: tariffIds,
        hidden
      })
      await fetchCities()
      showMessage(hidden ? '🙈 Тарифы скрыты' : '👁️ Тарифы показаны')
    } catch (error) {
      console.error('Ошибка при массовом скрытии:', error)
      setErrorMessage('❌ Ошибка при обновлении тарифов')
      setTimeout(() => setErrorMessage(''), 4000)
    } finally {
      setLoadingStates(prev => ({...prev, massOperation: false}))
    }
  }

  // Добавление тарифа
 const handleAddTariff = async () => {
  if (!selectedCity || !selectedService) return
  
  setLoadingStates(prev => ({...prev, updating: true}))
  try {
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
  connectionPrice: 0, 
  buttonColor: 'orange',
  isHit: false,
  features: [],
  tvChannels: 0,
  mobileData: 0,
  mobileMinutes: 0
}
    await axios.post(
      `https://rtk-backend-4m0e.onrender.com/api/tariffs/${selectedCity}/${selectedService}`,
      newTariff
    )
    
    // Полностью обновляем данные после добавления
    const response = await axios.get('https://rtk-backend-4m0e.onrender.com/api/tariffs-full')
    setAllData(response.data)
    
    showMessage('✅ Тариф добавлен')
  } catch (error) {
    console.error('Ошибка при добавлении тарифа:', error)
    setErrorMessage('❌ Ошибка при добавлении тарифа')
    setTimeout(() => setErrorMessage(''), 4000)
  } finally {
    setLoadingStates(prev => ({...prev, updating: false}))
  }
}
  // Форма входа
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
                onChange={(e) => setLoginData({...loginData, login: e.target.value})}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block mb-2">Пароль:</label>
              <input
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loadingStates.loggingIn}
              className={`w-full bg-blue-500 text-white py-2 rounded flex justify-center items-center ${
                loadingStates.loggingIn ? 'opacity-70' : 'hover:bg-blue-600'
              }`}
            >
              {loadingStates.loggingIn ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" />
                  </svg>
                  Вход...
                </>
              ) : 'Войти'}
            </button>
            {loadingStates.loggingIn && (
              <div className="mt-4">
                <LoadingProgress duration={API_DELAY_ESTIMATE.login} />
              </div>
            )}
          </form>
        </div>
      </div>
    )
  }

  // Основной интерфейс
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Хедер */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Админ-панель управления тарифами</h1>
            <p className="text-gray-600">Ростелеком - управление тарифными планами</p>
          </div>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
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

      {/* Лоадер загрузки городов */}
      {loadingStates.cities && (
        <div className="mb-6 p-4 bg-white rounded-lg shadow">
          <p className="text-sm text-gray-600 mb-2">Загрузка списка городов...</p>
          <LoadingProgress duration={API_DELAY_ESTIMATE.fetch} />
        </div>
      )}

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
                onChange={(e) => setCitySearch(e.target.value)}
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
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              disabled={loadingStates.cities}
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
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                disabled={loadingStates.cities}
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

      {/* Лоадер для массовых операций */}
      {loadingStates.massOperation && (
        <div className="my-4 p-4 bg-white rounded-lg shadow">
          <p className="text-sm text-gray-600 mb-2">Выполняем операцию...</p>
          <LoadingProgress duration={API_DELAY_ESTIMATE.mass} />
        </div>
      )}

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
                disabled={loadingStates.updating}
                className={`flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg transition-colors ${
                  loadingStates.updating ? 'opacity-70' : 'hover:bg-purple-700'
                }`}
              >
                {loadingStates.updating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" />
                    </svg>
                    Добавление...
                  </>
                ) : (
                  <>
                    <span className="mr-1">+</span> Добавить тариф
                  </>
                )}
              </button>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleMassHide(true)}
                  disabled={loadingStates.massOperation}
                  className={`px-4 py-2 bg-yellow-500 text-white rounded-lg transition-colors ${
                    loadingStates.massOperation ? 'opacity-70' : 'hover:bg-yellow-600'
                  }`}
                >
                  Скрыть выбранные
                </button>
                <button
                  onClick={() => handleMassHide(false)}
                  disabled={loadingStates.massOperation}
                  className={`px-4 py-2 bg-green-500 text-white rounded-lg transition-colors ${
                    loadingStates.massOperation ? 'opacity-70' : 'hover:bg-green-600'
                  }`}
                >
                  Показать выбранные
                </button>
                <button
                  onClick={handleMassDelete}
                  disabled={loadingStates.massOperation}
                  className={`px-4 py-2 bg-red-500 text-white rounded-lg transition-colors ${
                    loadingStates.massOperation ? 'opacity-70' : 'hover:bg-red-600'
                  }`}
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
          {loadingStates.tariffs ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
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
                <tbody>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </tbody>
              </table>
            </div>
          ) : tariffs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        onChange={(e) => {
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
                              onChange={(e) =>
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
                                disabled={loadingStates.updating}
                                className="text-green-600 hover:text-green-900"
                              >
                                {loadingStates.updating ? 'Сохранение...' : 'Сохранить'}
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
                                disabled={loadingStates.deleting}
                                className="text-red-600 hover:text-red-900"
                              >
                                {loadingStates.deleting ? 'Удаление...' : 'Удалить'}
                              </button>
                              <button
                                onClick={async () => {
                                  try {
                                    setLoadingStates(prev => ({...prev, updating: true}))
                                    await axios.patch(
                                      `https://rtk-backend-4m0e.onrender.com/api/tariffs/${selectedCity}/${selectedService}/${t.id}/hide`,
                                      { hidden: !t.hidden }
                                    )
                                    await fetchCities()
                                    showMessage(t.hidden ? '👁️ Тариф снова отображается' : '🙈 Тариф скрыт')
                                  } catch {
                                    setErrorMessage('❌ Не удалось изменить видимость тарифа')
                                    setTimeout(() => setErrorMessage(''), 4000)
                                  } finally {
                                    setLoadingStates(prev => ({...prev, updating: false}))
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
   <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Импорт тарифов из Excel</h3>
            <p className="text-sm text-gray-500">
              Загрузите файл Excel для массового обновления тарифов. 
              Большие файлы будут обработаны частями.
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Размер чанка: {IMPORT_CONFIG.chunkSize} тарифов, 
              Задержка: {IMPORT_CONFIG.delayBetweenChunks}мс
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <label className="block">
              <span className="sr-only">Выберите файл Excel</span>
              <input 
                type="file" 
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    await handleExcelImport(file)
                  }
                }}
                accept=".xlsx,.xls,.csv"
                disabled={importProgress.status === 'processing'}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-purple-50 file:text-purple-700
                  hover:file:bg-purple-100
                  disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </label>
            
            {importProgress.status === 'processing' && (
              <button
                onClick={cancelImport}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Отменить импорт
              </button>
            )}
          </div>
          
          {/* Прогресс импорта */}
          {(importProgress.status === 'processing' || importProgress.status === 'completed') && (
            <div className="mt-4 space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-blue-700">
                    {importProgress.status === 'processing' ? 'Импорт данных...' : 'Импорт завершен!'}
                  </span>
                  <span className="text-sm font-medium text-blue-700">
                    {importProgress.current} / {importProgress.total} тарифов
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                    style={{ 
                      width: `${importProgress.total > 0 ? (importProgress.current / importProgress.total) * 100 : 0}%` 
                    }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Городы: {importProgress.processedCities} / {importProgress.totalCities}
                </div>
              </div>
              
              {/* Результаты импорта */}
              {importProgress.status === 'completed' && (
                <div className={`p-3 rounded-lg ${
                  importResults.failed === 0 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  <p className="font-medium">
                    {importResults.failed === 0 
                      ? '✅ Все тарифы успешно импортированы' 
                      : `⚠️ Импорт завершен с ошибками`}
                  </p>
                  <p className="text-sm mt-1">
                    Успешно: {importResults.success}, Ошибок: {importResults.failed}
                  </p>
                  
                  {importResults.errors.length > 0 && (
                    <details className="mt-2 text-xs">
                      <summary>Показать ошибки</summary>
                      <ul className="mt-1 space-y-1">
                        {importResults.errors.slice(0, 5).map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                        {importResults.errors.length > 5 && (
                          <li>... и еще {importResults.errors.length - 5} ошибок</li>
                        )}
                      </ul>
                    </details>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}