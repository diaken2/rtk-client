import React from 'react';
import { FiX } from 'react-icons/fi';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

interface MobileFiltersDrawerProps {
  open: boolean;
  onClose: () => void;
  filters: any;
  onFiltersChange: (changes: any) => void;
  onApply: () => void;
  onClear: () => void;
}

const MobileFiltersDrawer: React.FC<MobileFiltersDrawerProps> = ({
  open,
  onClose,
  filters,
  onFiltersChange,
  onApply,
  onClear,
}) => {
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${open ? 'translate-y-0' : 'translate-y-full pointer-events-none'}`}
      >
        <div className="p-4 max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6 sticky top-0 bg-white py-2">
            <h3 className="text-xl font-bold">Все фильтры</h3>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
              <FiX size={24} />
            </button>
          </div>

          <div className="mb-6">
            <h4 className="font-semibold mb-3 text-lg">Услуги</h4>
            <div className="space-y-3">
              {[
                { key: 'internet', label: 'Интернет' },
                { key: 'tv', label: 'ТВ' },
                { key: 'mobile', label: 'Мобильная связь' },
                { key: 'onlineCinema', label: 'Онлайн-кинотеатры' },
                { key: 'gameBonuses', label: 'Игровые бонусы' },
              ].map((item) => (
                <label key={item.key} className="flex items-center py-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters[item.key]}
                    onChange={() =>
                      onFiltersChange({
                        [item.key]: !filters[item.key],
                      })
                    }
                    className="form-checkbox h-5 w-5 text-orange-500 rounded"
                  />
                  <span className="ml-3 text-base">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-semibold mb-3 text-lg">Спецпредложения</h4>
            <div className="space-y-3">
              {[
                { key: 'promotions', label: '% Акции' },
                { key: 'hitsOnly', label: 'Только хиты' },
              ].map((item) => (
                <label key={item.key} className="flex items-center py-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters[item.key]}
                    onChange={() =>
                      onFiltersChange({
                        [item.key]: !filters[item.key],
                      })
                    }
                    className="form-checkbox h-5 w-5 text-orange-500 rounded"
                  />
                  <span className="ml-3 text-base">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-semibold mb-3 text-lg">Куда подключать</h4>
            <div className="space-y-3">
              <label className="flex items-center py-2 cursor-pointer">
                <input
                  type="radio"
                  name="connectionType"
                  checked={filters.connectionType === 'apartment'}
                  onChange={() => onFiltersChange({ connectionType: 'apartment' })}
                  className="form-radio h-5 w-5 text-orange-500"
                />
                <span className="ml-3 text-base">В квартиру</span>
              </label>
              <label className="flex items-center py-2 cursor-pointer">
                <input
                  type="radio"
                  name="connectionType"
                  checked={filters.connectionType === 'house'}
                  onChange={() => onFiltersChange({ connectionType: 'house' })}
                  className="form-radio h-5 w-5 text-orange-500"
                />
                <span className="ml-3 text-base">В частный дом</span>
              </label>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-semibold mb-3 text-lg">Стоимость в месяц (₽)</h4>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>{filters.priceRange[0]}</span>
              <span>{filters.priceRange[1]}</span>
            </div>
            <Slider
              range
              min={300}
              max={1700}
              value={filters.priceRange}
              onChange={(value) => Array.isArray(value) && onFiltersChange({ priceRange: value })}
              trackStyle={[{ backgroundColor: '#FF6600' }]}
              handleStyle={[{ borderColor: '#FF6600', backgroundColor: '#FF6600' }, { borderColor: '#FF6600', backgroundColor: '#FF6600' }]}
              railStyle={{ backgroundColor: '#eee' }}
            />
          </div>

          <div className="mb-6">
            <h4 className="font-semibold mb-3 text-lg">Скорость (Мбит/с)</h4>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>{filters.speedRange[0]}</span>
              <span>{filters.speedRange[1]}</span>
            </div>
            <Slider
              range
              min={50}
              max={1000}
              value={filters.speedRange}
              onChange={(value) => Array.isArray(value) && onFiltersChange({ speedRange: value })}
              trackStyle={[{ backgroundColor: '#FF6600' }]}
              handleStyle={[{ borderColor: '#FF6600', backgroundColor: '#FF6600' }, { borderColor: '#FF6600', backgroundColor: '#FF6600' }]}
              railStyle={{ backgroundColor: '#eee' }}
            />
          </div>

          <div className="sticky bottom-0 bg-white pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onClear}
                className="py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
              >
                Очистить
              </button>
              <button
                onClick={onApply}
                className="py-3 px-4 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600"
              >
                Применить
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileFiltersDrawer;
